import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation endpoint.
 * Call this from admin after updating store customization/settings.
 *
 * Usage: POST /api/revalidate
 * Body: { "tag": "settings" } or { "tag": "customization" }
 * Header: x-revalidate-secret: <REVALIDATION_SECRET>
 *
 * Or simply: GET /api/revalidate?tag=settings&secret=<REVALIDATION_SECRET>
 */

const REVALIDATION_SECRET =
  process.env.REVALIDATION_SECRET || "kachabazar-revalidate-2024";

function isAuthorized(request) {
  // Check header
  const headerSecret = request.headers.get("x-revalidate-secret");
  if (headerSecret === REVALIDATION_SECRET) return true;

  // Check query param
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  if (querySecret === REVALIDATION_SECRET) return true;

  return false;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag") || "all";

  try {
    if (tag === "all") {
      // Revalidate all common tags
      const tags = [
        "settings",
        "customization",
        "themes",
        "attributes",
        "categories",
        "store_products",
        "product",
        "search_products",
        "popular_products",
        "discounted_products",
        "related_products",
      ];
      tags.forEach((t) => revalidateTag(t));
      return NextResponse.json({
        revalidated: true,
        tags,
        now: Date.now(),
      });
    }

    revalidateTag(tag);
    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const tag = body.tag || "settings";

    revalidateTag(tag);

    return NextResponse.json({
      revalidated: true,
      tag,
      now: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error revalidating", error: error.message },
      { status: 500 },
    );
  }
}
