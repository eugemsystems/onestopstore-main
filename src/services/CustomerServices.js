"use server";

import {
  baseURL,
  handleResponse,
  resilientFetch,
} from "@services/CommonService";
import { getHeaders, getUserServerSession } from "@lib/auth-server";
import { laravelLogin } from "@services/LaravelAuth";

const loginCustomer = async ({ email, password, recaptcha }) => {
  try {
    // Raines Laravel: POST /login -> token, then GET /self for the profile
    const userInfo = await laravelLogin({ email, password, recaptcha });
    return {
      userInfo,
    };
  } catch (error) {
    return { error: error.message };
  }
};

const signUpWithOauthProvider = async ({ name, email, image, provider }) => {
  // return;
  try {
    const response = await resilientFetch(`${baseURL}/customer/signup/oauth`, {
      cache: "no-cache",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, image, provider }),
    });

    const res = await handleResponse(response);
    // console.log("res", res);
    return { res };
  } catch (error) {
    return { error: error.message };
  }
};
const forgetPassword = async () => {
  try {
    const response = await resilientFetch(
      `${baseURL}/customer/forget-password`,
      {
        cache: "no-cache",
      },
    );

    const user = await handleResponse(response);
    return { user, error: null };
  } catch (error) {
    return { user: [], error: error.message };
  }
};

const resetPassword = async () => {
  try {
    const response = await resilientFetch(
      `${baseURL}/customer/reset-password`,
      {
        cache: "no-cache",
      },
    );

    const user = await handleResponse(response);
    return { user, error: null };
  } catch (error) {
    return { user: [], error: error.message };
  }
};

const getShippingAddress = async ({ id = "" }) => {
  try {
    // return;
    const userInfo = await getUserServerSession();
    // console.log("userInfo", userInfo);
    const response = await resilientFetch(
      `${baseURL}/customer/shipping/address/${userInfo?.id}?id=${id}`,
      {
        // cache: "no-cache",
        headers: await getHeaders(),
      },
    );

    const res = await handleResponse(response);
    // console.log("shippingAddress", res);

    return {
      shippingAddress: res.shippingAddress,
    };
  } catch (error) {
    // console.log("error", error);
    return { error: error.message };
  }
};

/**
 * Verify OTP and login/register user
 * Used by next-auth credentials provider for OTP-based login
 */
const verifyOtpAndLogin = async ({ email, phone, otp }) => {
  try {
    let endpoint, body;
    if (email) {
      endpoint = `${baseURL}/customer/confirm-email-otp`;
      body = { email, code: otp };
    } else if (phone) {
      endpoint = `${baseURL}/customer/confirm-phone-otp`;
      body = { phone, code: otp };
    } else {
      return { error: "Email or phone is required" };
    }

    const response = await resilientFetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const userInfo = await handleResponse(response);
    return { userInfo };
  } catch (error) {
    return { error: error.message };
  }
};

export {
  loginCustomer,
  signUpWithOauthProvider,
  forgetPassword,
  resetPassword,
  getShippingAddress,
  verifyOtpAndLogin,
};
