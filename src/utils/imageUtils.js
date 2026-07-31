/**
 * Validates if a URL is a valid remote image URL (http or https)
 * This prevents errors when local file paths or invalid URLs are used with next/image
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if the URL is a valid http/https URL
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Returns a valid image URL or a fallback
 * @param {string} url - The image URL to validate
 * @param {string} fallback - Optional fallback URL (defaults to null)
 * @returns {string|null} - The valid URL or fallback
 */
export const getValidImageUrl = (url, fallback = null) => {
  return isValidImageUrl(url) ? url : fallback;
};
