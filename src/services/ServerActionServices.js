"use server";

import {
  loginFormSchema,
  shippingAddressFormSchema,
  signupFormSchema,
  changePasswordFormSchema,
  updateProfileFormSchema,
} from "@lib/form-schema";
import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const getHeaders = (userInfo) => {
  const header = {
    Accept: "application/json",
    "Content-Type": "application/json",
    authorization: userInfo ? `Bearer ${userInfo?.token}` : null,
  };
  return header;
};

const loginCustomer = async (currentState, formData) => {
  // Validate form fields
  const validatedFields = loginFormSchema.safeParse({
    email: formData.get("registerEmail"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  // Get the data off the form
  const { email, password } = validatedFields.data;
  const redirectUrl = formData.get("redirectUrl");

  try {
    const response = await resilientFetch(`${baseURL}/customer/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const userInfo = await handleResponse(response);

    // Calculate the expiration time for one day (24 hours) from now
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Set the "_userInfo" cookie with the expiration time of one day and httpOnly set to true
    await cookies().set("_userInfo", JSON.stringify(userInfo), {
      expires,
      httpOnly: true,
    });

    revalidatePath("/");

    return {
      success: "Login Successfully!",
    };
  } catch (error) {
    // console.log("error", error.message);
    return { error: error.message };
  }
};

// Redirect function that can be called after loginCustomer resolves
const handleLogin = async (currentState, formData) => {
  const result = await loginCustomer(currentState, formData);
  const redirectUrl = formData.get("redirectUrl");

  // console.log("`/${redirectUrl}`::", `/${redirectUrl}`);

  if (result.success) {
    redirect(`/${redirectUrl}`);
  }

  return result;
};

const verifyEmailAddress = async (currentState, formData) => {
  // return;
  // return {
  //   success: "Login Successfully!",
  // };
  // Validate form fields
  const validatedFields = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, password, email } = validatedFields.data;

  // console.log("name", name, "password", password, "email", email);
  // return;

  // Get the data off the form
  try {
    const response = await resilientFetch(`${baseURL}/customer/verify-email`, {
      method: "POST",
      cache: "no-cache",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ name, email, password }),
    });

    const user = await handleResponse(response);
    // console.log("user::", user);
    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

const changePassword = async (userInfo, currentState, formState) => {
  const validatedFields = changePasswordFormSchema.safeParse({
    email: formState.get("email"),
    currentPassword: formState.get("currentPassword"),
    newPassword: formState.get("newPassword"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, currentPassword, newPassword } = validatedFields.data;

  try {
    const response = await resilientFetch(
      `${baseURL}/customer/change-password`,
      {
        cache: "no-cache",
        method: "POST",
        headers: getHeaders(userInfo),
        body: JSON.stringify({ email, currentPassword, newPassword }),
      },
    );

    const updatedResponse = await handleResponse(response);

    // revalidatePath("/user/change-password");
    return {
      success: updatedResponse.message,
    };
  } catch (error) {
    // revalidatePath("/user/change-password");
    return { error: error.message };
  }
};
const updateCustomer = async (userInfo, currentState, formState) => {
  try {
    const validatedFields = updateProfileFormSchema.safeParse({
      name: formState.get("name"),
      address: formState.get("address"),
      phone: formState.get("phone"),
      email: formState.get("email"),
      image: formState.get("imageUrl"),
    });

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // console.log("updatedUser", validatedFields.data);
    // return;

    const response = await resilientFetch(
      `${baseURL}/customer/${userInfo?.id}`,
      {
        cache: "no-cache",
        method: "PUT",
        headers: getHeaders(userInfo),
        body: JSON.stringify(validatedFields.data),
      },
    );

    const user = await handleResponse(response);
    // revalidatePath("/user/update-profile");
    return {
      success: "Profile updated successfully!",
      user: user,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const addShippingAddress = async (userInfo, currentState, formState) => {
  try {
    const validatedFields = shippingAddressFormSchema.safeParse({
      name: formState.get("name"),
      address: formState.get("address"),
      contact: formState.get("contact"),
      country: formState.get("country"),
      city: formState.get("city"),
      area: formState.get("area"),
    });

    // revalidatePath("/");
    // return {
    //   success: "Hello from success message.",
    // };

    // console.log("validatedFields", validatedFields);

    // If any form fields are invalid, return early
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const shippingAddressId = formState.get("shippingAddressId") || "";

    // console.log(
    //   "shippingAddressId",
    //   shippingAddressId,
    //   "validatedFields",
    //   validatedFields
    // );

    const response = await resilientFetch(
      `${baseURL}/customer/shipping/address/${userInfo?.id}?id=${shippingAddressId}`,
      {
        cache: "no-cache",
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(validatedFields.data),
      },
    );

    const res = await handleResponse(response);
    // console.log("res:::", res);

    revalidatePath("/user/shipping-address");
    return {
      success: "Shipping address added successfully!",
    };
  } catch (error) {
    return { error: error.message };
  }
};

export {
  loginCustomer,
  handleLogin,
  verifyEmailAddress,
  changePassword,
  updateCustomer,
  addShippingAddress,
};
