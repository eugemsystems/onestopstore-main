"use client";

import { useEffect, useRef } from "react";

/**
 * Renders the Google reCAPTCHA v2 checkbox widget when a site key is
 * provided. Loaded via the plain grecaptcha script (no extra npm
 * dependency) — only shown when admin settings enable it, matching the
 * legacy frontend's behavior.
 */
const GoogleRecaptcha = ({ siteKey, onChange }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);

  useEffect(() => {
    if (!siteKey) return;

    const renderWidget = () => {
      if (!window.grecaptcha?.render || !containerRef.current || widgetId.current !== null) {
        return;
      }
      widgetId.current = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onChange?.(token),
        "expired-callback": () => onChange?.(""),
      });
    };

    if (window.grecaptcha?.render) {
      renderWidget();
      return;
    }

    const scriptId = "google-recaptcha-script";
    window.__onRecaptchaLoad = renderWidget;
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }, [siteKey, onChange]);

  if (!siteKey) return null;

  return <div ref={containerRef} className="mt-1" />;
};

export default GoogleRecaptcha;
