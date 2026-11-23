# Changelog — onestopstore-main

All notable changes to this folder are recorded here, newest first.
Update this file in the same commit as every change.

## Tagging convention
- Semantic versioning tags `vMAJOR.MINOR.PATCH` (patch: fixes, minor: features, major: breaking). Versions start at 1.
- After a release-worthy commit: `git tag -a vX.Y.Z -m "summary" && git push origin vX.Y.Z`.
- `v1.0.0` is the first tag: tracking starts here. Earlier history is in `git log`.

---

## [v1.0.0] — 2026-11-23

### Added
- **Delivery options per product** (ported from the Raines storefront; needs onestopstore-api v1.0.0): one product can have several admin-named options with different prices/delivery times (defaults "Fastest Delivery" and "Best Price").
  - Adapter maps the API's `delivery_options` into `product.deliveryOptions` (`src/services/laravelAdapter.js`); `getFromPrice` returns the cheapest in-stock option as "From" (`src/utils/getFromPrice.js`).
  - Cards (`ProductCard`, `ProductCardNew`, `DiscountedCard`, `CampaignProductCard`): lowest price as "From" plus a visible **More Options ?** badge with a hover/tap tooltip (`src/components/product/MoreOptionsBadge.jsx`); the add button opens the quick view / product page instead of adding blindly, and the quick view shows "Choose Options" for these products.
  - Product page: new `DeliveryOptionList` (name, delivery time, price, stock). Price shows "From" until an option is chosen; the add-to-cart button reads "Select Options" and is gated until one is picked. (`useProductAction.js`, `ProductScreen.jsx`, `ProductModal.jsx`)
  - Cart: each option is its own line (`id` = `<product>[-<variation>]-d<optionId>`); the line price/stock come from the option; the server mirror and the login merge send/rebuild `delivery_option_id`; the cart item shows the option name. (`CartSyncProvider.jsx`, `LaravelCart.js`, `useAddToCart.js`, `CartItem.jsx`)
  - Checkout/order: `delivery_option_id` is sent with the totals preview and the order. (`LaravelCheckout.js`, `OrderServices.js`)
  - Account order pages show the chosen option and its delivery time (also appended to the line title in invoices/order tables). (`OrderDetailView.jsx`, `LaravelCheckout.js`)
- Verified locally in Docker: the product page shows the options, the card shows "More Options", picking an option updates the price and adds a `758-d4` cart line at the option price. Checkout/order placement was verified at API level only (not clicked through while signed in).
- Not included: layby with options, buy-now (this theme has none).
