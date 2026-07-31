"use server";
import { getHeaders } from "@lib/auth-server";
import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

const addNotification = async (notificationData) => {
  try {
    const response = await resilientFetch(`${baseURL}/notification/add`, {
      cache: "no-cache",
      method: "POST",
      headers: await getHeaders(),
      body: JSON.stringify(notificationData),
    });

    const notification = await handleResponse(response);

    // await new Promise((resolve) => setTimeout(resolve, 15000));
    return { notification };
  } catch (error) {
    return { error: error.message };
  }
};

export { addNotification };
