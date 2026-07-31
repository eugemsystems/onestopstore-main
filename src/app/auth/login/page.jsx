"use client";

import { FiLock, FiMail } from "react-icons/fi";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

//internal imports
import { notifyError } from "@utils/toast";
import Error from "@components/form/Error";
import InputArea from "@components/form/InputArea";
import BottomNavigation from "@components/login/BottomNavigation";
import ShowToast from "@components/common/ShowToast";
import OtpLogin from "@components/login/OtpLogin";
import { useSetting } from "@context/SettingContext";
import { isPhoneOtpEnabled } from "@utils/authSettings";
import Image from "next/image";
import GoogleRecaptcha from "@components/common/GoogleRecaptcha";

// Zod validation schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const LoginForm = () => {
  const router = useRouter();
  const { globalSetting, storeSetting, storeCustomization } =
    useSetting() || {};
  const colorLogo =
    storeCustomization?.footer?.block4_logo || "/logo/logo-color.svg";
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password"); // "password" | "otp"
  const [recaptchaToken, setRecaptchaToken] = useState("");
  // Settings-dependent UI is revealed only after mount so the first client
  // render matches the server output (prevents hydration mismatches when the
  // settings context is briefly unavailable during cache revalidation).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const phoneOtpEnabled = mounted && isPhoneOtpEnabled(storeSetting);
  const recaptchaEnabled = mounted && !!storeSetting?.google_recaptcha?.status;
  const redirectUrl = useSearchParams().get("redirectUrl") || "/user/dashboard";
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const submitHandler = async ({ email, password }) => {
    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      recaptcha: recaptchaToken,
      callbackUrl: redirectUrl || "/",
    });

    setLoading(false);

    if (result?.error) {
      notifyError(result?.error);
    } else if (result?.ok) {
      router.push(result.url);
    }
  };

  return (
    <>
      <ShowToast />
      <div className="min-h-screen flex flex-col lg:flex-row bg-background">
        {/* Left Side: Background Image Area (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1632406897798-e5472b4a989e?q=80"
            alt="Workspace Background"
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative">
          <div className="max-w-md w-full">
            {/* Logo */}
            <div className="mb-8">
              <Link href="/" className="inline-block h-10 w-40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={colorLogo}
                  alt={globalSetting?.shop_name || "Kacha Bazar"}
                  className="h-10 w-auto max-w-40 object-contain object-left"
                  suppressHydrationWarning
                />
              </Link>
            </div>

            {/* Headers */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Login Method Toggle — only when Mobile OTP is enabled in Admin */}
            {phoneOtpEnabled && (
              <div className="flex mb-6 border-b border-border">
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className={`flex-1 pb-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    loginMethod === "password"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("otp")}
                  className={`flex-1 pb-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    loginMethod === "otp"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  OTP Login
                </button>
              </div>
            )}

            {!phoneOtpEnabled || loginMethod === "password" ? (
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="space-y-6"
              >
                <div>
                  <InputArea
                    register={register}
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    Icon={FiMail}
                  />
                  <Error errorMessage={errors.email} />
                </div>

                <div>
                  <InputArea
                    register={register}
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    Icon={FiLock}
                  />
                  <Error errorMessage={errors.password} />
                </div>

                {recaptchaEnabled && (
                  <GoogleRecaptcha
                    siteKey={storeSetting?.google_recaptcha?.site_key}
                    onChange={setRecaptchaToken}
                  />
                )}

                <div className="flex items-center justify-start mt-2">
                  <a
                    href="/auth/forget-password"
                    className="text-sm font-semibold text-primary hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full py-3 px-4 font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors disabled:opacity-70 mt-4"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>
            ) : (
              <OtpLogin
                redirectUrl={redirectUrl}
                phoneOtpEnabled={phoneOtpEnabled}
              />
            )}

            <div className="mt-8">
              <BottomNavigation
                or={!phoneOtpEnabled || loginMethod === "password"}
                storeSetting={mounted ? storeSetting : undefined}
                route="/auth/signup"
                pageName="Sign Up"
                loginTitle="Login"
                hideSignupText={true}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Login = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
};

export default Login;
