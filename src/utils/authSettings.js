/**
 * Shared auth visibility helpers for login/signup UI and NextAuth providers.
 */

export function isPhoneOtpEnabled(storeSetting) {
  // Fail closed: the Laravel API has no OTP endpoints at all (verify-phone,
  // send/confirm/resend-email-otp, etc. all 404 — confirmed against
  // routes/api.php), and getStoreSettings() never populates
  // `phone_otp_status`, so this must default to false or the OTP tab shows
  // permanently on login/signup with every attempt guaranteed to fail.
  // Legacy never had OTP login either. Flip to `=== true` once a real
  // backend flag/endpoints exist.
  return storeSetting?.phone_otp_status === true;
}

export function isGoogleLoginEnabled(storeSetting, { requireCredentials = false } = {}) {
  if (!storeSetting?.google_login_status) return false;
  if (!requireCredentials) return true;
  return Boolean(storeSetting?.google_id && storeSetting?.google_secret);
}

export function isFacebookLoginEnabled(storeSetting, { requireCredentials = false } = {}) {
  if (!storeSetting?.facebook_login_status) return false;
  if (!requireCredentials) return true;
  return Boolean(storeSetting?.facebook_id && storeSetting?.facebook_secret);
}

export function isGithubLoginEnabled(storeSetting, { requireCredentials = false } = {}) {
  if (!storeSetting?.github_login_status) return false;
  if (!requireCredentials) return true;
  return Boolean(storeSetting?.github_id && storeSetting?.github_secret);
}

export function hasAnySocialLogin(storeSetting) {
  return (
    isGoogleLoginEnabled(storeSetting) ||
    isFacebookLoginEnabled(storeSetting) ||
    isGithubLoginEnabled(storeSetting)
  );
}
