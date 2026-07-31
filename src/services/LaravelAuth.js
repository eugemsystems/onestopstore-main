import { baseURL, handleResponse, resilientFetch } from "@services/CommonService";

/**
 * Laravel auth bridge.
 * Laravel Sanctum contract:
 *   POST /login    {email, password}                    -> { access_token, success }
 *   POST /register {name,email,password,password_confirmation,country_code,phone}
 *                                                       -> { access_token, success }
 *   GET  /self     (Bearer token)                       -> consumer profile
 * The template expects a Mongo-style user object, so we normalize here.
 */

/** Laravel /self profile -> template user shape */
export function toTemplateUser(self, token) {
  return {
    _id: String(self?.id ?? ""),
    id: self?.id,
    name: self?.name || "",
    email: self?.email || "",
    phone: self?.phone ? String(self.phone) : "",
    image: self?.profile_image?.original_url || null,
    address: null,
    token,
    refreshToken: null,
    // Sanctum tokens don't expire on a short clock; give next-auth 24h windows
    expiresIn: 60 * 60 * 24,
    raines: {
      countryCode: self?.country_code || null,
      preferredCurrency: self?.preferred_currency || "USD",
      currencySymbol: self?.currency_symbol || "$",
      role: self?.role?.name || "consumer",
    },
  };
}

/** Fetch the authenticated profile */
export async function laravelSelf(token) {
  const response = await resilientFetch(`${baseURL}/self`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  return handleResponse(response);
}

/** Login and return the normalized template user (token included) */
export async function laravelLogin({ email, password, recaptcha }) {
  const response = await resilientFetch(`${baseURL}/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "Content-Type": "application/json",
    },
    // `recaptcha` is only forwarded when the widget produced a token —
    // harmless to include even if the backend doesn't check it yet.
    body: JSON.stringify({ email, password, ...(recaptcha ? { recaptcha } : {}) }),
    cache: "no-store",
  });

  const data = await handleResponse(response);
  if (!data?.access_token) {
    throw new Error(data?.message || "Invalid credentials");
  }

  const self = await laravelSelf(data.access_token);
  return toTemplateUser(self, data.access_token);
}

/** Register directly (Laravel needs no email-token round trip), then log in */
export async function laravelRegister({ name, email, password, phone }) {
  const response = await resilientFetch(`${baseURL}/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
      country_code: "263",
      phone: phone || "",
    }),
    cache: "no-store",
  });

  const data = await handleResponse(response);
  if (!data?.access_token) {
    throw new Error(data?.message || "Registration failed");
  }

  const self = await laravelSelf(data.access_token);
  return toTemplateUser(self, data.access_token);
}
