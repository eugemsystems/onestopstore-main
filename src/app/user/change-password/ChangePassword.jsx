"use client";
import { useActionState, useState } from "react";
import { useSession } from "next-auth/react";

//internal import

import Error from "@components/form/Error";
import ErrorTwo from "@components/form/ErrorTwo";
import useCustomToast from "@hooks/useCustomToast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import InputAreaTwo from "@components/form/InputAreaTwo";
import SubmitButton from "@components/user-dashboard/SubmitButton";
import { changePasswordAction } from "@lib/actions/auth.actions";

const initialState = {
  error: null,
  success: null,
};

// Password strength calculator
const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2)
    return {
      level: score,
      label: "Weak",
      color: "bg-red-500",
      textColor: "text-red-500",
    };
  if (score === 3)
    return {
      level: score,
      label: "Fair",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
    };
  if (score === 4)
    return {
      level: score,
      label: "Good",
      color: "bg-green-400",
      textColor: "text-green-500",
    };
  return {
    level: score,
    label: "Strong",
    color: "bg-primary",
    textColor: "text-primary",
  };
};

const ChangePassword = ({ storeCustomizationSetting }) => {
  const { showingTranslateValue } = useUtilsFunction();
  const { data: session } = useSession();
  const dashboard = storeCustomizationSetting?.dashboard;
  const [newPassword, setNewPassword] = useState("");

  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  const { formRef } = useCustomToast(state);
  const strength = getPasswordStrength(newPassword);

  return (
    <div className="max-w-screen-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <svg
              className="w-5 h-5 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {showingTranslateValue(dashboard?.change_password) ||
                "Change Password"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Only for accounts created with email and password (not social
              login or OTP)
            </p>
          </div>
        </div>
      </div>

      <form ref={formRef} action={formAction}>
        <div className="bg-background rounded-2xl shadow-lg border border-border p-6">
          <div className="space-y-5">
            {/* Email Field */}
            <div className="form-group">
              <label className="block text-muted-foreground font-medium text-sm mb-2">
                {showingTranslateValue(dashboard?.user_email) ||
                  "Email Address"}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  defaultValue={session?.user?.email}
                  readOnly
                  className="h-10 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <Error errorName={state?.errors?.email?.join(" ")} />
            </div>

            {/* Current Password */}
            <div className="form-group">
              <label className="block text-muted-foreground font-medium text-sm mb-2">
                {showingTranslateValue(dashboard?.current_password) ||
                  "Current Password"}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  name="currentPassword"
                  autoComplete="new-password"
                  placeholder={
                    showingTranslateValue(dashboard?.current_password) ||
                    "Enter current password"
                  }
                  className="h-10 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <Error errorName={state?.errors?.currentPassword?.join(" ")} />
            </div>

            {/* New Password */}
            <div className="form-group">
              <label className="block text-muted-foreground font-medium text-sm mb-2">
                {showingTranslateValue(dashboard?.new_password) ||
                  "New Password"}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder={
                    showingTranslateValue(dashboard?.new_password) ||
                    "Enter new password"
                  }
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-background text-foreground placeholder-muted-foreground transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.level ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.textColor}`}>
                    Password strength: {strength.label}
                  </p>
                </div>
              )}
              <ErrorTwo errors={state?.errors?.newPassword} />
            </div>

            {/* Password Requirements */}
            <div className="bg-muted rounded-xl p-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Password requirements:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 ${
                      newPassword.length >= 8
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 ${
                      /[a-zA-Z]/.test(newPassword)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  At least one letter
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 ${
                      /[0-9]/.test(newPassword)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  At least one number
                </li>
                <li className="flex items-center gap-2">
                  <svg
                    className={`w-4 h-4 ${
                      /[^a-zA-Z0-9]/.test(newPassword)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  At least one special character
                </li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <SubmitButton
              title={
                showingTranslateValue(dashboard?.change_password) ||
                "Update Password"
              }
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChangePassword;
