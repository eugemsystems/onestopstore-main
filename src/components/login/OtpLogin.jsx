"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FiPhone, FiMail, FiArrowLeft } from "react-icons/fi";
import { notifyError, notifySuccess } from "@utils/toast";
import {
  sendPhoneOtpAction,
  resendPhoneOtpAction,
  sendEmailOtpAction,
  resendEmailOtpAction,
} from "@lib/actions/auth.actions";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds — wait before requesting another code
const OTP_EXPIRY_MINUTES = 2;

const OtpLogin = ({ redirectUrl, phoneOtpEnabled = true }) => {
  const router = useRouter();
  const [method, setMethod] = useState(phoneOtpEnabled ? "phone" : "email");
  const [step, setStep] = useState("input"); // "input" | "otp"
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phoneOtpEnabled && method === "phone") {
      setMethod("email");
      setIdentifier("");
      setError("");
    }
  }, [phoneOtpEnabled, method]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Focus first OTP input when step changes to otp
  useEffect(() => {
    if (step === "otp" && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();

      if (method === "phone") {
        if (!phoneOtpEnabled) {
          setError("Phone OTP login is currently disabled.");
          notifyError("Phone OTP login is currently disabled.");
          return;
        }

        formData.append("phone", identifier);
        const result = await sendPhoneOtpAction(null, formData);
        if (result.success) {
          setStep("otp");
          setResendTimer(RESEND_COOLDOWN);
          notifySuccess(result.message);
        } else {
          setError(result.error);
          notifyError(result.error);
        }
      } else {
        formData.append("email", identifier);
        const result = await sendEmailOtpAction(null, formData);
        if (result.success) {
          setStep("otp");
          setResendTimer(RESEND_COOLDOWN);
          notifySuccess(result.message);
        } else {
          setError(result.error);
          notifyError(result.error);
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      notifyError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length < OTP_LENGTH) {
      setError(`Please enter all ${OTP_LENGTH} digits`);
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        otp: otpCode,
        email: method === "email" ? identifier : undefined,
        phone: method === "phone" ? identifier : undefined,
        callbackUrl: redirectUrl || "/user/dashboard",
      });

      if (result?.error) {
        setError(result.error);
        notifyError(result.error);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      } else if (result?.ok) {
        notifySuccess("Login successful!");
        router.push(result.url || redirectUrl || "/user/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError(err.message || "Verification failed");
      notifyError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError("");

    try {
      let result;
      if (method === "phone") {
        result = await resendPhoneOtpAction(identifier);
      } else {
        result = await resendEmailOtpAction(identifier);
      }

      if (result.success) {
        setResendTimer(RESEND_COOLDOWN);
        setOtp(Array(OTP_LENGTH).fill(""));
        notifySuccess(result.message || "OTP resent successfully");
      } else {
        setError(result.error);
        notifyError(result.error);
      }
    } catch (err) {
      notifyError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep("input");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
  };

  return (
    <div className="w-full">
      {step === "input" ? (
        <>
          {phoneOtpEnabled && (
            <div className="flex rounded-xl border border-border mb-5 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setMethod("phone");
                  setIdentifier("");
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-200 ${
                  method === "phone"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <FiPhone className="w-4 h-4" />
                Phone
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setIdentifier("");
                  setError("");
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-200 ${
                  method === "email"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                <FiMail className="w-4 h-4" />
                Email
              </button>
            </div>
          )}

          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                {method === "phone" ? "Phone Number" : "Email Address"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {method === "phone" ? (
                    <FiPhone className="w-4 h-4" />
                  ) : (
                    <FiMail className="w-4 h-4" />
                  )}
                </span>
                <input
                  type={method === "phone" ? "tel" : "email"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    method === "phone" ? "+1234567890" : "your@email.com"
                  }
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                  autoFocus
                />
              </div>
              {method === "phone" && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Include country code (e.g., +1 for US, +88 for BD)
                </p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100 dark:border-red-500/20">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending OTP...
                </span>
              ) : (
                "Send OTP"
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {method === "phone" ? (
                <FiPhone className="w-6 h-6 text-primary" />
              ) : (
                <FiMail className="w-6 h-6 text-primary" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-foreground">Verify OTP</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the {OTP_LENGTH}-digit code sent to
            </p>
            <p className="text-sm font-medium text-foreground mt-0.5 break-all">
              {identifier}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Code expires in {OTP_EXPIRY_MINUTES} minutes
            </p>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <div className="flex justify-center gap-1.5 sm:gap-2.5 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={index === 0 ? handleOtpPaste : undefined}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border-2 border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-500 mb-4 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-100 dark:border-red-500/20">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otp.some((d) => !d)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify & Login"
              )}
            </button>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the code?{" "}
                {resendTimer > 0 ? (
                  <span className="text-muted-foreground font-medium">
                    Resend in {resendTimer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                    className="text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default OtpLogin;
