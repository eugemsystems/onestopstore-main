// NOTE: If your cPanel shared hosting has SSL issues with subdomains,\n// fix the actual certificate chain rather than disabling TLS verification.\n// Only enable this as a TEMPORARY workaround in non-production:\n// if (typeof window === \"undefined\" && process.env.DISABLE_TLS_CHECK === \"true\") {\n//   process.env.NODE_TLS_REJECT_UNAUTHORIZED = \"0\";\n// }

// Use internal API URL for server-side requests (SSR/ISR) to avoid DNS/loopback issues on cPanel
// Falls back to the public URL if NEXT_SERVER_API_BASE_URL is not set
const getBaseURL = () => {
  if (typeof window === "undefined") {
    // Server-side: use internal URL if available, then public URL
    return (
      process.env.NEXT_SERVER_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL
    );
  }
  // Client-side: always use the public URL
  return process.env.NEXT_PUBLIC_API_BASE_URL;
};

// NEXT_PUBLIC_* vars are inlined at build time by Next.js, so this is safe
const baseURL = getBaseURL();

// console.log("baseUrl", baseURL);

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = "Failed to fetch data";
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch (e) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

/**
 * Resilient fetch with retry for server-side requests
 * Handles intermittent DNS/network failures on cPanel
 * NOTE: Do NOT add custom `signal` — it conflicts with Next.js `next: { revalidate }` options
 *
 * If the primary URL fails with DNS (ENOTFOUND) or network errors,
 * and NEXT_SERVER_API_BASE_URL is set, it retries using the fallback URL.
 */
const resilientFetch = async (url, options = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (error) {
      const isDNSError =
        error?.cause?.code === "ENOTFOUND" ||
        error?.cause?.code === "ECONNREFUSED" ||
        error?.cause?.code === "ECONNRESET" ||
        error?.cause?.code === "EAI_AGAIN";

      // On server-side: if DNS fails and we have a fallback URL, try swapping the base
      if (
        typeof window === "undefined" &&
        isDNSError &&
        process.env.NEXT_SERVER_API_BASE_URL &&
        process.env.NEXT_PUBLIC_API_BASE_URL &&
        url.startsWith(process.env.NEXT_PUBLIC_API_BASE_URL)
      ) {
        // Try with the server-side URL instead
        const fallbackUrl = url.replace(
          process.env.NEXT_PUBLIC_API_BASE_URL,
          process.env.NEXT_SERVER_API_BASE_URL,
        );
        if (fallbackUrl !== url) {
          try {
            const response = await fetch(fallbackUrl, options);
            return response;
          } catch (_) {
            // fallback also failed, continue retry loop
          }
        }
      }

      if (i === retries) throw error;
      // Wait briefly before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export { baseURL, getBaseURL, handleResponse, resilientFetch };
