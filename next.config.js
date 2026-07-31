/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Increase server-side fetch timeout (default is too short for slow cPanel backends)
  staticPageGenerationTimeout: 120,

  // Disable fetch cache in development, keep for production
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV !== "production",
    },
  },

  // Compress responses
  compress: true,

  // Optimize production builds
  poweredByHeader: false,

  images: {
    // Custom loader: images are fetched directly by the browser, not proxied through
    // the Next.js server. This eliminates the "resolved to private ip" SSRF errors
    // (common in NAT64/IPv6 dev environments) and removes server-side fetch timeouts.
    // Cloudinary images are served via Cloudinary's own CDN with native transformations.
    loaderFile: "./src/lib/imageLoader.js",

    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.cloudinary.com" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "*.postimg.cc" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "graph.facebook.com" },
      // Catch-all for any other external product/category images from the DB
      { protocol: "https", hostname: "**" },
      // Raines Laravel media host — local Docker/Traefik stack + production.
      // Laravel's APP_URL generates plain-http image_url/proxy-image links
      // even behind Traefik's https termination, so both schemes are needed.
      { protocol: "https", hostname: "media.shop.local" },
      { protocol: "http", hostname: "media.shop.local" },
      { protocol: "https", hostname: "media.onestopstore.co.zw" },
      { protocol: "http", hostname: "media.onestopstore.co.zw" },
      { protocol: "https", hostname: "api.shop.local" },
      { protocol: "http", hostname: "api.shop.local" },
      { protocol: "https", hostname: "api.onestopstore.co.zw" },
      { protocol: "http", hostname: "api.onestopstore.co.zw" },
    ],

    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
  },

  // HTTP security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/(.*)\\.(js|css|woff|woff2|png|jpg|jpeg|gif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
