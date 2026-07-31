import { getServerSession } from "next-auth";
import { getDynamicAuthOptions } from "./next-auth-options";

const getHeaders = async () => {
  const authOptions = await getDynamicAuthOptions();
  const session = await getServerSession(authOptions);
  const token = session?.user?.token;

  const header = {
    Accept: "application/json",
    "Content-Type": "application/json",
    authorization: token ? `Bearer ${token}` : null,
  };
  return header;
};

const getUserServerSession = async () => {
  const authOptions = await getDynamicAuthOptions();
  const session = await getServerSession(authOptions);

  const userInfo = session?.user || null;
  return userInfo;
};

/**
 * Get auth token from next-auth session
 * Use this in server actions instead of reading from cookies
 */
const getAuthToken = async () => {
  const authOptions = await getDynamicAuthOptions();
  const session = await getServerSession(authOptions);
  return session?.user?.token || null;
};

/**
 * Get the full session from next-auth
 * Use this when you need user info like _id, email, etc.
 */
const getAuthSession = async () => {
  const authOptions = await getDynamicAuthOptions();
  const session = await getServerSession(authOptions);
  return session;
};

/**
 * Check if user is authenticated via next-auth
 */
const isUserAuthenticated = async () => {
  const authOptions = await getDynamicAuthOptions();
  const session = await getServerSession(authOptions);
  return !!session?.user;
};

export {
  getHeaders,
  getUserServerSession,
  getAuthToken,
  getAuthSession,
  isUserAuthenticated,
};

// import NextAuth from "next-auth";
// import Facebook from "next-auth/providers/facebook";
// import GitHub from "next-auth/providers/github";
// import Google from "next-auth/providers/google";
// import Credentials from "next-auth/providers/credentials";

// //internal imports
// import {
//   loginCustomer,
//   signUpWithOauthProvider,
// } from "@services/CustomerServices";
// import { getStoreSetting } from "@services/SettingServices";

// // Fetch provider credentials dynamically
// const getProviders = async () => {
//   const { storeSetting } = await getStoreSetting();

//   // console.log("storeSetting", storeSetting?.github_secret);

//   return [
//     Google({
//       clientId: storeSetting?.google_id || "",
//       clientSecret: storeSetting?.google_secret || "",
//     }),
//     GitHub({
//       clientId: storeSetting?.github_id || "",
//       clientSecret: storeSetting?.github_secret || "",
//     }),
//     Facebook({
//       clientId: storeSetting?.facebook_id || "",
//       clientSecret: storeSetting?.facebook_secret || "",
//     }),
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       authorize: async (credentials) => {
//         const { userInfo, error } = await loginCustomer(credentials);
//         if (error) {
//           throw new Error(error);
//         }
//         return userInfo;
//       },
//     }),
//   ];
// };

// export const authOptions = {
//   providers: await getProviders(),
//   // pages: {
//   //   signIn: "/auth/signup", // Display a sign-in page at this URL
//   //   // You can define other custom pages as needed
//   // },
//   callbacks: {
//     async signIn({ user, account }) {
//       if (account.provider !== "credentials") {
//         try {
//           const { res, error } = await signUpWithOauthProvider(user);

//           if (error) {
//             console.error("OAuth sign-in error:", error);
//             return false;
//           }

//           if (res.token) {
//             user.token = res.token;
//             user._id = res._id;
//             user.address = res.address;
//             user.phone = res.phone;
//             user.image = res.image;
//           } else {
//             console.error("OAuth sign-in: No token received");
//             return false;
//           }
//         } catch (error) {
//           console.error("OAuth sign-in exception:", error);
//           return false;
//         }
//       }
//       return true;
//     },
//     // async redirect({ url, baseUrl }) {
//     //   console.log("url", url, "baseUrl", baseUrl);
//     //   return baseUrl;
//     // },

//     async jwt({ token, user, trigger, session }) {
//       if (user) {
//         token.id = user._id;
//         token.name = user.name;
//         token.email = user.email;
//         token.address = user.address;
//         token.phone = user.phone;
//         token.image = user.image;
//         token.token = user.token;
//       }

//       if (trigger === "update" && session) {
//         return {
//           ...token,
//           ...session.user,
//         };
//       }

//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.id;
//       session.user.name = token.name;
//       session.user.email = token.email;
//       session.user.address = token.address;
//       session.user.phone = token.phone;
//       session.user.image = token.image;
//       session.user.token = token.token;

//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
// };

// export const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
