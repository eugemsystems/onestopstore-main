import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Fetch all showing (active) themes from the API.
 */
const getShowingThemes = async () => {
  try {
    const response = await resilientFetch(`${baseURL}/theme/show`, {
      next: { revalidate: 60, tags: ["themes", "settings"] },
    });

    const themes = await handleResponse(response);
    return { themes };
  } catch (error) {
    return { themes: [], error: error.message };
  }
};

/**
 * Fetch the default theme.
 */
const getDefaultTheme = async () => {
  try {
    const response = await resilientFetch(`${baseURL}/theme/default`, {
      next: { revalidate: 60, tags: ["themes", "settings"] },
    });

    const theme = await handleResponse(response);
    return { theme };
  } catch (error) {
    return { theme: null, error: error.message };
  }
};

export { getShowingThemes, getDefaultTheme };
