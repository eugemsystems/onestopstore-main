// dynamicSettings.js

import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";
import {
  loginCustomer,
  signUpWithOauthProvider,
  verifyOtpAndLogin,
} from "@services/CustomerServices";
import { laravelRegister } from "@services/LaravelAuth";
import { getStoreSecretKeys } from "@services/SettingServices";
import { getBaseURL, resilientFetch } from "@services/CommonService";
import {
  isFacebookLoginEnabled,
  isGithubLoginEnabled,
  isGoogleLoginEnabled,
} from "@utils/authSettings";

async function refreshAccessToken(token) {
  const apiBase = getBaseURL();

  try {
    const response = await resilientFetch(`${apiBase}/customer/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    return {
      ...token,
      token: refreshedTokens.accessToken,
      accessTokenExpires: Date.now() + refreshedTokens.expiresIn * 1000,
      refreshToken: refreshedTokens.refreshToken ?? token.refreshToken,
    };
  } catch (error) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const getDynamicAuthOptions = async () => {
  const { storeSetting } = await getStoreSecretKeys();

  const providers = [];

  if (isGoogleLoginEnabled(storeSetting, { requireCredentials: true })) {
    providers.push(
      Google({
        clientId: storeSetting.google_id,
        clientSecret: storeSetting.google_secret,
      }),
    );
  }

  if (isGithubLoginEnabled(storeSetting, { requireCredentials: true })) {
    providers.push(
      GitHub({
        clientId: storeSetting.github_id,
        clientSecret: storeSetting.github_secret,
      }),
    );
  }

  if (isFacebookLoginEnabled(storeSetting, { requireCredentials: true })) {
    providers.push(
      Facebook({
        clientId: storeSetting.facebook_id,
        clientSecret: storeSetting.facebook_secret,
      }),
    );
  }

  providers.push(
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        recaptcha: { label: "Recaptcha", type: "text" },
        otp: { label: "OTP", type: "text" },
        phone: { label: "Phone", type: "text" },
        name: { label: "Name", type: "text" },
        registerMode: { label: "Register Mode", type: "text" },
      },
      authorize: async (credentials) => {
        // Raines registration creates the account immediately (Laravel's
        // /register has no email-token round trip) — this is the same
        // request the "Sign Up" form submits, just routed through
        // next-auth's Credentials provider so the resulting session is
        // established the identical way login's is.
        if (credentials.registerMode) {
          return laravelRegister({
            name: credentials.name,
            email: credentials.email,
            password: credentials.password,
            phone: credentials.phone,
          });
        }

        if (credentials.otp) {
          const { userInfo, error } = await verifyOtpAndLogin({
            email: credentials.email || undefined,
            phone: credentials.phone || undefined,
            otp: credentials.otp,
          });
          if (error) {
            throw new Error(error);
          }
          return userInfo;
        }

        const { userInfo, error } = await loginCustomer({
          email: credentials.email,
          password: credentials.password,
          recaptcha: credentials.recaptcha || undefined,
        });
        if (error) {
          throw new Error(error);
        }
        return userInfo;
      },
    }),
  );

  const authOptions = {
    providers,
    callbacks: {
      async signIn({ user, account }) {
        if (account.provider !== "credentials") {
          try {
            const { res, error } = await signUpWithOauthProvider({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider,
            });

            if (error) {
              console.error("OAuth sign-in error:", error);
              return false;
            }

            if (res.token) {
              user.token = res.token;
              user.refreshToken = res.refreshToken;
              user.expiresIn = res.expiresIn;
              user._id = res._id;
              user.address = res.address;
              user.phone = res.phone;
              user.image = res.image;
            } else {
              console.error("OAuth sign-in: No token received");
              return false;
            }
          } catch (error) {
            console.error("OAuth sign-in exception:", error);
            return false;
          }
        }
        return true;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user._id;
          token.name = user.name;
          token.email = user.email;
          token.address = user.address;
          token.phone = user.phone;
          token.image = user.image;
          token.token = user.token;
          token.refreshToken = user.refreshToken;
          token.accessTokenExpires =
            Date.now() + (user.expiresIn || 900) * 1000;
        }

        if (trigger === "update" && session) {
          return {
            ...token,
            ...session.user,
          };
        }

        if (Date.now() < token.accessTokenExpires) {
          return token;
        }

        return await refreshAccessToken(token);
      },
      async session({ session, token }) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.token = token.token;
        session.user.refreshToken = token.refreshToken;
        session.error = token.error;

        return session;
      },
      async redirect({ url, baseUrl }) {
        return url.startsWith(baseUrl) ? url : `${baseUrl}/user/dashboard`;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
  };

  return authOptions;
};
