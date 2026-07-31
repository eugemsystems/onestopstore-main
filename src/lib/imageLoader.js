"use client";

/**
 * Custom Next.js image loader.
 *
 * Why this exists:
 * - Next.js image optimization proxies external images through `/_next/image` on the server.
 * - In NAT64 / IPv6 environments, some external hosts (e.g. i.postimg.cc) resolve to
 *   addresses that Next.js identifies as private IPs, causing SSRF-protection errors.
 * - External Cloudinary fetches over the Next.js proxy can time out under slow networks.
 *
 * This loader makes the browser fetch images directly, bypassing the Next.js proxy entirely.
 * For Cloudinary URLs, it injects native Cloudinary transformation parameters so the
 * browser gets a properly sized, format-optimized image from Cloudinary's own CDN.
 */
export default function imageLoader({ src, width, quality }) {
  // Local / relative paths — return as-is (served from Next.js static assets)
  if (!src || !src.startsWith("http")) {
    return src;
  }

  // Cloudinary — inject width + quality + auto-format transformations
  // URL format: https://res.cloudinary.com/<cloud>/image/upload/<optional-transforms>/v…/path
  if (src.includes("res.cloudinary.com")) {
    const q = quality || 75;
    // Insert transformation params after /upload/ (before any existing transforms or version)
    return src.replace("/upload/", `/upload/w_${width},q_${q},f_auto/`);
  }

  // All other external URLs (postimg, etc.) — return as-is so the browser fetches
  // them directly without going through the Next.js image-optimization server proxy.
  return src;
}
