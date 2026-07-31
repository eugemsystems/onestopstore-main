"use client";

import React, { useActionState, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheck,
  FiAlertCircle,
  FiCamera,
} from "react-icons/fi";

//internal import
import useCustomToast from "@hooks/useCustomToast";
import useUtilsFunction from "@hooks/useUtilsFunction";
import Uploader from "@components/image-uploader/Uploader";
import { updateProfileAction } from "@lib/actions/auth.actions";

const UpdateProfile = ({ storeCustomizationSetting }) => {
  const [imageUrl, setImageUrl] = useState("");
  const { showingTranslateValue } = useUtilsFunction();
  const { data: session, update } = useSession();

  const [state, formAction, isPending] = useActionState(
    updateProfileAction,
    undefined,
  );

  const defaultImg = imageUrl ? imageUrl : session?.user?.image;

  useEffect(() => {
    if (state?.user) {
      update({
        ...session,
        user: {
          ...session.user,
          name: state.user.name,
          address: state.user.address,
          phone: state.user.phone,
          image: state.user.image,
        },
      });
      formRef?.current?.reset();
    }
  }, [state?.user]);

  const { formRef } = useCustomToast(state);

  return (
    <div className="max-w-screen-2xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <FiUser className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {showingTranslateValue(
                storeCustomizationSetting?.dashboard?.update_profile,
              ) || "Update Profile"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Update your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {state?.success && (
        <div className="mb-6 p-4 bg-accent border border-primary rounded-xl flex items-center gap-3">
          <FiCheck className="w-5 h-5 text-primary flex-shrink-0" />
          <p className="text-sm text-primary">{state.message}</p>
        </div>
      )}

      {/* Error Message */}
      {state?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{state.error}</p>
        </div>
      )}

      <form ref={formRef} action={formAction}>
        <div className="bg-background rounded-2xl shadow-lg border border-border p-6 lg:p-8">
          {/* Profile Photo Section */}
          <div className="mb-8">
            <label className="block text-muted-foreground font-medium text-sm mb-3">
              <div className="flex items-center gap-2">
                <FiCamera className="w-4 h-4" />
                Profile Photo
              </div>
            </label>
            <div className="flex items-center gap-6">
              <Uploader imageUrl={defaultImg} setImageUrl={setImageUrl} />
              {/* <div className="text-sm text-muted-foreground">
                <p>Upload a new photo</p>
                <p className="text-xs mt-1">
                  Recommended: 200x200px, JPG or PNG
                </p>
              </div> */}
            </div>
            {/* Hidden input for image URL */}
            <input type="hidden" name="imageUrl" value={defaultImg || ""} />
          </div>

          <div className="space-y-5">
            {/* Full Name */}
            <div className="form-group">
              <label className="block text-muted-foreground font-medium text-sm mb-2">
                {showingTranslateValue(
                  storeCustomizationSetting?.dashboard?.full_name,
                ) || "Full Name"}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  name="name"
                  defaultValue={session?.user?.name || ""}
                  placeholder="Enter your full name"
                  className="h-12 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none"
                />
              </div>
              {state?.errors?.name && (
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle className="w-4 h-4" />
                  {state.errors.name.join(" ")}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="block text-muted-foreground font-medium text-sm mb-2">
                {showingTranslateValue(
                  storeCustomizationSetting?.dashboard?.user_email,
                ) || "Email Address"}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  name="email"
                  defaultValue={session?.user?.email || ""}
                  readOnly
                  className="h-12 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            {/* Phone & Address Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Phone */}
              <div className="form-group">
                <label className="block text-muted-foreground font-medium text-sm mb-2">
                  {showingTranslateValue(
                    storeCustomizationSetting?.dashboard?.user_phone,
                  ) || "Phone Number"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiPhone className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={session?.user?.phone || ""}
                    placeholder="+1 (555) 000-0000"
                    className="h-12 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none"
                  />
                </div>
                {state?.errors?.phone && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {state.errors.phone.join(" ")}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="block text-muted-foreground font-medium text-sm mb-2">
                  {showingTranslateValue(
                    storeCustomizationSetting?.dashboard?.address,
                  ) || "Address"}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMapPin className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    defaultValue={session?.user?.address || ""}
                    placeholder="Your address"
                    className="h-12 text-sm pl-11 pr-4 w-full rounded-xl border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none"
                  />
                </div>
                {state?.errors?.address && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle className="w-4 h-4" />
                    {state.errors.address.join(" ")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary text-white font-semibold rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:from-primary hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-5 h-5" />
                  <span>
                    {showingTranslateValue(
                      storeCustomizationSetting?.dashboard?.update_button,
                    ) || "Update Profile"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
