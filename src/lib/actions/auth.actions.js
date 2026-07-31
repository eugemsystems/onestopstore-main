"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import {
  getAuthToken,
  getAuthSession,
  isUserAuthenticated,
  getUserServerSession,
} from "@lib/auth-server";

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

/**
 * Get current user session
 */
export async function getCurrentUser() {
  const user = await getUserServerSession();
  return user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  return await isUserAuthenticated();
}

/**
 * Update user profile
 */
export async function updateProfileAction(prevState, formData) {
  const token = await getAuthToken();
  const session = await getAuthSession();

  if (!token || !session?.user?.id) {
    return {
      success: false,
      error: "Unauthorized",
    };
  }

  const userId = session.user.id;
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const address = formData.get("address");
  const imageUrl = formData.get("imageUrl");

  // Validate input
  const validatedFields = updateProfileSchema.safeParse({
    name,
    email,
    phone,
    address,
    imageUrl,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      error: "Please fix the validation errors",
    };
  }

  try {
    // Backend route is PUT /customer/:id
    const response = await resilientFetch(`${baseURL}/customer/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        address,
        image: imageUrl,
      }),
    });

    const data = await handleResponse(response);

    // Revalidate paths to get updated data
    revalidatePath("/user/update-profile");
    revalidatePath("/user/my-account");
    revalidatePath("/user/dashboard");

    return {
      success: true,
      message: "Profile updated successfully",
      user: data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to update profile",
    };
  }
}

/**
 * Change password action
 */
export async function changePasswordAction(prevState, formData) {
  const token = await getAuthToken();
  const session = await getAuthSession();

  if (!token || !session?.user?.email) {
    return {
      success: false,
      error: "Unauthorized",
      errors: null,
    };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  // Validate input with Zod
  const validatedFields = changePasswordSchema.safeParse({
    currentPassword,
    newPassword,
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      error: "Please fix the validation errors",
    };
  }

  try {
    // Backend route is POST /customer/change-password
    const response = await resilientFetch(
      `${baseURL}/customer/change-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: session.user.email,
          currentPassword,
          newPassword,
        }),
      },
    );

    await handleResponse(response);

    return {
      success: true,
      message: "Password changed successfully",
      error: null,
      errors: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to change password",
      errors: null,
    };
  }
}

// ==========================================
// OTP Login Actions
// ==========================================

/**
 * Send OTP to phone number
 */
export async function sendPhoneOtpAction(prevState, formData) {
  const phone = formData.get("phone");

  if (!phone || phone.trim().length < 8) {
    return {
      success: false,
      error: "Please enter a valid phone number with country code",
      step: "phone",
    };
  }

  try {
    const response = await resilientFetch(`${baseURL}/customer/verify-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: phone.trim() }),
    });
    const data = await handleResponse(response);

    return {
      success: true,
      message: data.message || "OTP sent successfully",
      step: "otp",
      phone: phone.trim(),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to send OTP",
      step: "phone",
    };
  }
}

/**
 * Resend phone OTP
 */
export async function resendPhoneOtpAction(phone) {
  if (!phone) {
    return { success: false, error: "Phone number is required" };
  }

  try {
    const response = await resilientFetch(
      `${baseURL}/customer/resend-phone-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      },
    );
    const data = await handleResponse(response);

    return {
      success: true,
      message: data.message || "OTP resent successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to resend OTP",
    };
  }
}

/**
 * Send OTP to email
 */
export async function sendEmailOtpAction(prevState, formData) {
  const email = formData.get("email");

  const emailSchema = z.string().email("Invalid email address");
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    return {
      success: false,
      error: "Please enter a valid email address",
      step: "email",
    };
  }

  try {
    const response = await resilientFetch(
      `${baseURL}/customer/send-email-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      },
    );
    const data = await handleResponse(response);

    return {
      success: true,
      message: data.message || "OTP sent to your email",
      step: "otp",
      email: email.trim(),
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to send OTP",
      step: "email",
    };
  }
}

/**
 * Resend email OTP
 */
export async function resendEmailOtpAction(email) {
  if (!email) {
    return { success: false, error: "Email is required" };
  }

  try {
    const response = await resilientFetch(
      `${baseURL}/customer/resend-email-otp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      },
    );
    const data = await handleResponse(response);

    return {
      success: true,
      message: data.message || "OTP resent successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to resend OTP",
    };
  }
}
