import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

const getShowingAttributes = async () => {
  try {
    const response = await resilientFetch(`${baseURL}/attributes/show`, {
      // cache: "force-cache",
      next: { revalidate: 300 }, // revalidate every 5 minutes
    });

    const attributes = await handleResponse(response);
    return { attributes, error: null };
  } catch (error) {
    return { attributes: [], error: error.message };
  }
};

export { getShowingAttributes };
