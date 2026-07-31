/**
 * Coupon services — Raines edition.
 * The Laravel API validates coupons at checkout (`/coupon` with a code)
 * rather than exposing a public "showing coupons" list, so the home-page
 * coupon widget gets an empty list without a network call. Checkout-time
 * validation will be wired to Laravel in the checkout phase.
 */

const getAllCoupons = async () => {
  return { coupons: [] };
};

const getShowingCoupons = async () => {
  return { coupons: [], error: null };
};

export { getAllCoupons, getShowingCoupons };
