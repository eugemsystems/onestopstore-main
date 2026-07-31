"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiMail, FiLock, FiCheck, FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

//internal import
import ShowToast from "@components/common/ShowToast";
import Error from "@components/form/Error";
import AuthButton from "@components/form/AuthButton";
import { Input } from "@components/ui/input";
import { useSetting } from "@context/SettingContext";
import { notifyError, notifySuccess } from "@utils/toast";

/**
 * Password reset — mirrors the legacy 3-step flow (ForgotPassword ->
 * OTPVerification -> UpdatePassword) exactly, since Laravel's real contract
 * is a 5-digit emailed code, not a clickable reset link:
 *   POST /forgot-password {email}                       -> emails a token
 *   POST /verify-token     {email, token}                -> confirms it
 *   POST /update-password  {email, token, password, password_confirmation}
 * All three require the email to be carried forward, so this is one
 * multi-step component rather than separate routes.
 */
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const tokenSchema = z.object({
  token: z.string().min(5, { message: "Enter the 5-digit code" }),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    password_confirmation: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const ForgetPassword = () => {
  const router = useRouter();
  const { globalSetting, storeCustomization } = useSetting() || {};
  const colorLogo = storeCustomization?.footer?.block4_logo || "/logo/logo-color.svg";

  const [step, setStep] = useState("email"); // email | token | password | done
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const emailForm = useForm({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } });
  const tokenForm = useForm({ resolver: zodResolver(tokenSchema), defaultValues: { token: "" } });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const submitEmail = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email: data.email }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Could not send reset code");

      notifySuccess(body.message || "A verification code has been emailed to you.");
      setEmail(data.email);
      setStep("token");
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitToken = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, token: data.token }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Invalid or expired code");

      notifySuccess(body.message || "Code verified.");
      setToken(data.token);
      setStep("password");
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          email,
          token,
          password: data.password,
          password_confirmation: data.password_confirmation,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to reset password");

      notifySuccess("Password reset successful!");
      setStep("done");

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: data.password,
        callbackUrl: "/user/dashboard",
      });
      setTimeout(() => {
        if (result?.ok) {
          router.push(result.url || "/user/dashboard");
          router.refresh();
        } else {
          router.push("/auth/login");
        }
      }, 1500);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ShowToast />
      <div className="min-h-screen flex flex-col lg:flex-row bg-background">
        <div className="hidden lg:flex lg:w-1/2 relative bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1632406897798-e5472b4a989e?q=80"
            alt="Forgot Password Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative overflow-y-auto">
          <div className="max-w-md w-full">
            <div className="mb-8 flex justify-center lg:justify-start">
              <Link href="/" className="inline-block relative h-10 w-40">
                <Image
                  src={colorLogo}
                  alt={globalSetting?.shop_name || "Kacha Bazar"}
                  fill
                  className="object-contain object-left"
                />
              </Link>
            </div>

            {step === "email" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Forgot password?</h1>
                  <p className="text-sm text-muted-foreground">
                    Enter your registered email and we'll send you a verification code.
                  </p>
                </div>
                <form onSubmit={emailForm.handleSubmit(submitEmail)} className="space-y-6">
                  <div>
                    <label className="block text-foreground font-medium text-sm mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiMail className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                      </div>
                      <Input
                        type="email"
                        {...emailForm.register("email")}
                        placeholder="Enter your registered email"
                        hasError={emailForm.formState.errors.email}
                        className="pl-11"
                      />
                    </div>
                    <Error errorMessage={emailForm.formState.errors.email} />
                  </div>

                  <AuthButton type="submit" loading={loading} loadingText="Sending...">
                    Send Verification Code
                  </AuthButton>

                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      &larr; Back to login
                    </Link>
                  </div>
                </form>
              </>
            )}

            {step === "token" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Enter verification code</h1>
                  <p className="text-sm text-muted-foreground">
                    We emailed a 5-digit code to <span className="font-semibold">{email}</span>.
                  </p>
                </div>
                <form onSubmit={tokenForm.handleSubmit(submitToken)} className="space-y-6">
                  <div>
                    <label className="block text-foreground font-medium text-sm mb-2">
                      Verification Code
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      {...tokenForm.register("token")}
                      placeholder="12345"
                      hasError={tokenForm.formState.errors.token}
                    />
                    <Error errorMessage={tokenForm.formState.errors.token} />
                  </div>

                  <AuthButton type="submit" loading={loading} loadingText="Verifying...">
                    Verify Code
                  </AuthButton>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("email")}
                      className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      &larr; Use a different email
                    </button>
                  </div>
                </form>
              </>
            )}

            {step === "password" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Set a new password</h1>
                  <p className="text-sm text-muted-foreground">
                    Choose a new password for {email}.
                  </p>
                </div>
                <form onSubmit={passwordForm.handleSubmit(submitPassword)} className="space-y-6">
                  <div>
                    <label className="block text-foreground font-medium text-sm mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...passwordForm.register("password")}
                        placeholder="Enter new password"
                        hasError={passwordForm.formState.errors.password}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <Error errorMessage={passwordForm.formState.errors.password} />
                  </div>

                  <div>
                    <label className="block text-foreground font-medium text-sm mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? "text" : "password"}
                        {...passwordForm.register("password_confirmation")}
                        placeholder="Confirm new password"
                        hasError={passwordForm.formState.errors.password_confirmation}
                        className="pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-primary"
                      >
                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <Error errorMessage={passwordForm.formState.errors.password_confirmation} />
                  </div>

                  <AuthButton type="submit" loading={loading} loadingText="Resetting...">
                    Reset Password
                  </AuthButton>
                </form>
              </>
            )}

            {step === "done" && (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Password Reset!</h3>
                <p className="text-sm text-muted-foreground">Signing you in...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetPassword;
