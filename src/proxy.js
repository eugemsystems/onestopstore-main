import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const locales = ["en", "en-US", "es", "fr", "nl-NL"];
const defaultLocale = "en";
const protectedRoutes = ["/user", "/checkout"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Skip internal and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images")
  ) {
    return NextResponse.next();
  }

  const pathnameParts = pathname.split("/");
  const currentLocale = locales.includes(pathnameParts[1])
    ? pathnameParts[1]
    : defaultLocale;

  // Build path without locale
  const pathAfterLocale = locales.includes(pathnameParts[1])
    ? `/${pathnameParts.slice(2).join("/")}`
    : pathname;

  // Old reset emails pointed to /user/forget-password/<token>, which sits
  // under the auth-protected /user routes. Forward them to the public
  // reset flow under /auth so the link works without a session. The reset
  // flow itself is code-entry based (Laravel emails a 5-digit token, not a
  // usable single-field link — /verify-token and /update-password both also
  // require the email, which no reset link carries), so this just lands on
  // the flow's start rather than trying to pre-fill a step.
  if (pathAfterLocale.startsWith("/user/forget-password")) {
    return NextResponse.redirect(new URL(`/auth/forget-password`, request.url));
  }

  // Exact-segment match so "/checkout" doesn't also swallow sibling routes
  // like "/checkout-cart" (the public, guest-viewable cart page) — a plain
  // startsWith() here previously gated the cart page behind login too.
  const isProtected = protectedRoutes.some(
    (route) =>
      pathAfterLocale === route || pathAfterLocale.startsWith(`${route}/`)
  );

  // Skip auth check for login/register routes
  // Guest checkout does not exist: Laravel's /checkout and /order endpoints
  // both require auth:sanctum, and the legacy frontend never had a guest
  // path either, so login is always required here (matches legacy).
  if (isProtected && !pathAfterLocale.startsWith("/auth")) {
    const userInfo = await getToken({ req: request });

    if (!userInfo) {
      // Preserve the original destination (path + query) so the login page
      // can send the user straight back after signing in — e.g. hitting
      // /checkout directly must land back on /checkout, not the dashboard.
      const loginUrl = new URL(`/auth/login`, request.url);
      loginUrl.searchParams.set(
        "redirectUrl",
        pathname + request.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api|images).*)"],
};
