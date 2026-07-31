/**
 * Promo / offer links that should send guests to signup but logged-in users
 * to shopping pages instead.
 */

const SIGNUP_OFFER_ROUTES = ["/auth/signup", "/auth/login", "/register"];

export function isSignupOfferRoute(href) {
  if (!href || typeof href !== "string") return false;

  const path = href.split("?")[0].replace(/\/$/, "") || "/";
  return SIGNUP_OFFER_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

/**
 * Where logged-in users go when they click a signup/offer promo link.
 */
export function getLoggedInShoppingDestination(href) {
  if (!href || typeof href !== "string") return "/shop";

  const path = href.split("?")[0];

  if (path.includes("flash-sale") || path.includes("flash-sell")) {
    return "/flash-sale";
  }

  if (path.startsWith("/search")) {
    return href;
  }

  if (path.startsWith("/offers")) {
    return "/offers";
  }

  return "/shop";
}

export function resolvePromoLink(href, isLoggedIn) {
  if (!href) return isLoggedIn ? "/shop" : "/auth/signup";
  if (!isLoggedIn) return href;
  if (isSignupOfferRoute(href)) return getLoggedInShoppingDestination(href);
  return href;
}
