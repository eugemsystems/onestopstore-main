"use client";

import Link from "next/link";
import { FiLock, FiMail, FiPhone, FiUser } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import Image from "next/image";

//internal import
import Error from "@components/form/Error";
import InputArea from "@components/form/InputArea";
import { notifyError } from "@utils/toast";
import BottomNavigation from "@components/login/BottomNavigation";
import AuthButton from "@components/form/AuthButton";
import { useSetting } from "@context/SettingContext";
import OtpLogin from "@components/login/OtpLogin";
import { isPhoneOtpEnabled } from "@utils/authSettings";

// Password strength calculation
const calculatePasswordStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "bg-muted" };

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2)
    return {
      level: 1,
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-500",
    };
  if (score <= 3)
    return {
      level: 2,
      label: "Fair",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    };
  if (score <= 4)
    return {
      level: 3,
      label: "Good",
      color: "bg-emerald-500",
      textColor: "text-emerald-500",
    };
  return {
    level: 4,
    label: "Strong",
    color: "bg-emerald-600",
    textColor: "text-emerald-600",
  };
};

// Laravel's /register requires phone + a minimum password length (matches
// the legacy RegisterForm.jsx's Yup schema: name, email, password, phone).
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  phone: z
    .string()
    .min(9, { message: "Phone number must be at least 9 digits" })
    .regex(/^\d+$/, { message: "Phone must only contain digits" }),
});

const SignUp = () => {
  const router = useRouter();
  const { globalSetting, storeSetting, storeCustomization } =
    useSetting() || {};
  // Settings-dependent UI is revealed only after mount so the first client
  // render matches the server output (prevents hydration mismatches when the
  // settings context is briefly unavailable during cache revalidation).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const phoneOtpEnabled = mounted && isPhoneOtpEnabled(storeSetting);
  const colorLogo =
    storeCustomization?.footer?.block4_logo || "/logo/logo-color.svg";
  const [loading, setLoading] = useState(false);
  const [signupMethod, setSignupMethod] = useState("email"); // "email" | "otp"

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });
  const password = watch("password");
  const passwordStrength = calculatePasswordStrength(password);

  const submitHandler = async ({ name, email, password, phone }) => {
    setLoading(true);
    // Registration goes through next-auth's Credentials provider (registerMode)
    // so the session it creates is established exactly like login's — Laravel
    // creates the account immediately on /register, no email-token round trip.
    const result = await signIn("credentials", {
      redirect: false,
      registerMode: "1",
      name,
      email,
      password,
      phone,
      callbackUrl: "/user/dashboard",
    });

    setLoading(false);

    if (result?.error) {
      notifyError(result.error);
    } else if (result?.ok) {
      router.push(result.url || "/user/dashboard");
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row bg-background">
        {/* Left Side: Background Image Area (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1632406897798-e5472b4a989e?q=80"
            alt="Signup Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
          <div className="max-w-md w-full">
            {/* Logo */}
            <div className="mb-8">
              <Link href="/" className="inline-block relative h-10 w-40">
                <Image
                  src={colorLogo}
                  alt={globalSetting?.shop_name || "Kacha Bazar"}
                  fill
                  className="object-contain object-left"
                />
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-primary font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>

            {/* Signup Method Toggle — only when Mobile OTP is enabled in Admin */}
            {phoneOtpEnabled && (
              <div className="flex mb-6 border-b border-border">
                <button
                  type="button"
                  onClick={() => setSignupMethod("email")}
                  className={`flex-1 pb-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    signupMethod === "email"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setSignupMethod("otp")}
                  className={`flex-1 pb-2 text-sm font-semibold transition-all duration-200 border-b-2 ${
                    signupMethod === "otp"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  OTP Sign Up
                </button>
              </div>
            )}

            {!phoneOtpEnabled || signupMethod === "email" ? (
              <form
                onSubmit={handleSubmit(submitHandler)}
                className="space-y-6"
              >
                <div>
                  <InputArea
                    register={register}
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    Icon={FiUser}
                  />
                  <Error errorMessage={errors.name} />
                </div>

                <div>
                  <InputArea
                    register={register}
                    label="Email Address"
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
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    placeholder="771234567"
                    Icon={FiPhone}
                  />
                  <Error errorMessage={errors.phone} />
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

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-muted-foreground font-medium">
                          Strength
                        </span>
                        <span
                          className={`text-xs font-semibold ${passwordStrength.textColor}`}
                        >
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              level <= passwordStrength.level
                                ? passwordStrength.color
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <Error errorMessage={errors.password} />
                </div>

                <AuthButton
                  type="submit"
                  loading={loading}
                  loadingText="Signing Up..."
                  className="h-12 w-full text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none transition-colors disabled:opacity-70 mt-4 block"
                >
                  Sign Up
                </AuthButton>
              </form>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-6 font-medium">
                  Sign up instantly using your phone or email OTP.
                </p>
                <OtpLogin
                  redirectUrl="/user/dashboard"
                  phoneOtpEnabled={phoneOtpEnabled}
                />
              </div>
            )}

            <div className="mt-8">
              <BottomNavigation
                or={!phoneOtpEnabled || signupMethod === "email"}
                storeSetting={mounted ? storeSetting : undefined}
                route="/auth/login"
                pageName="Login"
                loginTitle="Sign Up"
                hideSignupText={true}
              />
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-muted-foreground mt-8">
              By signing up, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
