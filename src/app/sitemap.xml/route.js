import { NextResponse } from "next/server";

/**
 * Fetches the pre-generated sitemap index from the Laravel backend
 * (app/Console/Commands/GenerateSitemaps.php) rather than building it here —
 * the backend already applies the correct product visibility rules
 * (status + is_approved + not deleted) and regenerates daily via a
 * scheduled job. The individual `/v{N}-sitemap-*.xml` files this index
 * points to are proxied straight to the backend by the rewrite in
 * next.config.js.
 */
export async function GET() {
  const apiBaseUrl =
    process.env.NEXT_SERVER_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000/api";

  try {
    const res = await fetch(`${apiBaseUrl}/sitemaps/v5-sitemap.xml`, {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (res.ok) {
      const xml = await res.text();
      if (xml.includes("<sitemap>")) {
        return new NextResponse(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
          },
        });
      }
    }
  } catch {
    // fall through to the static fallback below
  }

  const baseUrl = (process.env.NEXT_PUBLIC_STORE_DOMAIN || "https://onestopstore.local").replace(/\/$/, "");
  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/v5-sitemap-static.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
    },
  });
}
