# OneStopStore — Mobile App (Flutter) API Developer Guide

> Complete API reference and integration guide for building the OneStopStore Flutter mobile app.
> OneStopStore uses **the same Laravel backend API as the Rains.Africa app**; everything the OneStopStore web storefront (Next.js) does is available through this API.
>
> This document was generated from the backend source (`onestopstore-api`, Laravel 11 + Sanctum) and the web storefront (`onestopstore-main`). Anything that could not be confirmed from code is marked **unverified** — test it against a live environment before relying on it.

## Environments

| Environment | API base URL | Media base |
|---|---|---|
| Production | `https://api.onestopstore.co.zw/api` | `https://media.onestopstore.co.zw` |
| Local (Docker) | `https://api.onestopstore.local/api` | `https://media.onestopstore.local` |

All paths in this document are relative to the `/api` base (e.g. `POST /login` = `POST https://api.onestopstore.co.zw/api/login`).

## Table of contents

1. [Quick start for Flutter developers](#quick-start-for-flutter-developers)
2. [Endpoint index (cheat sheet)](#endpoint-index-cheat-sheet)
3. [Global conventions, analytics, app version](#part-1---global-conventions) (auth, headers, pagination, errors, currency)
4. [Auctions](#part-2---auctions)
5. [Web app feature map — screen checklist](#part-3---web-app-feature-map-screen-checklist)
6. [Auth & Account](#auth--account)
7. [Catalog & Content](#catalog--content-public-read-side)
8. [Cart, Checkout, Orders, Payments, Wallet, Refunds, Tickets, Vouchers, Layby](#cart-checkout-orders-payments-wallet-refunds-tickets-vouchers-and-layby)

## Quick start for Flutter developers

**1. HTTP client (dio / http).** Every request must send:

```
Accept: application/json
Content-Type: application/json          (multipart/form-data for uploads)
Accept-Language: en
Authorization: Bearer <token>           (only for authenticated endpoints)
```

Always send `Accept: application/json`, otherwise Laravel may answer 401/422 with an HTML redirect instead of JSON.

**2. Authentication flow (Sanctum bearer token).**

1. `POST /register` or `POST /login` → response contains an `access_token` (see *Auth & Account* for the exact shape).
2. Store the token in `flutter_secure_storage`; attach as `Authorization: Bearer …`.
3. Tokens do not expire for consumers; each login mints a new token (old ones are not revoked). Call `POST /logout` to revoke the current one.
4. On any `401`, clear the token and send the user to the login screen.

**3. Recommended app flow.**

| Step | Calls |
|---|---|
| App start | `GET /app-version` (force-update check) → `GET /settingsFront` → `GET /currencyFront` → `GET /home` |
| Browse | `GET /categoryFront`, `GET /product` (filters), `GET /search/products`, `GET /product/slug/{slug}` |
| Cart (logged-in) | `GET /cart?paginate=200`, `POST /cart`, `PUT /replace/cart`, `DELETE /cart/{id}` |
| Checkout | `GET /address`, `POST /checkout` (price/shipping preview), `POST /order`, then gateway redirect + `GET /verifyPayment/{order_number}` |
| After purchase | `GET /order`, `GET /trackOrder/{order_number}`, `POST /refund`, `POST /returns`, `POST /review` |

**4. Cart: the quantity gotcha (read this!).** `POST /cart`, `PUT /cart` and `POST /sync/cart` **ADD** the sent quantity to what is already stored. Only `PUT /replace/cart` (keyed by the cart row `id`) **sets** an absolute quantity. The web app once doubled cart quantities on every page refresh because it re-posted already-synced lines through `POST /cart`. In the mobile app: use `POST /cart` only for "add N more", and `PUT /replace/cart` for "set quantity to N". Never re-send server-pulled lines through `POST /cart`.

**5. Prices & currency.** Prices are stored in **USD**. The client converts using `exchange_rate` from `GET /currency`. The `currency` query parameter on search endpoints only filters regional visibility (`USD` = Zimbabwe, `ZMW` = Zambia, `ZAR` = South Africa). Products flagged `zimbabwe_only` / `zambia_only` / `sa_only` must be hidden client-side for other regions.

**6. Dart-specific behaviour.** The backend detects Flutter/Dart/okhttp user-agents and changes some payloads (e.g. numeric settings returned as strings; `standard_shipping_days`/`expedited_shipping_days` rewritten to ints). Parse numbers leniently (`num.tryParse`).

**7. Pagination.** `paginate=<page size>` and `page=<n>`. Many list endpoints return **all rows when `paginate` is omitted** — always pass it on lists (orders, cart, products).

**8. Error handling.** `401` unauthenticated; `403` forbidden; `404`; `422` validation (usually `{message, errors{field:[...]}}` but several auth/account endpoints return `{message, success:false}` with only the first error; `/login` validation errors are HTTP 400); `429` throttled. See *Global conventions*.

**9. Payments.** Supported `payment_method` values: `payfast, pdo_zambia, pese, cod, bank_transfer, paypal, yoco, wallet`. Gateway payments return a redirect URL — open it in an in-app WebView/custom tab, intercept the return URL, then poll `GET /verifyPayment/{order_number}`. Full details in *Part D — Payment methods and gateway flows*. If gateway creation fails after an order is placed, use `POST /rePayment` — never re-post `/order`.

**10. Use `order_number`, not `id`,** when addressing `/order/{…}`, `/trackOrder/{…}` and `/verifyPayment/{…}`.

**11. Known backend problems (for the backend team, not app developers)** are listed at the end of the Cart/Checkout/Orders section under *Part L*, plus per-endpoint "unverified/broken" notes. Notable: `GET /auctions/{id}/stream` is likely broken (poll `/auctions/{id}/bids` every 3–5 s instead); `/vouchers/wallet-balance` and `/vouchers/{id}` call missing controller methods; `DELETE /notifications/{id}` is unreliable; several `PUT` endpoints lack authorisation checks.

## Endpoint index (cheat sheet)

Legend: 🔓 public · 🔐 requires `Authorization: Bearer` · 👤 customer-facing · 🛠 staff/admin (not for the customer app)

### Auth & account
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | 🔓 | Create customer account |
| POST | `/login` | 🔓 | Login → bearer token |
| POST | `/forgot-password` | 🔓 | Send 5-digit reset code |
| POST | `/verify-token` | 🔓 | Verify reset code |
| POST | `/update-password` | 🔓 | Set new password with code |
| POST | `/logout` | 🔐 | Revoke token |
| GET | `/self` | 🔐 | Current user profile |
| PUT | `/updateProfile` | 🔐 | Update profile |
| PUT | `/updatePassword` | 🔐 | Change password |
| DELETE/POST | `/deleteaccount`, `/delete-account` | 🔐 | Delete own account |
| POST | `/email/resend-verification` | 🔐 | Resend verification email |
| CRUD | `/address` | 🔐 | Delivery/billing addresses |
| CRUD | `/paymentAccount` | 🔐 | Saved payment account (POST upserts) |
| GET | `/badge` | 🔐 | Admin pending counts (not meaningful for the customer app) |
| GET/PUT/DELETE | `/notifications`, `/notifications/markAsRead`, `/notifications/{id}` | 🔐 | In-app notifications |
| GET | `/country`, `/state` | 🔓 | Countries & states |
| GET | `/whatsapp-agents` | 🔓 | WhatsApp support agents |
| GET | `/app-version` | 🔓 | Force-update check |
| POST | `/contact-us` | 🔓 | Contact form |
| POST/GET | `/marketing-feedback/submit`, `/check-submitted` | 🔓 | Feedback |
| POST | `/store/register` | 🔓 | Vendor registration |

### Catalog & content
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/product` | 🔓 | Product list/filter/search |
| GET | `/product/{id}`, `/product/slug/{slug}` | 🔓 | Product detail |
| GET | `/product/by-tag`, `/product/by-skus`, `/product/recommendations/{identifier}` | 🔓 | Related lists |
| GET | `/search/products`, `/search/categories`, `/natural-search`, `/natural-search/expand` | 🔓 | Search |
| GET | `/category`, `/categoryFront`, `/category/{id}`, `/category/slug/{slug}` | 🔓 | Categories |
| GET | `/brand`, `/attribute`, `/attribute-value` | 🔓 | Filters |
| GET | `/front/review`; POST/PUT/DELETE `/review` | 🔓 / 🔐 | Reviews |
| GET/POST | `/question-and-answer` | 🔓 / 🔐 | Product Q&A |
| GET | `/blog`, `/blog/slug/{slug}`, `/page`, `/page/slug/{slug}`, `/faq` | 🔓 | Content |
| GET | `/home`, `/theme/show`, `/themeOptionsFront`, `/settingsFront`, `/currencyFront`, `/tax`, `/coupon`, `/orderStatus` | 🔓 | App configuration |
| CRUD | `/wishlist`, `/compare` | 🔐 | Wishlist & compare |

### Cart, checkout, orders
| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/cart?paginate=200` | 🔐 | Server cart |
| POST | `/cart`, PUT `/cart`, POST `/sync/cart` | 🔐 | **Add** quantity |
| PUT | `/replace/cart` | 🔐 | **Set** quantity |
| DELETE | `/cart/{id}`; POST `/clear/cart` | 🔐 | Remove / clear |
| POST | `/checkout` | 🔐 | Price & shipping preview |
| POST | `/checkout/quotation-pdf` | 🔐 | Quotation PDF |
| POST/GET | `/order`, `/order/{order_number}` | 🔐 | Place / view order |
| POST | `/rePayment` | 🔐 | Retry payment |
| GET | `/trackOrder/{order_number}`, `/verifyPayment/{order_number}` | 🔐 | Tracking / payment status |
| CRUD | `/refund`, `/returns` | 🔐 | Refunds & returns |
| GET | `/wallet/consumer/self`, `/points/consumer` | 🔐 | Wallet & points |
| POST/GET | `/vouchers/check`, `/redeem`, `/my-vouchers`, `/redeemed` | 🔐 | Gift cards |
| CRUD | `/tickets…` | 🔐 | Support tickets |
| — | `/layby/*` | 🔓/🔐 | Layby (installments) |

### Auctions
`GET /auctions`, `/auctions/{id}`, `/auctions/{id}/bids` (public) · `POST /auctions/{id}/bid`, `/pay`, `/pay-deposit`, `/confirm-deposit`, auto-bid, refunds (🔐).

### Analytics
`POST /analytics/track/page-view|session|event|cart-abandonment` (public, throttled).

---

## Part 1 - Global conventions

Sources: `routes/api.php`, `bootstrap/app.php`, `app/Http/Middleware/*`, `config/{sanctum,cors,app,analytics}.php`, `AuthController`, Next.js `services/CommonService.js`, `lib/auth-server.js`, `.env*`. Items marked **unverified** could not be confirmed from source.

### Base URLs

| Environment | API base (all paths below are relative to this) | Media host |
|---|---|---|
| Production (OneStopStore) | `https://api.onestopstore.co.zw/api` | `https://media.onestopstore.co.zw` |
| Local (Docker/Traefik, self-signed cert) | `https://api.onestopstore.local/api` | `https://media.onestopstore.local` |
| Production (Rains.Africa, same codebase; per existing WhatsApp doc) | `https://api.raines.africa/api` | unverified |
| Plain `php artisan serve` | `http://localhost:8000/api` | - |

- Every route in `routes/api.php` is served under the `/api` prefix. Exceptions served from the API root (no `/api`): `/up` (health check), `/catalog/{slug}` (HTML catalog pages), web/admin routes.
- Laravel sometimes emits `http://` URLs for its own host (APP_URL misconfiguration behind the proxy). The web app force-upgrades `http://` to `https://` for the hosts `api.onestopstore.{local,co.zw}` and `media.onestopstore.{local,co.zw}`. **Flutter should do the same** (rewrite scheme to https when host is one of ours) before loading images, otherwise requests 404 or fail.
- Health check: `GET {origin}/up` (outside `/api`).

### Authentication (Laravel Sanctum, bearer token)

- Library: `laravel/sanctum` personal access tokens. Guard used on routes: `auth:sanctum`. Send `Authorization: Bearer <access_token>`.
- Obtain a token:
  - `POST /login` body `{ "email": "...", "password": "..." }` (email is lower-cased/trimmed server-side). Only users with the `consumer` role can log in here (vendors/admin get the same generic error).
  - `POST /register` body `{ "name", "email", "password", "password_confirmation", "country_code", "phone" }` (`password` min 8 and confirmed; `phone` min 9 and unique among non-deleted users; `company_name` optional). Registration returns a token immediately (no email-verify gate).
- Success response for both (HTTP 200, a plain array so JSON object):

```json
{
  "access_token": "123|AbCdEf...",
  "permissions": [],
  "success": true
}
```

- The `access_token` is `"<tokenId>|<plain>"`; store the full string and send it as the bearer. After login the Next.js app calls `GET /self` with the token to load the profile.
- Login failure: HTTP **400** `{ "message": "The entered credentials are incorrect. Please try again!", "success": false }`. Other login precondition failures (verifyLogin) also return 400 with `{message, success:false}`.
- Register validation failures are thrown as `ExceptionHandler(message, 422)` carrying only the **first** validation message (shape intended: `{ "message": "...", "success": false }`, status 422). **Unverified**: whether the framework renders that thrown exception with the intended body or as a generic 500 - the custom `App\Exceptions\Handler` does not appear to be bound in Laravel 11 `bootstrap/app.php` (its `withExceptions` is empty). The Next.js client just reads `message`; do the same and also handle `errors{}` and plain 500.
- **Expiry**: `config/sanctum.php` -> `'expiration' => null`, so consumer tokens **never expire** on their own. They are removed only on logout (`POST /logout`, deletes the presented token) or account deletion. Admin tokens (`backendLogin`) expire in 6 hours (not relevant to the app). Handle a 401 by clearing the stored token and routing to login anyway.
- **Abilities**: consumer tokens are created with the default `['*']` ability; no route in the consumer API checks specific abilities. A `role_type` column on the token row is set to the user's role name (e.g. `consumer`) - used server-side to filter orders/refunds to the owner.
- **Storage (web)**: next-auth JWT session cookie holds `session.user.token`; server actions forward it as `Authorization: Bearer`. **Flutter**: store in `flutter_secure_storage`.
- Other auth endpoints: `POST /forgot-password {email}` (emails a 5-digit code), `POST /verify-token {email, token}`, `POST /update-password {email, token, password, password_confirmation}`, `POST /logout` (auth), `GET /self` (auth, current profile), `PUT /updateProfile`, `PUT /updatePassword` (auth), `POST /email/resend-verification` (auth), `GET /email/verify/{id}/{hash}` (signed URL from email), `DELETE|POST /delete-account` or `/deleteaccount` (auth; soft-deletes the account; POST alias exists for clients that cannot send DELETE).
- `GET /user` (auth) returns the raw Eloquent user.

### Headers

| Header | Required | Notes |
|---|---|---|
| `Accept: application/json` | **Yes, always** | Without it Laravel may answer errors with HTML/redirects instead of JSON 401/422. |
| `Content-Type: application/json` | For JSON bodies | Use `multipart/form-data` for uploads. |
| `Authorization: Bearer <token>` | For `auth:sanctum` routes | Some public routes (e.g. `GET /auctions/{id}`) optionally read it to personalise the response. |
| `Accept-Language: en` | Optional | Handled by the `localization` middleware (below). |
| `User-Agent` | Set a real one | See mobile-client note. |

- **Localization middleware** (`App\Http\Middleware\localization`, alias `localization`): reads `Accept-Language`, walks the comma list, takes the first tag matching `^[a-z]{2}([-_]...)?$`, uses its 2-letter primary subtag (e.g. `en-US` -> `en`, `fr;q=0.8` -> `fr`) and calls `app()->setLocale()`. Falls back to `config('app.locale')` = `en` (`APP_LOCALE`, fallback `APP_FALLBACK_LOCALE=en`). **Only attached to the auth:sanctum group and some admin groups** (see `Route::group(['middleware' => ['localization','auth:sanctum']]`), not to public routes. Which languages actually have translation files: **unverified** (the web app only ever sends `en`; its proxy lists `en, en-US, es, fr, nl-NL` as locale prefixes but that is legacy template config).
- **No currency or country header exists.** There is no `X-Currency` / `X-Country` / `Accept-Currency` handling in the API (searched `app/`). See "Currency and multi-country" below.
- **Mobile User-Agent behaviour**: `CoerceMobileResponse` (appended to the whole `api` middleware group) detects mobile clients by UA regex `okhttp|Dart/|Flutter|ReactNative|CFNetwork.*Darwin|expo` (the default Dart `http`/`dio` UA `Dart/x.y (dart:io)` matches). For those clients it rewrites any JSON key `standard_shipping_days` / `expedited_shipping_days` from a range string like `"7-14"` to the first integer `7`. Web clients get the raw string. So don't spoof a browser UA if you want ints.
- **CORS**: `paths: api/*`, all methods, `allowed_headers: *`, `supports_credentials: true`. Production origins are only the web/admin/media domains - irrelevant to native Flutter (CORS is browser-only) but matters for Flutter Web.
- Global middleware: TrustProxies, HandleCors, ValidatePostSize, TrimStrings (except description-like fields), ConvertEmptyStringsToNull. **Empty strings become `null`** - don't rely on `""` being preserved.

### Pagination

- Laravel `->paginate()` is used almost everywhere. Query params: `page` (1-based) and `paginate` (page size; used by most controllers, e.g. `?paginate=20&page=2`; products default 20, ES search caps `size` at 100).
- Standard Laravel length-aware paginator JSON (flat, not wrapped in `meta`/`links` objects for the auction endpoints):

```json
{
  "current_page": 1,
  "data": [ { } ],
  "first_page_url": "https://api.onestopstore.co.zw/api/auctions?page=1",
  "from": 1,
  "last_page": 3,
  "last_page_url": "https://api.onestopstore.co.zw/api/auctions?page=3",
  "links": [ { "url": null, "label": "&laquo; Previous", "active": false }, { "url": "...?page=1", "label": "1", "active": true } ],
  "next_page_url": "https://api.onestopstore.co.zw/api/auctions?page=2",
  "path": "https://api.onestopstore.co.zw/api/auctions",
  "per_page": 12,
  "prev_page_url": null,
  "to": 12,
  "total": 30
}
```

- Some controllers/resources wrap differently (Laravel API Resources produce `{data, links, meta}`); `GET /auctions/won` returns a hand-built `{ data, meta:{current_page,last_page,total}, ... }`. Check each endpoint's section. Stop when `current_page >= last_page` (or `next_page_url == null`).
- **Gotcha**: `GET /auctions` ignores `paginate` and always returns 12 per page (the web app sends `?paginate=24` but only gets 12). Product lists do honour `paginate`.
- The web adapter tolerates both shapes: `Array.isArray(payload) ? payload : payload.data`.

### Error response shapes and status codes

Laravel 11 default JSON rendering (when `Accept: application/json`):

| Status | When | Body |
|---|---|---|
| 401 | Missing/invalid token on `auth:sanctum` route | `{ "message": "Unauthenticated." }` |
| 403 | Authorization failure / business rule (e.g. banned bidder, not the winner, `can:` permission) | `{ "message": "...", "error_code": "..." }` for auction rules (see Part 2); otherwise `{ "message": "This action is unauthorized." }` |
| 404 | `findOrFail` / unknown route | `{ "message": "No query results for model [App\\Models\\AuctionItem] 99" }` (debug off may show a generic "Not Found") - **unverified** exact text; the custom `Handler::register()` has a NotFoundHttpException renderer that re-throws a 400, but the class looks unbound, so expect plain 404 |
| 422 | `$request->validate()` failure | `{ "message": "The amount field is required.", "errors": { "amount": ["The amount field is required."] } }` |
| 429 | Throttle exceeded | `{ "message": "Too Many Requests." }` + headers `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| 400 | Many controller-level business errors (login failure, "no eligible deposit", etc.) | `{ "message": "...", "success": false }` (success key present on auth-related ones only) |
| 500 | Unhandled | `{ "message": "Server Error" }` (debug false) |

- Business-rule errors frequently use **422** with just `{ "message": "..." }` (no `errors` key). Always read `message` first, `errors` second.
- Custom machine-readable `error_code` values (auctions): `auction_bid_banned`, `deposit_required`.
- The web `handleResponse` only reads `error.message`; mirror that and add `errors` handling for forms.

### Rate limiting / throttles

| Route group | Limit |
|---|---|
| `POST /auction-events` | `throttle:120,1` (120/min per IP) |
| `GET /app-version` | `throttle:120,1` |
| `/analytics/track/*`, `/analytics/active-users` | named limiter `analytics`: 120/min keyed by `analytics:{session_id or IP}`. Plus `filter.bots` middleware. |
| `product` index/show, `product/by-tag`, `by-skus`, `recommendations`, `productPagination`, `search/products`, `search/categories` | `throttle:60,1` |
| `product/slug/{slug}`, `category/slug/{slug}` | `throttle:120,1` |
| `natural-search`, `product/search-promo` | `throttle:30,1` |
| `catalog/{slug}/hit` | `throttle:300,1` |
| `sitemap/*` | `throttle:120,1` |
| `products/skus/*` | `throttle:60,1` |
| Everything else | No explicit throttle (unverified whether a default `api` limiter exists; none is configured in `bootstrap/app.php`). |

Throttling is per client IP (no token key). On 429 respect `Retry-After`. Analytics endpoints silently return `200 {"success":true}` for bots and when over limit (no 429 visible for bots).

### File upload conventions

- Generic image upload (requires bearer, `auth:sanctum`): `POST /attachment` as `multipart/form-data`.
  - File field: `attachments[]` (multiple) or `attachment` (single). Aliases accepted and normalised server-side: `file`, `image`, `files`, `images`. Also accepts base64 (`attachment_base64`, `file_base64`, `attachments_base64`, `files_base64`, a `data:` URI in `image`) and remote URLs (`attachment_url`, `file_url`, `attachments_url`, `files_url`).
  - Validation: `file`, `mimes:jpg,jpeg,png,webp,gif,avif,bmp,svg,ico,file`, **max 20 MB each** (20480 KB). Failures -> `ExceptionHandler(message, 422)`; nothing provided -> 400 "Attachment is Null Value, Required Image Binary".
  - The API forwards the file to a separate Media app (`IMAGE_API_URL`, field `image`, `POST /attachments`) and stores a local record keyed by the same `uuid`.
  - Response: HTTP **201** with the created attachment record(s). Keys seen on the model: `id`, `uuid`, `name`, `file_name`, `image_url`, `original_url`, `takealot_url` (supplier CDN fallback). Exact envelope (single object vs array) **unverified**.
  - Other attachment routes: `GET /attachment/{uuid}`, `PUT /attachment/{uuid}`, `DELETE /attachment/{uuid}`, `POST /attachment/deleteAll`.
- How images are referenced elsewhere: entities reference attachments by **id** (e.g. `profile_image_id`, review `review_image_id`); responses embed the attachment object (`product_thumbnail`, `product_galleries[]`, ...) with `image_url`/`original_url`. Image URL resolution order used by the web: `image_url` -> `original_url` -> `takealot_url`.
- Chunked document upload (layby ID/proof documents): `POST /layby/documents/upload-chunk` then `POST /layby/documents/upload-complete` (auth). Files are later streamed from `GET /layby-files/{path}`.
- Auction images are not uploaded by consumers (admin only).

### Media / storage URLs

- Product/attachment images: absolute URLs on the media host (`https://media.onestopstore.co.zw/...`) or supplier CDNs (`takealot_url`). Use as given (after the https upgrade above).
- Auction images: `images` is a JSON array of absolute URLs, normalised by `AuctionItem::getImagesAttribute` to `{APP_URL}/api/auction-files/auction-images/{uuid}.jpg` (streamed by Laravel from the `public` disk, no auth). `thumbnail` = first element (or `null`).
- Other streamed files: `GET /layby-files/{path}`, `GET /sitemaps/{file}.xml`.
- Product `image_urls` (auction detail only) = thumbnail + gallery URLs, de-duplicated.

### Currency and multi-country behaviour

- **Base currency is USD.** Orders created by the auction code set `currency = config('app.currency','USD')`, symbol `$`, `exchange_rate 1`. Auction amounts (bids, deposit, delivery) are all USD numbers and are formatted with `$` in server messages.
- Currencies list: `GET /currencyFront` (public) / `GET /currency`. Settings (default currency symbol etc.): `GET /settings`. Product prices come back in USD (`price`, `sale_price`); the web app converts for display using its own selected currency (`useCurrency`, codes `USD`, `ZMW`, `ZAR`, ...). Whether the API itself converts amounts is **unverified** - it does not read any currency header.
- **Regional product flags** on products: `zimbabwe_only`, `zambia_only`, `sa_only` (booleans), plus `original_currency_code`. **The API does NOT filter these out** (see comment in `ProductController`): it returns every product, and the storefront hides/blurs them client-side by currency:
  - hide when `zambia_only` and selected currency != `ZMW`
  - hide when `zimbabwe_only` and selected currency != `USD`
  - hide when `sa_only` and selected currency != `ZAR`
  Flutter must replicate this gate (decide the user's "region currency", then hide or disable-cart items). Banners (`HomePage`) also carry `zambia_only`/`zimbabwe_only` flags. Server-side product list filtering by these flags exists only in admin endpoints.
- Phone `country_code` is sent on register (web hardcodes `"263"`). Countries list: `GET /country?paginate=300`; states: `GET /state`.

### Soft deletes

- Models using `SoftDeletes` include `AuctionItem` and `User`. Soft-deleted rows are excluded automatically from queries (`findOrFail` -> 404), and `users.email`/`users.phone` uniqueness ignores soft-deleted users (`deleted_at` NULL clause). Account deletion (`/delete-account`) is a soft delete. Responses may include a `deleted_at` key (normally `null`). Clients never need to send it.

### Dates and times

- Server timezone `UTC` (`APP_TIMEZONE`, default `UTC`). Eloquent datetime casts serialise as ISO-8601 UTC with microseconds and `Z`, e.g. `"2026-03-13T10:00:00.000000Z"`. Hand-built fields use `toIso8601String()`, e.g. `"2026-03-13T10:00:00+00:00"` (the auction `bids[].created_at` and `bid` response `ends_at`). Parse both with `DateTime.parse` and `.toLocal()` for display.
- Decimal-cast columns (Eloquent `decimal:2`) serialise as **strings** (`"12.00"`) - e.g. auction `current_bid`, `starting_price`, `reserve_price`, `min_bid_increment`, `winner_bid`. Helper-computed fields (`minimum_next_bid`) are JSON numbers (float). Parse defensively (`num.tryParse(v.toString())`).

### Analytics tracking endpoints (all public, no auth required; bearer optional)

Middleware: `throttle:analytics` + `filter.bots`. All write endpoints return `200 {"success": true}` immediately and queue the work; if `ANALYTICS_ENABLED=false`, bot traffic, or the rate limit hits, they still return `200 {"success":true}`. If a bearer token is sent, `user_id` is attached via `auth()->id()` (note: these routes have no `auth:sanctum` middleware, so whether the bearer is resolved is **unverified** - treat user attribution as best-effort).

#### POST /analytics/track/page-view

```json
{
  "session_id": "b6e1f9e0-...",
  "url": "https://onestopstore.co.zw/product/foo",
  "path": "/product/foo",
  "page_title": "Foo",
  "referrer": null,
  "utm_source": null, "utm_medium": null, "utm_campaign": null, "utm_term": null, "utm_content": null,
  "duration": 12
}
```
Required: `session_id`, `url`, `path`. For a Flutter app use a pseudo URL/path such as `app://product/123` / `/product/123`.

#### POST /analytics/track/session

```json
{ "session_id": "b6e1f9e0-...", "landing_page": "/", "referrer": null, "heartbeat": true, "duration": 30 }
```
Required: `session_id`. Call once at app start, then periodically with `heartbeat: true`.

#### POST /analytics/track/event

```json
{
  "session_id": "b6e1f9e0-...",
  "event_type": "click",
  "event_category": "cart",
  "event_name": "add_to_cart",
  "event_data": { "product_id": 12, "qty": 1 },
  "page_url": "/product/foo",
  "element_id": null, "element_class": null, "element_text": null,
  "value": 19.99
}
```
Required: `session_id`, `event_type`, `event_name`. Event names `page_visible`, `page_hidden`, `heartbeat` are dropped server-side. Accepts `text/plain` bodies (sendBeacon) - body is JSON-decoded if the form is empty.

#### POST /analytics/track/cart-abandonment

```json
{
  "session_id": "b6e1f9e0-...",
  "email": "user@example.com",
  "cart_items": [ { "product_id": 12, "name": "Foo", "qty": 1, "price": 19.99 } ],
  "cart_value": 19.99,
  "currency": "USD",
  "items_count": 1,
  "abandonment_stage": "checkout",
  "abandonment_reason": "closed_app"
}
```
Required: `session_id`, `cart_items` (array), `cart_value` (numeric), `items_count` (int), `abandonment_stage`. `email` nullable valid email (defaults to the authed user's email). `currency` defaults `USD`.

#### GET /analytics/active-users

```json
{ "active_users": 17, "timestamp": "2026-11-24T08:30:00+00:00" }
```
Count of non-bot sessions active in the last 5 minutes (cached 30 s).

Admin-only (`auth:sanctum`, not for the app): `GET /analytics/dashboard/stats`, `/dashboard/timeseries`, `/cart-abandonments`, `/sessions/{id}`.

Validation failures on these (e.g. missing `session_id`) return a normal 422.

### App version and force-update

#### GET /app-version  (public, `throttle:120,1`, CDN-cacheable `Cache-Control: public, max-age=300`)

Query params:

| Param | Notes |
|---|---|
| `platform` | `android` or `ios`. Any other value -> 400 `{ "error": "Invalid platform. Must be \"android\" or \"ios\"." }`. Omit to receive both. |
| `current_version` | Your installed version string (e.g. `1.4.2`). If supplied, server computes `force_update` for you. |

Response with `?platform=android&current_version=1.2.0`:

```json
{
  "android": {
    "latest_version": "1.5.0",
    "latest_build": 42,
    "minimum_version": "1.3.0",
    "force_update": true,
    "release_notes": "Bug fixes and auctions improvements",
    "store_url": "https://play.google.com/store/apps/details?id=...",
    "released_at": "2026-11-01T00:00:00+00:00"
  }
}
```
Without `platform` the object has both `android` and `ios` keys. If the table is empty -> HTTP 500 `{ "error": "No version data available." }` (note: `error`, not `message`).

**Force-update logic**: `force_update = row.force_update (admin flag) OR (current_version provided AND version_compare(current_version, minimum_version, '<'))`. Recommended client logic:
1. On launch call `/app-version?platform=...&current_version=<pubspec version>`.
2. If `force_update == true` -> block the app with a mandatory update screen linking to `store_url`.
3. Else if installed < `latest_version` -> optional "update available" prompt (compare yourself; `latest_build` is an integer build number).
Because the response is CDN-cached for 5 minutes and the `current_version` is part of the cache key only if the CDN varies on query string, rely on the `force_update` field **and** also compare `minimum_version` locally (**unverified** whether CDN includes the query string). Admins manage values via `GET /admin/app-versions`, `PUT /admin/app-versions/{platform}` (admin token; not for the consumer app).

---

## Part 2 - Auctions

Controllers: `App\Http\Controllers\AuctionController`, `Api\AuctionAutoBidController`, `Api\AuctionEventController`. Settings model: `AuctionSetting` (single row). Closing job: `php artisan auctions:close-expired`, scheduled **every minute**.

### Concepts and bidding rules

- Auction item `status` enum: `draft` (hidden from all public endpoints), `active`, `ended`, `cancelled`. An item is **live** when `status == active AND starts_at <= now < ends_at` (`is_active`); **upcoming** when `status == active AND starts_at > now` (`is_upcoming`); **ended** when `status == ended` or `ends_at <= now` (`is_ended`). Note the transition to `status=ended` and winner assignment only happens when the scheduler runs (~within 60 s after `ends_at`), so for up to a minute `is_ended` is true while `status` is still `active` and `winner` is null.
- `condition` enum: `damaged`, `refurbished`, `as-is`. `branch` is a free string (e.g. `Harare`).
- **Minimum next bid** = `(current_bid ?? starting_price) + min_bid_increment`. Server field `minimum_next_bid`.
- **Anti-snipe auto-extend**: if `auto_extend_minutes > 0` and a bid lands within the last `auto_extend_minutes` minutes before `ends_at`, `ends_at` is pushed back by `auto_extend_minutes`. Always re-read `ends_at`/`time_remaining_seconds` after any bid and in every poll.
- **Reserve price**: `reserve_price` is returned in API payloads. Close job assigns the highest bid as winner without an enforced reserve check in the code reviewed (**unverified** whether reserve is enforced elsewhere). Don't show reserve to users.
- **Bid gates in order** (`POST /auctions/{id}/bid`): (1) active auction ban -> 403 `auction_bid_banned`; (2) auction must be live -> 422; (3) if deposit (bid fee) is enabled in settings AND user is not `auction_approved` AND no paid deposit for this auction -> 403 `deposit_required`; (4) `amount >= minimum_next_bid` -> else 422; (5) cannot bid on own auction (`created_by == user`) -> 422.
- Email verification is **not** enforced for bidding (gate removed in code; `bid-requirements` always reports `email_verified: true`).
- **Winner**: highest/latest bid when the close job runs: `winner_id`, `winner_bid` set, status `ended`, winner emailed, deposits of all non-winning bidders refunded **to the in-app wallet automatically** (`refunded_at` set). The winner's deposit is held and deducted from the amount due when they pay.
- **Payment window**: `AuctionSetting.hours_to_pay` (default 48 h) with reminder emails at `reminder_1_hours` (12) and `reminder_2_hours` (24). Non-payment leads to an `AuctionBan` (blocks bidding, paying and refund requests) lifted only by admin/support.
- Outbid emails are sent to the previous leader (no push notification endpoint in this module).
- Admin-configurable `AuctionSetting`: `require_email_verification` (flag, informational), `bid_fee_enabled`, `bid_fee_amount`, `delivery_enabled`, `delivery_price`, `delivery_radius_km` (15), `hours_to_pay`, `reminder_1_hours`, `reminder_2_hours`.

### Auction item object (shared shape)

Returned (with eager data) by list/show/won. Decimals are strings; computed helpers are appended.

```json
{
  "id": 7,
  "sort_order": 0,
  "title": "Samsung 55\" TV - cracked screen",
  "branch": "Harare",
  "description": "Panel damaged, powers on.",
  "condition": "damaged",
  "product_id": 1234,
  "images": ["https://api.onestopstore.co.zw/api/auction-files/auction-images/3f9a....jpg"],
  "starting_price": "50.00",
  "reserve_price": "120.00",
  "current_bid": "85.00",
  "bid_count": 6,
  "min_bid_increment": "5.00",
  "status": "active",
  "starts_at": "2026-11-20T08:00:00.000000Z",
  "ends_at": "2026-11-27T18:00:00.000000Z",
  "auto_extend_minutes": 5,
  "winner_id": null,
  "winner_bid": null,
  "order_id": null,
  "created_by": 1,
  "fulfillment_method": null,
  "delivery_cost": 0,
  "delivery_address": null,
  "fulfillment_status": null,
  "fulfilled_at": null,
  "payment_deadline": null,
  "created_at": "2026-11-19T10:00:00.000000Z",
  "updated_at": "2026-11-24T07:59:00.000000Z",
  "deleted_at": null,
  "winner": null,
  "thumbnail": "https://api.onestopstore.co.zw/api/auction-files/auction-images/3f9a....jpg",
  "time_remaining_seconds": 270000,
  "minimum_next_bid": 90.0,
  "is_active": true,
  "is_upcoming": false,
  "is_ended": false
}
```

`current_bid` is `null` until the first bid. `winner` is `{ "id": 5, "name": "Jane Doe" }` or `null` (list/show load `winner:id,name`). Use `time_remaining_seconds` only as a seed and drive the countdown locally off `ends_at` (UTC) to avoid drift.

### GET /auctions  (public)

Query: `tab` = `active` (default) | `upcoming` | `ended` | anything else (e.g. `all`) = all non-draft; `search` (ILIKE on title/description; bypasses cache); `branch` (exact match); `page`. **Fixed page size 12** (ignores `paginate`). Ordering: `sort_order`, then live first, then upcoming, then ended, then `ends_at` ascending. Result is cached 10 seconds server-side (except searches).

Response: standard Laravel paginator (see Part 1) whose `data[]` are auction item objects.

```json
{
  "current_page": 1,
  "data": [ { "id": 7, "title": "Samsung 55\" TV - cracked screen", "thumbnail": "https://.../3f9a.jpg", "current_bid": "85.00", "bid_count": 6, "ends_at": "2026-11-27T18:00:00.000000Z", "is_active": true, "is_upcoming": false, "is_ended": false, "minimum_next_bid": 90.0, "time_remaining_seconds": 270000, "winner": null }, "..." ],
  "last_page": 2, "per_page": 12, "total": 18, "next_page_url": "https://api.onestopstore.co.zw/api/auctions?page=2"
}
```

(`data[]` objects contain the full item shape; abbreviated here.) The web list card uses: `id,title,thumbnail,condition,current_bid ?? starting_price,bid_count,ends_at,is_active,is_upcoming,is_ended`. Cache note: the list can lag a just-placed bid by up to 10 s; use `/bids` for fresh numbers.

### GET /auctions/{id}  (public, `{id}` numeric)

404 for unknown or `draft`. Includes `product` (`id,name,slug,description,unit,short_description,specifications,price,sale_price,stock_status,status,sku` with `product_thumbnail`, `product_galleries` and a computed `image_urls[]`), `winner`, and the helper fields from the shared shape.

**Auth-aware extras**: if a valid bearer token is sent (even though the route is public; the controller resolves it manually via `PersonalAccessToken::findToken`) AND that user is the winner, the response additionally contains:

```json
{
  "winner_bid": 85.0,
  "deposit_paid": 20.0,
  "delivery_options": {
    "collection": { "label": "Free Collection", "cost": 0 },
    "delivery": { "label": "Home Delivery", "cost": 10.0, "enabled": true, "radius_km": 15 }
  }
}
```
Send the bearer on this call when showing the "Pay now" screen to the winner.

### GET /auctions/{id}/bids  (public, polling endpoint)

Last 30 bids, newest first, plus live state. Bidder names are masked to first name + user id.

```json
{
  "bids": [
    { "id": 91, "amount": "85.00", "bidder": "Jane #5", "user_id": 5, "created_at": "2026-11-24T08:29:41+00:00" },
    { "id": 90, "amount": "80.00", "bidder": "Tendai #12", "user_id": 12, "created_at": "2026-11-24T08:20:03+00:00" }
  ],
  "current_bid": "85.00",
  "bid_count": 6,
  "minimum_next_bid": 90.0,
  "time_remaining_seconds": 269100,
  "status": "active",
  "winner": null
}
```
Compare `bids[].user_id` with your own user id to show "You are winning/outbid" (note auto-bids are recorded as bids by the auto-bidder). `time_remaining_seconds` is 0 once ended.

### GET /auctions/{id}/stream  (public, Server-Sent Events)

`Content-Type: text/event-stream`, headers `Cache-Control: no-cache, no-store`, `X-Accel-Buffering: no`. Pushes a `data:` frame every **5 s** for at most **55 s**, then the server closes the connection (client must reconnect); it also sends one final frame and closes when the auction ends. No `event:` names or ids; each frame is one line `data: {json}` followed by a blank line:

```
data: {"current_bid":"85.00","bid_count":6,"minimum_next_bid":90,"time_remaining_seconds":269100,"status":"active","winner":null}

```
Fields identical to the top-level (non-`bids`) fields of `/bids`.

**Important/unverified gotcha**: the stream query does `select([... 'minimum_bid_increment' ...])` but the table column is `min_bid_increment` (see migration and model). On PostgreSQL this will raise "column does not exist" so the stream is **likely broken in production**. The Next.js app does **not** use `/stream` at all (only `/bids` is polled). **Recommendation for Flutter: poll `GET /auctions/{id}/bids` every 3-5 s while the screen is visible** (and 1-2 s in the last minute if you accept the load), pause when the app is backgrounded, and stop when `status != active` or `time_remaining_seconds == 0`. If you later try SSE: reconnect automatically after the 55 s cut-off and fall back to polling on any error.

### GET /auctions/{id}/bid-requirements  (auth)

What the current user must do before bidding.

```json
{
  "require_email_verification": true,
  "email_verified": true,
  "bid_fee_enabled": true,
  "bid_fee_amount": 20.0,
  "deposit_paid": false,
  "auction_approved": false,
  "is_banned": false,
  "ban_message": null,
  "wallet_balance": 35.5
}
```

Client decision logic: if `is_banned` -> show `ban_message`, disable bidding. Else if `bid_fee_enabled && !auction_approved && !deposit_paid` -> show deposit step (amount `bid_fee_amount`; payment methods incl. `wallet` if `wallet_balance >= bid_fee_amount`). Else allow bidding. (`auction_approved` users bypass the deposit entirely.) `email_verified` is always `true` (gate removed). Side effect: if a pending deposit's linked order is already paid, this call marks the deposit paid.

### POST /auctions/{id}/pay-deposit  (auth)

Refundable bid deposit, one per user per auction.

Request:

```json
{
  "payment_method": "wallet",
  "return_url": "https://app.example/return",
  "cancel_url": "https://app.example/cancel"
}
```
`payment_method` required string (values accepted by the order system: `wallet`, `payfast`, `pese`, `paypal`, `yoco`, `pdo_zambia`, `cod`, `bank_transfer` - which are enabled for deposits is **unverified**; use the gateway list from `GET /settings`). `return_url`/`cancel_url` optional valid URLs (gateway return pages - for a native app use a deep-link capable web URL or custom handling; **unverified** that custom schemes pass `url` validation - `url` rule accepts only http/https/ftp-style schemes, so use an https universal link).

Responses:
- **Wallet** (instant): 200 `{ "message": "Deposit paid from wallet successfully.", "paid": true }`. Insufficient: 422 `{ "message": "Insufficient wallet balance. You have $5.00 but need $20.00." }`.
- **Gateway**: 200 with the gateway intent from `OrderRepository::rePayment`, e.g. `{ "order_number": "1042", "transaction_id": "...", "url": "https://.../payfast/redirect?...", "is_redirect": true }`. Open `url` in a webview/browser; then call `confirm-deposit`. Pesepay returns its own shape (`redirect_url`, `poll_url`; exact keys **unverified**). Re-calling re-uses the existing pending order.
- 422 `{ "message": "Bid deposit is not currently required." }` / `"This auction is not currently active."` / `"You have already paid the deposit for this auction."`.

### POST /auctions/{id}/confirm-deposit  (auth, no body)

Call after returning from the gateway (and poll a few times, e.g. every 3 s up to ~60 s, because the gateway webhook may lag). Idempotent.

```json
{ "deposit_paid": true, "message": "Deposit confirmed!" }
```
Other messages: `"Deposit already confirmed."` (`deposit_paid: true`), `"No pending deposit found."` / `"Deposit payment is still pending."` (`deposit_paid: false`).

### POST /auctions/{id}/bid  (auth)

Request:

```json
{ "amount": 90 }
```
`amount`: required numeric, min 0.01 (also must be >= `minimum_next_bid`). Whole auction row is locked; one transaction records the bid and may extend `ends_at`. Then auto-bids are resolved (see below).

Success 200:

```json
{
  "message": "Bid placed successfully!",
  "current_bid": "92.00",
  "bid_count": 8,
  "minimum_next_bid": 97.0,
  "time_remaining_seconds": 269900,
  "ends_at": "2026-11-27T18:00:00+00:00"
}
```
**Note**: `current_bid` may be higher than your `amount` if another user's auto-bid immediately outbid you (their counter-bid is applied before the response). Always show the returned numbers and compare to see whether you are still leading (re-fetch `/bids`; check top `user_id`).

Errors:
- 403 `{ "message": "You are banned from placing bids because you failed to pay for \"<item>\". Please contact support to resolve this.", "error_code": "auction_bid_banned", "banned_for": "<item title>" }`
- 403 `{ "message": "You must pay the refundable bid deposit of $20.00 before placing a bid. This will be refunded if you do not win.", "error_code": "deposit_required", "deposit_amount": 20.0 }`
- 422 `{ "message": "This auction is not currently active." }`
- 422 `{ "message": "Your bid must be at least $90.00" }`
- 422 `{ "message": "You cannot bid on your own auction." }`
- 422 validation `{ "message": "The amount field is required.", "errors": { "amount": [...] } }`
- 401 unauthenticated.
The web action treats the response as success only when `current_bid` is present; do the same (don't rely only on HTTP code).

### Auto-bid (proxy bidding)

Server-side max-bid engine (`Api\AuctionAutoBidController` + `resolveAutoBids`): a user stores a maximum; after every human bid the engine finds the highest *other* user's active auto-bid with `max_amount >= minimum_next_bid` and places a counter-bid at exactly `minimum_next_bid`, recursing up to 10 hops. An auto-bid is deactivated once the minimum next bid exceeds its max. Auto-bids are **not** placed against the setter's own bids; the setter must place the first bid themselves (setting an auto-bid does not itself place a bid). The deposit gate is **not** re-checked when setting an auto-bid (**unverified**: it's only enforced on `/bid`).

#### GET /auctions/{id}/auto-bid  (auth)

```json
{ "auto_bid": { "id": 3, "max_amount": 150.0, "is_active": true } }
```
or `{ "auto_bid": null }`.

#### POST /auctions/{id}/auto-bid  (auth)

Request `{ "max_amount": 150 }` (required numeric, min 0.01, must be >= current `minimum_next_bid`). Upserts (one record per user per auction).

```json
{ "message": "Auto-bid set successfully.", "auto_bid": { "id": 3, "max_amount": 150.0, "is_active": true } }
```
Errors 422: `"This auction is not currently active."`, `"You cannot set an auto-bid on your own auction."`, `"Your auto-bid maximum must be at least $90.00 (the current minimum next bid)."`.

#### DELETE /auctions/{id}/auto-bid  (auth)

Deactivates it: `{ "message": "Auto-bid cancelled." }` or `{ "message": "No active auto-bid found." }` (both 200).

### GET /auctions/my-bids  (auth)

Paginator (20 per page, newest first) of the user's **individual bid rows** (every bid, including system auto-bids), each with a trimmed item:

```json
{
  "current_page": 1,
  "data": [
    {
      "id": 91, "auction_item_id": 7, "user_id": 5, "amount": "85.00", "ip_address": "102.x.x.x",
      "created_at": "2026-11-24T08:29:41.000000Z", "updated_at": "2026-11-24T08:29:41.000000Z",
      "auction_item": { "id": 7, "title": "Samsung 55\" TV", "images": ["https://.../3f9a.jpg"], "status": "active", "current_bid": "85.00", "winner_id": null, "ends_at": "2026-11-27T18:00:00.000000Z", "starting_price": "50.00" }
    }
  ],
  "last_page": 3, "per_page": 20, "total": 51
}
```
Group client-side by `auction_item_id` if you want one row per auction. Compare `winner_id`/`current_bid` with the user's top bid to show won/lost/leading.

### GET /auctions/won  (auth)

Hand-built envelope (20 per page), ordered by `ends_at` desc, only `status = ended` items where `winner_id` is the user:

```json
{
  "data": [
    { "id": 7, "title": "Samsung 55\" TV", "winner_id": 5, "winner_bid": "85.00", "order_id": null, "fulfillment_method": null, "fulfillment_status": null, "payment_deadline": "2026-11-26T18:01:00.000000Z", "deposit_paid": 20.0, "status": "ended", "...": "other item fields" }
  ],
  "meta": { "current_page": 1, "last_page": 1, "total": 1 },
  "is_banned": false,
  "ban_reason": null,
  "existing_refund_ids": [7]
}
```
`deposit_paid` (number) is the confirmed deposit held for that auction (0 if none). `existing_refund_ids` = auction ids with a pending/approved refund request. When `is_banned` is true, disable "Pay now". `order_id != null` means a payment attempt/order already exists (paying again reuses it); whether it is actually paid must be checked on the order (`GET /order/{id}`), **unverified** that a dedicated paid flag exists on the item.

### GET /auctions/{id}/delivery-options  (auth)

```json
{
  "collection": { "label": "Free Collection", "cost": 0 },
  "delivery": { "label": "Home Delivery", "cost": 10.0, "enabled": true, "radius_km": 15 }
}
```
Show delivery only if `delivery.enabled`. `radius_km` is informational (the server does not geo-validate the address).

### POST /auctions/{id}/pay  (auth, winner only)

Creates (or reuses) an order for the winning bid and starts payment.

Request:

```json
{
  "payment_method": "payfast",
  "fulfillment_method": "delivery",
  "delivery_address": "12 Samora Machel Ave, Harare",
  "return_url": "https://onestopstore.co.zw/user/auctions",
  "cancel_url": "https://onestopstore.co.zw/user/auctions"
}
```
Validation: `payment_method` required string; `fulfillment_method` nullable in `collection,delivery` (default `collection`); `delivery_address` nullable string max 500 (send it when delivery); `return_url`/`cancel_url` nullable url.

Amount due = `winner_bid + delivery_cost(if delivery)` minus the held deposit (floored at 0). Delivery cost is read from settings (the client cannot set it). The fulfillment choice is saved on the auction item immediately (`fulfillment_status = pending`). The order note is prefixed `AUC_WIN:` and an `AUC_DEPOSIT:` prefix is used for deposit orders. Response is the gateway intent from `rePayment`, e.g. `{ "order_number": "1043", "transaction_id": "...", "url": "https://...", "is_redirect": true }` (open `url`), or for wallet/COD/bank transfer a status object such as `{ "order_number": "1043", "payment_method": "wallet", "payment_status": "completed" }`. If the amount due is fully covered (<= 0.01) by deposit/wallet the order completes without a gateway.

Errors: 403 `error_code: "auction_bid_banned"` (banned user), 403 `{ "message": "You are not the winner of this auction." }`, 404, 422 validation. Gotcha: this endpoint does **not** check that the auction is `ended` (only that `winner_id` equals the user) and the amount due is computed with the deposit deducted even if a refund was requested - don't offer pay after a refund request.

### Deposit refunds

Losing bidders' deposits are auto-credited to the in-app wallet when the auction closes. Manual refund requests apply to: non-winners whose auto-refund has not happened/failed, or winners whose deposit exceeded `winner_bid` (overpaid portion).

#### GET /auctions/{id}/refund-info  (auth)

```json
{
  "eligible": true,
  "deposit_amount": 20.0,
  "winner_bid_amount": 0,
  "refund_amount": 20.0,
  "is_winner": false,
  "already_refunded": false,
  "existing_request": null,
  "has_banking_details": true
}
```
`existing_request` is `"pending"`/`"approved"` if a request is open. If no paid deposit: `{ "eligible": false, "message": "No paid deposit found for this auction." }`. Refund amount = full deposit for non-winners; `max(0, deposit - winner_bid)` for the winner. `eligible = refund_amount > 0 && !already_refunded`.

#### POST /auctions/{id}/request-refund  (auth)

```json
{ "reason": "Lost the auction", "reason_type": "lost_auction", "refund_method": "wallet" }
```
All optional: `reason` string max 500; `reason_type` in `lost_auction|deposit_overpaid|auction_cancelled|other` (default `deposit_overpaid` for winner else `lost_auction`); `refund_method` in `bank|wallet` (default `bank`). Bank refunds require saved banking details (`/paymentAccount`).

201:

```json
{
  "message": "Refund request submitted. We'll credit your in-app wallet within 3-5 business days.",
  "refund": {
    "id": 4, "user_id": 5, "auction_item_id": 7, "auction_bid_deposit_id": 9,
    "deposit_amount": "20.00", "winner_bid_amount": "0.00", "refund_amount": "20.00",
    "reason_type": "lost_auction", "reason": "Lost the auction", "refund_method": "wallet",
    "status": "pending", "created_at": "2026-11-24T08:40:00.000000Z"
  }
}
```
Errors: 403 `error_code: auction_bid_banned`; 400 `{ "message": "Please add your banking details before requesting a bank refund.", "requires_banking_details": true }`; 400 `"No eligible deposit found for refund."`; 400 `"A refund request for this auction is already pending."`; 400 `"No refundable amount - deposit covers the winning bid exactly."`. Status values: `pending`, `approved`, `rejected` (admin handles via `/admin/auctions/deposit-refunds`).

#### GET /auctions/my-deposit-refunds  (auth)

Paginator (`?paginate=10` honoured, default 10) of refund requests (relations `user`, `deposit`, and `auction:id,title,winner_bid` are eager-loaded - the model also auto-loads other relations, so rows can be large):

```json
{
  "current_page": 1,
  "data": [ { "id": 4, "auction_item_id": 7, "refund_amount": "20.00", "refund_method": "wallet", "status": "pending", "admin_notes": null, "processed_at": null, "wallet_credited_at": null, "created_at": "2026-11-24T08:40:00.000000Z", "auction": { "id": 7, "title": "Samsung 55\" TV", "winner_bid": null } } ],
  "last_page": 1, "total": 1
}
```

### POST /auction-events  (public, `throttle:120,1`, analytics for the auction page)

Fire-and-forget funnel tracking per lot.

```json
{
  "auction_item_id": 7,
  "event": "bid_submit",
  "meta": { "amount": 90, "source": "app" },
  "session_id": "b6e1f9e0-1c2d-4c4f-a111-0f3f2a9d8e10"
}
```
Validation: `auction_item_id` required integer existing in `auction_items`; `event` required, one of `page_view, image_click, bid_focus, bid_submit, bid_success, bid_error, product_link_click, countdown_expired, tab_switch`; `meta` nullable object/array; `session_id` nullable string max 64. Response **201** `{ "ok": true }`. Bad event/unknown id -> 422. Stores IP and user agent server-side. The current web app code does not call this (unverified where it is called from).

### Suggested Flutter flow

1. List: `GET /auctions?tab=active&page=n` (and `upcoming`, `ended` tabs).
2. Detail screen: `GET /auctions/{id}` (with bearer when logged in) + poll `GET /auctions/{id}/bids` every 3-5 s.
3. Tap Bid: ensure logged in -> `GET /auctions/{id}/bid-requirements` -> if deposit needed: `POST pay-deposit` -> (gateway webview) -> poll `POST confirm-deposit` until `deposit_paid` -> `POST /bid` (handle `deposit_required` by re-running the deposit step).
4. Optional: `POST /auto-bid` to set a max, `DELETE` to cancel.
5. After end: `GET /auctions/won` -> `GET /auctions/{id}/delivery-options` -> `POST /auctions/{id}/pay` -> webview -> check order via `GET /order/{order_id}`.
6. Refund: `GET refund-info` -> `POST request-refund` -> `GET my-deposit-refunds`.

Gotchas summary: `/stream` likely broken (poll `/bids`), list page size fixed at 12, decimals are strings, `GET /auctions/{id}` only returns winner extras when a bearer is sent, `bid` response `current_bid` may exceed your bid because of auto-bids, `is_ended` can be true before `status=ended`, banned users get `error_code: auction_bid_banned` on bid/pay/refund.

---

## Part 3 - Web app feature map (screen checklist)

Source: `onestopstore-main/src/app/**` (Next.js app router) plus `lib/actions/*`, `services/*`. Endpoints are relative to `/api`. Endpoints marked **(legacy/unverified)** are called by the web code but have no matching route in `routes/api.php` (leftover from the KachaBazar template) - confirm before building on them. Route protection: `/user/*` and `/checkout/*` require login (middleware `proxy.js`); there is **no guest checkout** (`/checkout`, `/order` need `auth:sanctum`). The `/checkout-cart` page is the public cart.

### Public storefront

| Web route | What it does | API endpoints used |
|---|---|---|
| `/` | Home page: layout variants (default/modern/minimal/clothing/electronic), banners, featured categories, popular and discounted products | `GET /home`, `GET /category?type=product&status=1`, `GET /product?...` (store/featured products), `GET /attribute` / attributes, `GET /settings`, `GET /themeOptions` (and `/currencyFront`) |
| `/shop` | Product listing with filters (category, price, sort, rating, on-sale) and pagination | `GET /product?paginate&page&category&search&sortBy&field&on_sale&rating&price` (or `GET /search/products` when Elasticsearch is on) |
| `/search` | Keyword search results (same listing component) | `GET /product?search=...`, `GET /search/products`, `GET /natural-search` (unverified usage in web) |
| `/collections/[slug]` | Category/collection page by slug with products | `GET /category/slug/{slug}`, `GET /product?category=...` |
| `/catalog/[slug]` | Route handler (not a page) serving an admin-uploaded standalone HTML catalog page; reports views in the browser | API-root `GET /catalog/{slug}` (file) and `POST /catalog/{slug}/hit` (throttle 300/min). Mobile: render in a WebView |
| `/product/[slug]` | Product detail: gallery, variations, delivery options ("More Options"), layby banner, reviews, Q&A, related products | `GET /product/slug/{slug}`, `GET /attribute`, `GET /front/review?product_id=`, `GET/POST /review`, `GET /question-and-answer?product_id=`, `POST /question-and-answer`, `POST /layby/check-eligibility`, `GET /settings` |
| `/checkout-cart` | Cart page (guest-viewable; synced to server when logged in) | `GET /cart?paginate=200`, `POST /cart`, `PUT /cart`, `DELETE /cart/{id}`, `PUT /replace/cart`, `POST /sync/cart`, `POST /clear/cart`, coupon `GET /coupon/...` |
| `/flash-sale` | Flash-sale/campaign listing | `GET /campaign/all` **(legacy/unverified - no Laravel campaign routes; Raines stubs it)**, on-sale products `GET /product?on_sale=1` |
| `/offers` | Offers/promotions page | `GET /settings`/customization settings; product data via `GET /product?...on_sale=1` (unverified) |
| `/compare` | Product comparison table | `GET /compare?paginate=200`, `POST /compare`, `DELETE /compare/{productId}` (auth), plus `GET /product?ids=` |
| `/wishlist` | Saved products | `GET /wishlist?paginate=200`, `POST /wishlist`, `DELETE /wishlist/{productId}` (auth) |
| `/auctions` | Auctions listing (cards) | `GET /auctions` |
| `/auctions/[id]` | Auction detail + bid panel + bid history (polled) + deposit flow | `GET /auctions/{id}`, `GET /auctions/{id}/bids`, `GET /auctions/{id}/bid-requirements`, `POST /auctions/{id}/bid`, `POST /auctions/{id}/pay-deposit`, `POST /auctions/{id}/confirm-deposit` (the web does not use auto-bid, pay, delivery-options, refund endpoints, stream, or `/auction-events` - but the API supports them; see Part 2) |
| `/blogs` | Blog list (paginated) | `GET /blog?page=` |
| `/blogs/[slug]` | Blog article | `GET /blog/slug/{slug}` |
| `/faq` | FAQ list | `GET /faq?status=1` |
| `/contact-us` | Contact form | `POST /contact-us`; page copy via customization settings (`GET /settings`) |
| `/about-us` | Static about page (customization settings, no images) | `GET /settings` / theme options |
| `/privacy-policy`, `/terms-and-conditions` | Policy pages from customization settings | `GET /settings` (`getCustomizationSettings`); `GET /page/slug/{slug}` available for CMS pages |
| `/return-policy`, `/shipping-policy` | Static policy pages | Mostly static; `GET /settings` (unverified) |
| `/track` and `/track/[trackingId]` | Public order tracking by order number | `GET /order/{trackingId}` (needs auth in API; web passes token if present) / `GET /trackOrder/{order_number}` (auth) - unverified which one succeeds anonymously |
| `/sitemap.xml` | SEO sitemap route handler | `GET /sitemap/products/count`, `/sitemap/products`, `/sitemap/categories`, `/sitemap/blogs` (not for mobile) |
| `/error`, `/not-found`, `/loading` | Framework error/loading UIs | - |

### Auth pages

| Web route | What it does | API endpoints |
|---|---|---|
| `/login` and `/auth/login` | Email + password sign-in (next-auth Credentials) | `POST /login`, then `GET /self` |
| `/register` and `/auth/signup` | Create account (auto-login) | `POST /register` (country_code `263`), then `GET /self` |
| `/auth/forget-password` | 3-step reset: email -> 5-digit code -> new password | `POST /forgot-password`, `POST /verify-token`, `POST /update-password` |
| `/api/auth/*`, `/api/notifications/count`, `/api/revalidate` | Next.js internal route handlers (BFF), not part of the Laravel API | `/api/notifications/count` proxies `GET /notifications` |

### Checkout and orders

| Web route | What it does | API endpoints |
|---|---|---|
| `/checkout` (login required) | Address select, shipping method, coupon, payment method, totals, place order | `GET /address`, `GET /country?paginate=300`, `POST /checkout` (authoritative totals), `POST /order` (place order; payload includes `products[]` with `delivery_option_id`, `item_shipping_method`), `POST /rePayment` (gateway redirect fallback), `GET /settings` (payment methods), coupon verify |
| `/order/[id]` | Order detail, items, status, "Pay now" (re-payment), return/refund request modal | `GET /order/{id}`, `POST /rePayment`, `GET /returns?order_id=`, `POST /returns`, `GET /settings` |
| `/order/confirmation` | Post-payment confirmation/return page after gateway redirect | `GET /order/{id}` / `GET /verifyPayment/{order_number}` (unverified exact call) |

### Account area (`/user/*`, all require login)

| Web route | What it does | API endpoints |
|---|---|---|
| `/user/dashboard` | Account overview: orders count, points, wallet | `GET /self`, `GET /order`, `GET /points/consumer`, `GET /wallet/consumer/self` |
| `/user/my-account` | Profile summary and links | `GET /self` |
| `/user/update-profile` | Edit name/phone/avatar | `PUT /updateProfile` (avatar via `POST /attachment`) |
| `/user/change-password` | Change password | `PUT /updatePassword` (web action also references legacy `/customer/change-password`) |
| `/user/shipping-address` | Address book CRUD | `GET/POST /address`, `PUT/DELETE /address/{id}`, `GET /country?paginate=300`, `GET /state` |
| `/user/my-orders` | Order history (paginated) | `GET /order?page=&paginate=` |
| `/user/my-reviews` | Products the user bought and review status; write/edit/delete reviews | `GET /order` (purchased products), `POST /review`, `PUT/DELETE /review/{id}` |
| `/user/notifications` | In-app notifications list, mark read | `GET /notifications`, `PUT /notifications/markAsRead`, `DELETE /notifications/{id}` |
| `/user/points` | Loyalty points balance and ledger | `GET /points/consumer?page=&paginate=` |
| `/user/wallet` | Wallet balance, transactions, request refund-all to bank | `GET /wallet/consumer/self?page=&paginate=`, `POST /wallet/refund-all` |
| `/user/gift-cards` | Vouchers/gift cards: list and redeem | `GET /vouchers/my-vouchers`, `POST /vouchers/redeem` (also `POST /vouchers/check`, `GET /vouchers/redeemed`, `GET /vouchers/wallet-balance` available) |
| `/user/laybys` | Layby (installment) applications list | `GET /layby/my-applications?page=&paginate=` |
| `/user/laybys/[id]` | Layby detail, pay instalment | `GET /layby/applications/{id}`, `POST /layby/applications/{id}/payment`, `PUT /layby/applications/{id}/document`; apply flow (from product page): `GET /layby/check-existing`, `POST /layby/apply`, `POST /layby/documents/upload-chunk`, `POST /layby/documents/upload-complete`, `GET /layby/uploaded-documents` |
| `/user/refunds` | Refund requests list | `GET /refund?page=&paginate=` (create via `POST /refund`) |
| `/user/tickets` | Support tickets list and new ticket | `GET /tickets`, `POST /tickets` |
| `/user/tickets/[id]` | Ticket thread: reply, close, reopen | `GET /tickets/{id}`, `POST /tickets/{id}/messages`, `POST /tickets/{id}/close`, `POST /tickets/{id}/reopen` |
| `/user/auctions` | My bids and won auctions (with ban banner) | `GET /auctions/my-bids`, `GET /auctions/won` (web does not yet call pay/refund endpoints; API supports them) |

### Not in the web app but available in the API (candidate extra mobile screens)

- WhatsApp chat agents: `GET /whatsapp-agents` (see `docs/whatsapp-agents-mobile-api.md`).
- App version / force update: `GET /app-version` (Part 1).
- Analytics: `/analytics/track/*` (Part 1).
- Natural-language search: `GET /natural-search`, `GET /natural-search/expand`; product recommendations: `GET /product/recommendations/{identifier}`; by-SKU: `GET /product/by-skus`; by tag: `GET /product/by-tag`.
- Saved bank details: `/paymentAccount` (auth), needed for bank refunds in auctions.
- Delete account: `DELETE|POST /delete-account` (auth; store-policy requirement for mobile apps).
## Auth & Account

Base URL: `https://<host>/api`. All paths below are relative to `/api`.

### Conventions (apply to every endpoint in this section)

- **Headers (always send):** `Accept: application/json`, `Content-Type: application/json` (JSON bodies), optional `Accept-Language: en` (the `localization` middleware, applied to the authenticated group, reads it and sets the locale).
- **Auth:** Laravel Sanctum personal access token, sent as `Authorization: Bearer <access_token>`. The token string looks like `123|AbCd...` (id|secret). `config/sanctum.php` has `expiration => null`, so consumer tokens never expire; they only die on logout, account deletion, or manual revocation. (Admin `/backend/login` tokens expire after 6h, but that is not a mobile endpoint.)
- **Roles:** `/login` only accepts users that have the `consumer` role. Vendors/admins are rejected with "credentials incorrect" (use `/backend/login`, out of scope).
- **Error shape (custom, used by almost all auth/account/address code):** controllers throw `ExceptionHandler(message, code)` which renders:
  ```json
  { "message": "The entered credentials are incorrect. Please try again!", "success": false }
  ```
  with HTTP status = the code passed (1..500, otherwise coerced to 500). Note that **validation failures in this area do NOT return Laravel's standard `{message, errors:{}}` 422 shape**: only the first error string is returned as `{ "message": "<first error>", "success": false }` (HTTP 422, or 400 for `/login`). Exceptions to this: `/marketing-feedback/submit` uses `$request->validate()` (standard Laravel 422 with `errors`), and `POST /store/register`, `/address`, `/updateProfile`, `/updatePassword`, `/contact-us`, `/paymentAccount` use FormRequests whose `failedValidation` is overridden to the same `{message, success:false}` 422 format.
- **Unauthenticated (401):** missing/invalid bearer on `auth:sanctum` routes. Because `bootstrap/app.php` has no custom exception rendering, Laravel's default is used: with `Accept: application/json` you get `{ "message": "Unauthenticated." }` (HTTP 401). Without the `Accept: application/json` header Laravel may try to redirect to a (nonexistent) login route, so always send `Accept: application/json`. (unverified at runtime; standard Laravel behaviour)
- **Throttling:** `/login`, `/register`, `/forgot-password`, `/verify-token`, `/update-password` have **no explicit throttle middleware** in `routes/api.php`. (A `LoginRequest` class with a 5-attempt limiter exists in `Requests/Auth` but `AuthController@login` does not use it.) Throttled routes in this section: `GET /app-version` (`throttle:120,1`). Throttled response is HTTP 429.
- **Social / OTP / phone login:** NOT present in the Laravel API. `routes/api.php` has no social/OTP/phone-login routes. The Next.js code references `/customer/*` (Google/GitHub/Facebook OAuth via next-auth, `verifyOtpAndLogin`, `/customer/send-email-otp`, `/customer/resend-phone-otp`, `/customer/refresh`, `PUT /customer/{id}`) but those are leftover endpoints from the original Mongo/Express template and do not exist in this Laravel backend. The Raines/OneStopStore web flow only uses email+password via `/login` and `/register`. A Flutter app should implement email+password only.
- **Phone numbers:** `phone` is stored as a string on `users`; `country_code` is the calling code string (the web app hard-codes `"263"` for Zimbabwe, no `+`).

---

### POST /login

Consumer login. Public (no token).

**Body (JSON)**

| field | type | req | rules |
|---|---|---|---|
| email | string | yes | `required|email`; server lower-cases/trims and strips all whitespace |
| password | string | yes | `required` |
| recaptcha | string | no | web forwards it if present; ignored by backend |

```json
{ "email": "jane@example.com", "password": "secret123" }
```

**200 response**
```json
{
  "access_token": "57|kG3xYz...plain-text-token",
  "permissions": [],
  "success": true
}
```
`permissions` is a collection of Spatie Permission objects (often empty for consumers); each element, when present, looks like `{ "id": 1, "name": "...", "guard_name": "web", ... }`.

**Errors (all HTTP 400, shape `{message, success:false}`)**
- Validation (missing/invalid email or password): `{ "message": "The email field is required.", "success": false }`
- No such email: `{ "message": "There is no account linked to the given email.", "success": false }`
- Disabled account (`status = 0`, also set when a user deletes their account): `{ "message": "You cannot log in with a disabled account.", "success": false }`
- Wrong password OR user is not a consumer: `{ "message": "The entered credentials are incorrect. Please try again!", "success": false }`

**Notes**
- A new token named `auth_token` is created on every login (old ones are NOT revoked, multiple devices can be logged in). Call `GET /self` right after to get the profile (the web app does exactly this).
- Email verification is NOT required to log in.
- Soft-deleted users (via `/deleteaccount`) are excluded by the `User` model's soft deletes, so they get "There is no account linked to the given email."

---

### POST /register

Create a consumer account and immediately return a token. Public.

**Body (JSON)**

| field | type | req | rules |
|---|---|---|---|
| name | string | yes | `required|string|max:255` |
| email | string | yes | `required|string|email|max:255`, unique among non-deleted users (lower-cased/trimmed first) |
| password | string | yes | `required|string|min:8|confirmed` |
| password_confirmation | string | yes | `required`, must equal `password` |
| country_code | string | yes | `required` (calling code, web sends `"263"`) |
| phone | string | yes | `required|min:9`, unique among non-deleted users |
| company_name | string | no | stored if sent (no validation) |

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "password_confirmation": "secret123",
  "country_code": "263",
  "phone": "771234567"
}
```

**200 response**
```json
{
  "access_token": "58|Xy12...",
  "permissions": [],
  "success": true
}
```

**Errors**: HTTP 422 `{ "message": "<first validation error>", "success": false }`, e.g. `"The email has already been taken."`, `"The password field confirmation does not match."`, `"The phone has already been taken."`. Server errors: 500 with `{message, success:false}`.

**Notes**
- Assigns the `consumer` role; if wallet-points/wallet features are enabled in settings it credits sign-up points and creates a wallet.
- Email is NOT verified at registration; `email_verified_at` stays null (see verification endpoints below).
- Only the first validation error is returned.

---

### POST /forgot-password

Starts the code-based password reset. Public.

**Body**

| field | type | req | rules |
|---|---|---|---|
| email | string | yes | `required|email|exists:users` (lower-cased/trimmed) |

```json
{ "email": "jane@example.com" }
```

**200**
```json
{ "message": "We have e-mailed verification code in registered mail!", "success": true }
```

**Errors**: 422 `{ "message": "The selected email is invalid.", "success": false }` (email not registered; this leaks account existence).

**Notes**
- Generates a **5-digit numeric code** (`rand(11111, 99999)`), stores it in `password_reset_tokens` (plain, one row per email), emails it (`ForgotPassword` mail), and additionally calls Laravel's `Password::sendResetLink` (which sends a second, link-style email pointing at `{frontend_url}/password-reset/{token}?email=...`). The mobile flow should use the 5-digit code.
- Code is valid for **1 hour**.
- No throttle on this route.

---

### POST /verify-token

Checks that the emailed code is valid (optional step before `/update-password`). Public.

| field | type | req | rules |
|---|---|---|---|
| token | string/int | yes | `required` (the 5-digit code) |
| email | string | yes | `required|email|max:255` |

```json
{ "email": "jane@example.com", "token": "48213" }
```

**200**
```json
{ "message": "Verification token has been successfully verified.", "success": true }
```

**Errors**: 400 `{ "message": "The provided email or token is not recognized.", "success": false }` (wrong or older than 1 hour); 422 for validation.

---

### POST /update-password

Completes the reset using the emailed code. Public. (Not to be confused with authenticated `PUT /updatePassword`.)

| field | type | req | rules |
|---|---|---|---|
| token | string/int | yes | `required` |
| email | string | yes | `required|email|max:255|exists:users` |
| password | string | yes | `required|min:8|confirmed` |
| password_confirmation | string | yes | `required` |

```json
{ "email": "jane@example.com", "token": "48213", "password": "newSecret123", "password_confirmation": "newSecret123" }
```

**200**
```json
{ "message": "Your password has been successfully changed!", "success": true }
```

**Errors**: 400 `{ "message": "The provided email or token is not recognized.", "success": false }`; 422 `{ "message": "The password field confirmation does not match.", "success": false }`.

**Notes**: Existing Sanctum tokens are NOT revoked by a password reset. The code row is deleted on success. After success, call `/login`.

---

### POST /logout

Auth: `Bearer` required. Revokes only the token used for this request.

**Body**: none.

**200**
```json
{ "message": "You are all logged out! We hope to see you soon again.", "success": true }
```

**Errors**: 401 `{ "message": "Unauthenticated." }` if the token is already invalid/missing; 400 `{ "message": "The provided access token is not valid. Please try again.", "success": false }` if the token cannot be resolved.

---

### GET /self

Auth: Bearer. Returns the current user's full profile (the canonical "who am I" call).

**Response 200** (the `User` model with `config('enums.user.with')` relations, an `orders_count` of parent orders, and appended `role`, `permission`, `store`). Password/remember_token/roles/permissions/updated_at/deleted_at are hidden.

```json
{
  "id": 42,
  "name": "Jane Doe",
  "company_name": null,
  "email": "jane@example.com",
  "phone": "771234567",
  "country_code": "263",
  "status": 1,
  "email_verified_at": null,
  "profile_image_id": null,
  "preferred_currency": "USD",
  "currency_symbol": "$",
  "currency_exchange_rate": 1,
  "membership_card_number": null,
  "auction_approved": false,
  "created_at": "2026-01-10T08:00:00.000000Z",
  "orders_count": 3,
  "profile_image": null,
  "point": null,
  "wallet": null,
  "vendor_wallet": null,
  "payment_account": null,
  "address": [
    {
      "id": 7, "title": "Home", "street": "12 Samora Machel Ave", "city": "Harare",
      "pincode": "00263", "phone": 771234567, "country_code": "263",
      "country_id": 1, "state_id": 3, "is_default": 0,
      "country": { "id": 1, "name": "Zimbabwe" },
      "state": { "id": 3, "name": "Harare", "country_id": 1 }
    }
  ],
  "role": { "id": 2, "name": "consumer", "guard_name": "web", "system_reserve": 1 },
  "permission": [],
  "store": null
}
```
(Exact set of extra columns such as `branch`, `is_approved`, `system_reserve`, `created_by_id` follows the `users` table; unverified which are present in the JSON. `profile_image`, when set, is an Attachment object including `original_url`, which the web app reads.)

**Gotchas**
- `address[].phone` is cast to **integer** (leading zeros are lost); `users.phone` is a string.
- `role` is a single object (`role.name`), not an array.
- `email_verified_at` null means unverified.
- 401 `{ "message": "Unauthenticated." }` when the token is bad.

---

### GET /user

Auth: Bearer. Returns `$request->user()` serialized directly (the bare `User` model with `role` appended and `profile_image` eager loaded, without the extra `self` relations). Prefer `/self`.

```json
{ "id": 42, "name": "Jane Doe", "email": "jane@example.com", "phone": "771234567", "country_code": "263", "status": 1, "email_verified_at": null, "role": { "id": 2, "name": "consumer" }, "profile_image": null }
```

---

### PUT /updateProfile

Auth: Bearer. Updates the current user (and optionally their addresses). **Registered twice in routes (duplicate lines); behaves the same.**

**Body (JSON)** (validated by `UpdateProfileRequest`)

| field | type | req | rules |
|---|---|---|---|
| phone | string/int | **yes** | `required|digits_between:6,15`, unique among non-deleted users except self |
| name | string | no | `max:255` |
| email | string | no | `email`, unique except self |
| country_code | string | no | not validated, but saved (in the repository's allowed fields) |
| profile_image_id | int | no | attachment id; associated to user (the file itself is uploaded through the attachment endpoint, outside this section) |
| status | int | no | in the allowed-fields list, i.e. a client could send it (unverified whether this is guarded); do not send it from the app |
| address | array | no | each item with an `id` updates that address; items without `id` create a new address (no validation applied on these nested fields) |
| role_id | int | no | `exists:roles,id`; not used by the update logic |

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "771234567",
  "country_code": "263"
}
```

**200**: the updated `User` object (with `profile_image` and `address` relations loaded), same shape as `/user` plus `address: []`.

**Errors**: 422 `{ "message": "The phone field is required.", "success": false }` / `"The phone has already been taken."`; 401.

**Gotchas**: `phone` is ALWAYS required, even when only changing the name. The Next.js web app does not call this endpoint (its profile action still targets the legacy `PUT /customer/{id}`), so this is verified only from backend code. Use PUT (not PATCH).

---

### PUT /updatePassword

Auth: Bearer. Change password while logged in.

| field | type | req | rules |
|---|---|---|---|
| current_password | string | yes | `required|string` + custom `MatchCurrentPassword` rule |
| password | string | yes | `required|string|min:8|confirmed` |
| password_confirmation | string | yes | `required|min:8|string` |

```json
{ "current_password": "secret123", "password": "newSecret123", "password_confirmation": "newSecret123" }
```

**200**: the controller returns the boolean result of `$user->update(...)`, i.e. the body is literally `true`.

**Errors**: 422 `{ "message": "<first validation error>", "success": false }` (e.g. wrong current password, confirmation mismatch); 401.

**Gotchas**: Other tokens/devices are NOT revoked. The response is a bare JSON `true`, so do not parse it as an object.

---

### DELETE|POST /deleteaccount and /delete-account

Auth: Bearer. Four equivalent routes (`DELETE` or `POST` on either path). Exists because some mobile HTTP clients cannot send DELETE with a body/token.

**Body**: none.

**200**
```json
{ "message": "Account deleted successfully." }
```
(no `success` key.)

**Behaviour**: sets `status = 0`, deletes ALL of the user's Sanctum tokens (user is logged out everywhere), then soft-deletes the user row. After this, the same email/phone can be registered again (the uniqueness rules ignore soft-deleted rows). 401 `{ "message": "Unauthenticated." }` if no/invalid token. After a 200, clear local credentials.

---

### GET /email/verify/{id}/{hash}

Public, but requires a Laravel **signed URL** (`signed` middleware). Called by the web frontend page `/en/verify-email` with the query params from the email link: `?expires=<ts>&signature=<sig>`. Not normally called from a mobile app (the link opens the website).

| param | where | notes |
|---|---|---|
| id | path | user id |
| hash | path | `sha1(user email)` |
| expires, signature | query | from the signed link, valid 60 minutes |

**200**
```json
{ "message": "Email verified successfully! You can now place bids.", "success": true }
```
or `{ "message": "Email already verified.", "success": true, "already_verified": true }`.

**Errors**: 403 `{ "message": "Invalid verification link.", "success": false }`; 403 `{ "message": "Verification link has expired. Please request a new one.", "success": false }`; 403 (default Laravel "Invalid signature.") from the `signed` middleware; 404 if user not found.

**Gotcha (unverified)**: the `User` model does not declare `implements MustVerifyEmail` (only `HasMedia`) and no `hasVerifiedEmail/markEmailAsVerified/sendEmailVerificationNotification` definitions were found under `app/Models`; unless supplied by a trait/parent I could not locate, the verify and resend endpoints may fail with a 500. Treat email-verification endpoints as unverified until tested against the live server. Per the code comments, verification is only meant to gate **auction bidding**; login, shopping and checkout do not require it.

---

### POST /email/resend-verification

Auth: Bearer.

**Body**: none.

**200**
```json
{ "message": "Verification email sent. Please check your inbox.", "success": true }
```
**422** (already verified): `{ "message": "Your email address is already verified.", "success": false }`. 401 if unauthenticated. The emailed link points to `{FRONTEND_URL}/en/verify-email?id=..&hash=..&expires=..&signature=..` (the website, not a deep link). See the unverified gotcha above.

---

### GET /address, POST /address, GET|PUT|DELETE /address/{id}

Auth: Bearer (route group `localization` + `auth:sanctum`). Standard `apiResource`. Non-admin users only ever see/modify their own addresses (index is filtered by `user_id`; show/update/destroy return **403** `"You are not authorized to access this address."` for someone else's address, which may render as Laravel's default `{ "message": "You are not authorized..." }`).

#### GET /address

Query (optional): `paginate` (int, page size; default = total count so everything is returned), `search`/`searchFields` (Prettus RequestCriteria over `title`, `street`, `state.name`, `country.name`), `page`.

Response: a **Laravel paginator** (not a bare array), so read `data`:
```json
{
  "current_page": 1,
  "data": [
    {
      "id": 7, "title": "Home", "street": "12 Samora Machel Ave", "city": "Harare",
      "pincode": "00263", "phone": 771234567, "country_code": "263",
      "country_id": 1, "state_id": 3, "is_default": 0, "user_id": 42,
      "country": { "id": 1, "name": "Zimbabwe", "iso_3166_2": "ZW", "iso_3166_3": "ZWE", "calling_code": "263" },
      "state": { "id": 3, "name": "Harare", "country_id": 1 }
    }
  ],
  "first_page_url": "...", "from": 1, "last_page": 1, "last_page_url": "...",
  "links": [], "next_page_url": null, "path": "...", "per_page": 1, "prev_page_url": null, "to": 1, "total": 1
}
```
(`created_at`, `updated_at`, `deleted_at` are hidden. Exact country columns beyond `id`/`name` unverified.) Note: when the user has zero addresses `per_page` equals 0, which Laravel's paginator may reject; the web app's `unwrapList` helper handles the list; handle empty `data` defensively (unverified edge case).

#### POST /address

| field | type | req | rules |
|---|---|---|---|
| title | string | yes | `required|string` (saved with `ucwords`) |
| street | string | yes | `required|string` (ucwords) |
| city | string | no* | `string` (ucwords). Not "required", but pass it |
| pincode | string | no* | `string` |
| country_id | int | no* | `exists:countries,id` (validated only if sent) |
| state_id | int | no | `exists:states,id` |
| phone | string/int | no | stored via `(string)` cast then cast to integer by the model |
| country_code | string | no | calling code |
| user_id | int | no | ignored for non-admins (always the token's user) |

```json
{
  "title": "Home", "street": "12 Samora Machel Ave", "city": "Harare", "pincode": "00263",
  "country_id": 1, "state_id": 3, "phone": "771234567", "country_code": "263"
}
```
**200/201**: the created address object (with `country` and `state` loaded), same shape as an item above. **422** `{ "message": "The title field is required.", "success": false }`.

(\* The web app treats the whole set `{title, street, city, country_id, state_id, phone, country_code, pincode}` as the contract.)

#### GET /address/{id}
Returns one address object. 403 if not yours, 404 if missing.

#### PUT /address/{id}
Validation only checks `user_id` (`nullable|exists:users,id`); then `$address->update($request->all())`, so send any of the mass-assignable fields: `city, title, phone, street, pincode, state_id, is_default, country_id, country_code`. `user_id` in the body is stripped for non-admins. Returns the updated address object. Send the full set (the web app does).

#### DELETE /address/{id}
Returns the number of rows deleted as a bare JSON number (`1`) (result of `Model::destroy`). Addresses are not soft-deleted per the model (it does not use SoftDeletes) so they are permanently removed (unverified: orders referencing it may keep their own snapshot).

---

### /paymentAccount (GET, POST, GET /{id})

Auth: Bearer. Bank/PayPal payout account (vendor-oriented; **a consumer app normally does not need this**). `PUT /paymentAccount/{id}` and `DELETE /paymentAccount/{id}` are routed but their controller methods are **empty stubs** (return an empty 200), so update goes through `POST` (upsert).

- `GET /paymentAccount` returns the current user's single payment account object, or an empty/`null` body if none exists.
- `POST /paymentAccount`: upserts the account for the current user (`updateOrCreate(['user_id' => me], $request->all())`).
- `GET /paymentAccount/{id}`: returns it if it belongs to the user; otherwise 400 `{ "message": "Payment Account not exists for current user", "success": false }`.

Body for POST (all optional / nullable):

| field | type | rules |
|---|---|---|
| paypal_email | string | nullable, unique in `payment_accounts` |
| bank_account_no | string | nullable, unique |
| bank_name | string | nullable string |
| bank_holder_name | string | nullable string |
| swift | string | nullable string |
| ifsc | string | nullable string |
| is_default | int | nullable `min:0|max:1` |
| status | int | not validated but mass-assignable |

```json
{ "bank_name": "CBZ", "bank_holder_name": "Jane Doe", "bank_account_no": "0123456789", "swift": "COBZZWHA", "is_default": 1 }
```
Response: the `PaymentAccount` row: `{ "id": 1, "user_id": 42, "bank_name": "CBZ", "bank_holder_name": "Jane Doe", "bank_account_no": "0123456789", "swift": "COBZZWHA", "ifsc": null, "paypal_email": null, "is_default": 1, "status": 0, "created_at": "...", "updated_at": "..." }`. Errors: 422 `{message, success:false}` (e.g. unique bank account number).

---

### GET /badge

Auth: Bearer. Admin-dashboard counters; **not meaningful for a consumer app**. It is NOT filtered by user: it returns site-wide pending counts.

```json
{ "refund": { "total_pending_refunds": 4 }, "returns": { "total_pending_returns": 2 } }
```

---

### GET /notifications

Auth: Bearer. The current user's database notifications, newest first, as a Laravel paginator.

Query: `paginate` (int, default 10), `page`.

```json
{
  "current_page": 1,
  "data": [
    {
      "id": "9f1d6e3e-5a7b-4c3a-8e0a-2d5b0e0f1a11",
      "type": "App\\Notifications\\SignUpBonusPointsNotification",
      "notifiable_type": "App\\Models\\User",
      "notifiable_id": 42,
      "data": { "message": "You received 100 sign-up bonus points" },
      "read_at": null,
      "created_at": "2026-01-10T08:00:00.000000Z",
      "updated_at": "2026-01-10T08:00:00.000000Z"
    }
  ],
  "first_page_url": "...", "last_page": 1, "next_page_url": null, "per_page": 10, "total": 1
}
```
`id` is a UUID string. The shape of `data` depends on the notification class (the web app reads `data.title`, `data.message`, `data.trackingId`; `title`/`trackingId` may be absent). `read_at == null` means unread.

---

### PUT /notifications/markAsRead

Auth: Bearer. **Marks ALL unread notifications as read** (there is no per-notification read endpoint). Body: none. Optional query `paginate`.

Response: a paginator of the user's notifications (same shape as GET /notifications, now with `read_at` filled). Caveat: if `paginate` is not sent the page size falls back to Laravel's default (15).

---

### DELETE /notifications/{id}

Auth: Bearer. `{id}` is the notification UUID.

**Response**: bare integer `1` on success. **Gotcha (code smell, unverified at runtime)**: the repository does `findOrFail($user_id)->first()` which actually picks the *first user in the table*, then looks up the notification on that user, so deleting a notification may fail with a 500/400 `{ "message": "...", "success": false }` for any user other than the first. Treat delete as unreliable; prefer hiding locally.

---

### GET /country and GET /country/{id}

Public (no auth). `index` returns every country, each with a nested `state` array (cached 24h).

```json
[
  {
    "id": 1, "name": "Zimbabwe", "iso_3166_2": "ZW", "iso_3166_3": "ZWE", "calling_code": "263",
    "state": [ { "id": 3, "name": "Harare", "country_id": 1 }, { "id": 4, "name": "Bulawayo", "country_id": 1 } ]
  }
]
```
Note the nested key is `state` (singular) holding an array. Store/POST/PUT/DELETE exist in the resource but are unimplemented no-ops. `GET /country/{id}` returns the country via `CountryRepository::show` (shape unverified; likely the country row with relations).

### GET /state and GET /state/{id}

Public. `GET /state` returns all states (cached 24h) as a bare array. Filter by country with the **bracketed query** `?filter[country_id]=1` (the code reads `$request->filter['country_id']`; a plain `?country_id=1` is ignored).

```json
[ { "id": 3, "name": "Harare", "country_id": 1 }, { "id": 4, "name": "Bulawayo", "country_id": 1 } ]
```
`GET /state/{id}` returns one state via the repository (shape unverified).

---

### GET /whatsapp-agents

Public (no auth, no throttle). Chat-enabled WhatsApp support agents, available-now first and random within each group; response sends `Cache-Control: no-store` and `Access-Control-Allow-Origin: *`.

Query: `branch` (string, optional) filters to one branch.

```json
{
  "success": true,
  "agents": [
    {
      "id": 1, "name": "Tendai", "job_title": "Sales Consultant", "branch": "Harare",
      "profile_picture_url": "https://.../agent.jpg", "whatsapp_number": "263771234567",
      "available_from": "08:00:00", "available_to": "17:00:00",
      "available_days": ["Mon", "Tue", "Wed", "Thu", "Fri"], "is_available_now": true
    }
  ],
  "branches": ["Bulawayo", "Harare"]
}
```
(Types of `available_from/to/days` follow the model; unverified.) Branches `"None"`/empty are excluded from `branches`.

---

### GET /app-version

Public, `throttle:120,1`, `Cache-Control: public, max-age=300`. Use for force-update checks.

Query: `platform` = `android` | `ios` (optional; omit for both), `current_version` (optional, e.g. `1.4.2`; when sent and lower than `minimum_version` then `force_update` becomes `true`).

`GET /app-version?platform=android&current_version=1.2.0`
```json
{
  "android": {
    "latest_version": "1.5.0",
    "latest_build": 42,
    "minimum_version": "1.3.0",
    "force_update": true,
    "release_notes": "Bug fixes",
    "store_url": "https://play.google.com/store/apps/details?id=...",
    "released_at": "2026-05-01T00:00:00+00:00"
  }
}
```
Without `platform` the object has both `android` and `ios` keys (only those that have rows).

**Errors** (note: `{ "error": "..." }`, different shape): 400 `{ "error": "Invalid platform. Must be \"android\" or \"ios\"." }`; 500 `{ "error": "No version data available." }`.

---

### POST /contact-us

Public. Sends an email to the store's `MAIL_FROM_ADDRESS` (nothing is stored as a record in the DB per the repository code).

| field | type | req | rules |
|---|---|---|---|
| name | string | yes | `required|string` |
| email | string | yes | `required|string` (not validated as an email format) |
| phone | string | yes | `required` |
| subject | string | yes | `required|string` |
| message | string | yes | `required|string` |

```json
{ "name": "Jane Doe", "email": "jane@example.com", "phone": "771234567", "subject": "Order question", "message": "Hello, ..." }
```
**200**
```json
{ "message": "Thank you for contacting us, we will get back to you shortly.", "success": true }
```
**Errors**: 422 `{ "message": "The subject field is required.", "success": false }`; 500 `{ "message": "<mail error>", "success": false }`.

---

### POST /marketing-feedback/submit

Public route, but **authorization is enforced in code**: the caller must be either (a) the owner of the order (valid bearer token whose user is `order.consumer_id`) or (b) hold a valid `feedback_token` (from the post-order email link). Otherwise 401.

| field | type | req | rules |
|---|---|---|---|
| order_number | string | yes | `required|string|min:1` (numbers are cast to string) |
| ordering_process_rating | string | yes | `in:excellent,good,fair,poor` |
| heard_about_source | string | yes | `required|string` |
| heard_about_other | string | no | `max:255` |
| additional_comments | string | no | `max:1000` |
| feedback_token | string | no | token from the feedback email |

```json
{ "order_number": "10234", "ordering_process_rating": "good", "heard_about_source": "google", "heard_about_other": null, "additional_comments": "Fast delivery", "feedback_token": null }
```
**200**
```json
{ "success": true, "message": "Thank you for your feedback!", "feedback_id": 15 }
```
**Errors**:
- 422 standard Laravel validation shape (this is one of the few endpoints that uses it): `{ "message": "Please rate your ordering process.", "errors": { "ordering_process_rating": ["Please rate your ordering process."] } }`
- 404 `{ "success": false, "message": "Order not found." }`
- 401 `{ "success": false, "message": "Unauthorized. Please use the link from your email or log in." }`
- 500 `{ "success": false, "message": "Failed to submit feedback. Please try again." }`

**Note**: send the `Authorization: Bearer` header when logged in so ownership can be detected (the token is optional and read manually, invalid tokens are silently ignored).

### GET /marketing-feedback/check-submitted

Public. Query: `order_number` (required).

`GET /marketing-feedback/check-submitted?order_number=10234`
```json
{ "success": true, "already_submitted": false }
```
Missing param: 400 `{ "success": false, "message": "Order number is required" }`.

---

### POST /store/register  (vendor onboarding)

Public. Creates a **vendor** user + store in one call; only works if the multi-vendor feature is enabled (otherwise 403 `{ "message": "The multi-vendor feature is currently deactivated.", "success": false }`). Not part of the consumer shopping flow, include only if the Flutter app has a "become a seller" screen. Send as `multipart/form-data` if uploading `product_catalog`, otherwise JSON works.

Key fields (validated by `CreateStoreRequest`; first error only is returned as `{message, success:false}` with 422):

| group | field | rules |
|---|---|---|
| account (required unless `vendor_id` given) | name, email (unique), phone (`digits_between:8,15`, unique), password (`min:8|confirmed`), password_confirmation | |
| tax / id | is_vat_registered (`yes|no`, required), vat_number (required if vat = yes, max 50), identification_type (`id|passport`, required), id_number (required, max 50) | |
| business | legal_name (required, max 255), trading_name (nullable) | |
| store | store_name (required, unique, max 255), description (required, min 10), country_id (required, exists), state_id (nullable, exists), city (required, max 100), address (required), pincode (required, max 20) | |
| business info | monthly_revenue (required: `less_than_1k,1k_2.5k,2.5k_5k,5k_25k,25k_50k,50k_125k,125k_plus`), has_physical_stores (`yes|no`), number_of_stores (int>=1, required if physical = yes), is_supplier_to_retailers (`yes|no`), has_marketplace_accounts (`yes|no`) | |
| product range | number_of_products (int>=1), primary_category (string), stock_holding (`whole_range,some_range,on_demand`), product_source (`imported,manufactured_locally,mixture`), product_branding (`branded,unbranded,combination`), owned_brands, reseller_brands (nullable) | |
| online | website, social_media_page (nullable url), product_catalog (nullable file jpg/jpeg/png/pdf max 10 MB), business_summary (required min 10), product_uniqueness, intended_products, certifications (nullable), referral_source (required: `google,customer,expo,township_initiative,referral,tiktok,youtube,linkedin,facebook`) | |
| social (nullable urls) | facebook, twitter, instagram, youtube, pinterest | |
| system | vendor_id, store_logo_id, store_cover_id, status | |

```json
{
  "name": "Jane Doe", "email": "vendor@example.com", "phone": "771234567",
  "password": "secret123", "password_confirmation": "secret123",
  "is_vat_registered": "no", "identification_type": "id", "id_number": "63-123456A63",
  "legal_name": "Jane Traders (Pvt) Ltd", "store_name": "Jane Store",
  "description": "We sell quality goods.", "country_id": 1, "state_id": 3, "city": "Harare",
  "address": "12 Samora Machel Ave", "pincode": "00263",
  "monthly_revenue": "1k_2.5k", "has_physical_stores": "no", "is_supplier_to_retailers": "no",
  "has_marketplace_accounts": "no", "number_of_products": 50, "primary_category": "Electronics",
  "stock_holding": "whole_range", "product_source": "imported", "product_branding": "branded",
  "business_summary": "Electronics reseller based in Harare.", "referral_source": "google"
}
```
**200**: the created `Store` object (with `store_logo`, `store_cover`, `vendor`, `country`, `state` relations; `vendor.vendor_wallet` loaded), `is_approved` follows the `store_auto_approve` setting, otherwise the vendor cannot log in via backend login until approved. Exact JSON unverified.

**Gotcha**: `country_code` is NOT in the request validation but is read for the vendor user; send it. Vendors cannot use `POST /login` (consumer-only); they would use `/backend/login`.
## Catalog & Content (public, read-side)

All paths are relative to the API base `/api` (e.g. `https://<host>/api/product`). Source of truth: `routes/api.php` plus the controllers named under each endpoint. Values in example responses are illustrative (real field names, invented data).

### Conventions for this whole section

**Headers**

| Header | Needed? | Notes |
|---|---|---|
| `Accept: application/json` | Always | Without it Laravel can answer errors with HTML/redirects. |
| `Content-Type: application/json` | On POST/PUT with a JSON body | Use `multipart/form-data` for file uploads. |
| `Authorization: Bearer <sanctum token>` | Only on authenticated endpoints | On public endpoints it is optional, but if sent, the response gets user-specific fields (`user_review`, `can_review`, `reaction`). The auth guard is Sanctum (`Auth::guard('api')` uses the `sanctum` driver). |
| `Accept-Language: en` | Optional | `localization` middleware only runs on the authenticated group; sets `app()->setLocale`. The web app sends it everywhere. |
| `User-Agent` | See `/settings` | If the UA matches `okhttp`, `Dart/`, `Flutter`, `ReactNative`, `CFNetwork...Darwin` or `expo`, `/settings` and `/settingsFront` coerce a few fields to strings (see below). Dart's `http`/`dio` default UA (`Dart/x.y (dart:io)`) triggers this. |

**Currency / prices (important)**
- The API stores and returns every price in **USD**. There is no server-side conversion and no currency header (the `session('currency')` the model reads is never set on this stateless API, so `layby_eligibility.currency` is always `"USD"`).
- Clients fetch `GET /currency` (or `/currencyFront`), let the user pick one, and multiply: `display = usd_price * currency.exchange_rate`, formatted with `symbol`, `symbol_position` (`before_price` | `after_price`), `no_of_decimal`, `decimal_separator`, `thousands_separator`. This is exactly what the web `CurrencyContext` does (persisted choice in localStorage key `rf_selectedCurrency`).
- The `currency` query param on `/product` (search path), `/search/products`, `/natural-search` and `/product/recommendations/{id}` does **not** convert prices. It only controls **regional product visibility** (see "Regional flags").

**Regional flags (`zimbabwe_only`, `zambia_only`, `sa_only`)**
- Every product (and variation) has booleans `zambia_only`, `zimbabwe_only`, `sa_only`. All three false = global product.
- Search-backed endpoints accept `currency=<CODE>` and filter: `ZMW` -> zambia_only + global; `ZW` **or `USD`** -> zimbabwe_only + global; `ZAR` -> sa_only + global; omitted or any other code -> **no filtering at all** (everything is returned, including products flagged for other countries).
- The plain DB path of `GET /product` (no `search` term) does **not** filter by region at all; code comment says the web app intentionally gets all products and blurs the price / hides the cart button for products not available in the user's country. A mobile client should do the same client-side using the flags, and/or pass `currency` + `search`.
- Note the quirk: `currency=USD` maps to Zimbabwe visibility.

**Pagination formats (two different shapes)**
1. "Slim" shape (hand-built): `GET /product`, `/product/by-tag`, `/search/products`, `/natural-search`:
```json
{ "data": [ ... ], "current_page": 1, "last_page": 12, "per_page": 20, "total": 234 }
```
2. Standard Laravel paginator (all `->paginate()` returns: `/productPagination`, `/category`, `/attribute`, `/blog`, `/page`, `/faq`, `/coupon`, `/tax`, `/orderStatus`, `/currency`, `/review`, `/front/review`, `/question-and-answer`, `/wishlist`, `/compare`, `/theme`):
```json
{
  "current_page": 1,
  "data": [ ... ],
  "first_page_url": "https://host/api/blog?page=1",
  "from": 1,
  "last_page": 3,
  "last_page_url": "https://host/api/blog?page=3",
  "links": [ { "url": null, "label": "&laquo; Previous", "active": false } ],
  "next_page_url": "https://host/api/blog?page=2",
  "path": "https://host/api/blog",
  "per_page": 12,
  "prev_page_url": null,
  "to": 12,
  "total": 30
}
```
- Page size param is **`paginate`** (not `per_page`/`limit`); page number is **`page`**. The search-backed path of `/product` also accepts `size` as an alias of `paginate`.
- Many list endpoints default `paginate` to "the total row count" (i.e. everything in one page): `/review`, `/front/review`, `/question-and-answer`, `/page`, `/faq`, `/tax`, `/coupon`, `/orderStatus`, `/attribute-value`, `/wishlist`, `/compare`. Always pass `paginate` explicitly on those.

**Error shapes**
- Validation / business errors thrown through `ExceptionHandler`: HTTP status = given code, body `{ "message": "<first error>", "success": false }`.
- Not found on slug endpoints: `{ "message": "Product not found.", "slug": "..." }` (404). Invalid slug characters: `{ "message": "Invalid slug." }` (400).
- Unhandled DB-path product list errors: `{ "error": "<msg>" }` (500). Search errors: `{ "error": "search_failed", "message": "Internal Server Error", "details": "..." }` (500).
- Throttle exceeded: HTTP 429.

**Media URLs in responses**
- Image objects (attachments) expose: `id`, `uuid`, `name`, `file_name`, `disk`, `image_url`, `original_url`, `takealot_url` (some products, imported), `created_by_id`, `created_at`. Use `image_url || original_url || takealot_url` (same order the web adapter uses).
- Some thumbnails on list endpoints are rewritten to `https://<api-host>/proxy-image?url=<urlencoded>` for takealot / media.onestopstore.co.zw images. The web app also force-upgrades `http://` to `https://` for known own hosts (`api.onestopstore.co.zw`, `media.onestopstore.co.zw`, ...): do the same if you see `http://` URLs.

---

### GET /product

List/filter/sort/search products. Controller: `ProductController@index`. **Public**, throttle 60/min. Headers: `Accept: application/json`.

**Two completely different code paths** (switched server-side, `USE_ELASTIC_SEARCH=true` in the shipped `.env.example`/`.env`):

- **Elasticsearch path** – used when `USE_ELASTIC_SEARCH` is on **and** a non-empty search term is present (`search`, or `q`, or `keyword`). The request is forwarded to `SearchController::products` (see `GET /search/products`). Page size capped at 100.
- **Database path** (Postgres) – used for everything else (no search term). Cached 10 min per full query string (60 min when `ids` is given). Page size not capped.

So a "browse" request (`category=...` with no `search`) hits the DB path; adding `search=foo` silently switches to Elasticsearch with different semantics for some params. The response item shape also differs (see below).

**Query parameters**

| Param | Type | Path | Behaviour |
|---|---|---|---|
| `paginate` | int | both | Page size. DB default 20 (no max). ES: `max(1,min(paginate or size,100))`, default 20. |
| `size` | int | ES only | Alias for `paginate`. |
| `page` | int | both | 1-based. |
| `search` (aliases `q`, `keyword`) | string | switches to ES | `*` or empty means "match all" (browse). DB path (only reachable if ES disabled): splits on whitespace and requires each word in `search_keywords` (case-insensitive LIKE). |
| `category` | csv of category **slugs** | both | Any of the slugs (DB: whereHas categories.slug; ES: `category_slugs`). Only slugs, not ids. A parent slug does NOT include child-category products unless the product is directly tagged with it (unverified for the ES index). |
| `category_ids` | csv of ids | DB only | |
| `brand` | csv of brand slugs or ids | DB: slugs or numeric ids; ES: slugs only | |
| `tag` | csv of tag slugs | both | |
| `tag_ids` | csv ids | DB only | |
| `attribute` | csv of attribute-**value** slugs | both | Matches variations' attribute values. |
| `price` | csv of ranges, e.g. `0-100,100-500` or `200` | both | `a-b` = between (inclusive); single number = minimum (`>=`). Uses `sale_price` on DB path (see gotchas), effective price on ES path. A comma between min and max (e.g. `0,100`) is treated as two single-value filters, so always use a dash. |
| `min`, `max` | number | both | Both must be present. DB: `sale_price BETWEEN`; ES: effective price. |
| `rating` | csv ints 1-5 | both | Star bands `[r, r+1)` on average rating (so `4` = 4.0-4.99). Multiple values are OR-ed. |
| `on_sale` | `1` | both | Only discounted products (sale_price > 0 and < price). |
| `is_featured`, `is_trending` | `1` | ES only for `is_featured`; DB uses `trending` | |
| `trending` | `0`/`1` | DB only | Filters `is_trending`. |
| `delivery` | csv of exact `estimated_delivery_text` strings (e.g. `Same Day Delivery`) | both | |
| `ids` | csv of product ids | DB only | Non-numeric entries ignored. **No ordering guaranteed** - reorder client-side. |
| `skus` | csv of SKUs | DB only | Ordered by the request order (PostgreSQL `array_position`). |
| `status` | `0`/`1` | DB only | **Not applied by default** on DB path. Always send `status=1`. ES path always forces status=1 and ignores this param. |
| `is_approved` | `all` | DB | Default behaviour hides unapproved products; only admins need `all`. |
| `store_id`, `store_ids` (csv), `store_slug` | | DB (`store_id` also ES) | Vendor filtering. |
| `top_selling` + `filter_by` | | DB | Legacy admin analytics; ignore. |
| `sortBy` | string | both (different maps) | See sort table. Case-insensitive on DB path, **case-sensitive on ES path** (send UPPER_CASE). |
| `field` | column name | DB only | Only used with `sortBy=ASCENDING|DESCENDING|ASC|DESC` as the column to order by (default `id`). Web app uses `sortBy=DESCENDING&field=created_at`. Passing an unknown column gives a 500. |
| `currency` | `ZMW`/`ZW`/`USD`/`ZAR` | ES only | Regional visibility filter (see Conventions). |
| `submit` | `1`/`true` | both | Marks an intentional search for analytics logging (`search_queries` table). Only logged if term >= 3 chars. Send `submit=1` when the user submits the search box, not on type-ahead. |

**`sortBy` values**

| Value | DB path | ES path |
|---|---|---|
| `LOW_TO_HIGH` (`PRICE_LOW_TO_HIGH`, `LOW-HIGH`) | `sale_price` asc | effective price asc (sale_price if 0<sale<price else price) |
| `HIGH_TO_LOW` (`PRICE_HIGH_TO_LOW`, `HIGH-LOW`) | `sale_price` desc | effective price desc |
| `A_TO_Z` / `Z_TO_A` (`A-Z`, `Z-A` DB only; `asc`/`desc` ES only) | name | name |
| `ASCENDING` / `DESCENDING` (`ASC`/`DESC` DB only) | `field` column (default `id`) | created_at asc/desc, `field` ignored |
| `NEWEST` (`NEWEST_FIRST`) / `OLDEST` (`OLDEST_FIRST`) | created_at | created_at |
| `DISCOUNT_HIGH_TO_LOW` (`DISCOUNT-HIGH-LOW` DB only) | discount desc | discount desc |
| `RATING_HIGH_TO_LOW` (`STARS_HIGH_TO_LOW`), `RATING_LOW_TO_HIGH` (`STARS_LOW_TO_HIGH`) | by `reviews_avg_rating` (see gotchas) | avg rating (+ review count) |
| `ON_SALE` (`SALE`) | filters to sale items, discount desc | is_sale_enable + discount desc |
| `POPULAR` (`MOST_POPULAR`) | orders_count, order_amount (see gotchas) | orders_count, order_amount (indexed as 0 - unverified usefulness) |
| `RELEVANCE` | n/a (unknown value -> `created_at desc`) | `_score` desc |
| anything else | `created_at desc` | invalid -> id asc when browsing, relevance when searching |

**Default order**: DB path with no `sortBy`: no explicit ordering unless `search` is present (then delivery-speed priority, then price desc). ES path browsing (no term, no sort): `id asc`. ES with term: relevance with boosts (featured, trending, in stock, "Same Day Delivery" up, "Back Order" down).

Example request (browse a category, cheapest first, page 2):
```
GET /api/product?status=1&category=kitchen-appliances&sortBy=LOW_TO_HIGH&paginate=20&page=2
```
Example request (search, Zimbabwe visibility, user pressed enter):
```
GET /api/product?search=samsung%20tv&currency=USD&sortBy=RELEVANCE&paginate=20&submit=1
```

**Response** (slim pagination, see Conventions). Item shape, **DB path** (Product model with `$with` stripped to thumbnail + categories + tags + galleries; heavy appends removed):
```json
{
  "data": [
    {
      "id": 4821,
      "name": "Samsung 55\" 4K Smart TV",
      "slug": "samsung-55-4k-smart-tv",
      "short_description": "...",
      "type": "simple",
      "unit": "piece",
      "sku": "SAM-TV-55",
      "quantity": 12,
      "weight": 15000,
      "price": 549.0,
      "sale_price": 499.0,
      "discount": 9,
      "is_sale_enable": 1,
      "sale_starts_at": null,
      "sale_expired_at": null,
      "stock_status": "in_stock",
      "is_featured": 1,
      "is_trending": 0,
      "is_return": 1,
      "is_free_shipping": 0,
      "is_cod": 0,
      "is_external": 0,
      "status": 1,
      "is_approved": 1,
      "store_id": 1,
      "brand_id": 7,
      "tax_id": null,
      "zambia_only": false,
      "zimbabwe_only": false,
      "sa_only": false,
      "estimated_delivery_text": "Same Day Delivery",
      "standard_shipping_days": "3-5",
      "expedited_shipping_days": "1-2",
      "standard_shipping_price": 4.5,
      "expedited_shipping_price": 9.0,
      "has_expedited_shipping": 1,
      "return_policy_text": null,
      "reviews_count": 23,
      "reviews_avg_rating": "4.3478",
      "review_ratings": [0, 1, 2, 8, 12],
      "product_thumbnail": { "id": 9001, "uuid": "...", "name": "tv.jpg", "disk": "public", "file_name": "tv.jpg", "image_url": "https://media.../tv.jpg", "takealot_url": null },
      "product_galleries": [ { "id": 9002, "image_url": "https://..." } ],
      "categories": [ { "id": 5, "name": "TVs", "slug": "tvs", "parent_id": 2, "pivot": { "product_id": 4821, "category_id": 5 } } ],
      "tags": [ { "id": 3, "name": "Deal", "slug": "deal" } ],
      "created_at": "2026-03-01T10:00:00.000000Z"
    }
  ],
  "current_page": 1, "last_page": 12, "per_page": 20, "total": 234
}
```
Notes on the DB-path item: `variations`, `brand`, `product_meta_image`, `delivery_options` are **stripped** (so no variation prices on lists; fetch the detail endpoint for them); `description` is hidden; `reviews_avg_rating` is a string-ish decimal (cast it); `review_ratings` is `[1star,2star,3star,4star,5star]` counts; `rating_count` / `user_review` / `related_products` etc. are removed on lists.

Item shape, **ES path**: the raw Elasticsearch document, so it differs:
- `categories` is an array of **name strings** (e.g. `["TVs","Electronics"]`), plus `category_slugs` (array of slug strings). On the DB path `categories` is an array of objects.
- `tags` is an array of **name strings**; on DB path an array of objects.
- Includes `brand` object (`id`, `name`, `slug`, `description`, `brand_image_id`, ...), `variations` (full, with `attribute_values`), `delivery_options` + `has_delivery_options`, `product_thumbnail`, `product_galleries`, `product_meta_image`, `reviews_count`, `reviews_avg_rating` (number), `rating_count`, `review_ratings`, `reviews` (first 100 reviews: `id, rating, description, consumer_id, created_at`), `layby_eligible` and a computed `layby_eligibility` object, `combined`, `description`, `meta_description`, `deleted_at`, `updated_at`.
- `user_review: null`, `related_products: []`, `cross_sell_products: []`, `orders_count: 0`, `order_amount: 0` defaults. Dates have `T` replaced by a space (`"2026-03-01 10:00:00"`); other date fields can be ISO strings (parse leniently).
- Make your Dart model tolerant: `categories` and `tags` can be `List<String>` **or** `List<Map>` depending on the path.

**Gotchas**
- Always send `status=1` for DB-path lists; otherwise disabled products come back.
- The DB path price filters/sort use the `sale_price` column only; products with no sale (`sale_price` null/0) are excluded by `min`/`max`/`price` and sort wrongly under `LOW_TO_HIGH`/`HIGH_TO_LOW`. Search (ES) path is correct (effective price). For reliable price filtering on mobile prefer routing via a `search=*` request (ES path, "browse all") - the code explicitly treats `search=*` as match-all with all filters/sorts supported.
- `RATING_*` and `POPULAR` sorts on the DB path reference columns (`reviews_avg_rating`, `orders_count`, `order_amount`) that may not be orderable in SQL (they are computed); verified unreliable by the web team (see web `searchProducts` comments). Prefer the ES path (`search=*`).
- `rating` filter on DB path is expensive (subquery average per product).
- `paginate` is capped at 100 only on the ES path.
- Elasticsearch path ignores `status`, `ids`, `skus`, `trending`, `category_ids`, `tag_ids`, `store_ids`, `field`.
- The web app sends `top_rated=1`; that param does nothing.
- Empty `search` with no `category/brand/rating/price` on the ES endpoint directly (`/search/products`) returns an empty set; via `/product` an empty term goes to the DB path so this does not apply.
- Zimbabwe-only / Zambia-only / SA-only products are returned unless you use the ES path with `currency`.

---

### GET /productPagination

Same filter engine as the DB path of `GET /product` (`ProductController@filter`), **public**, throttle 60/min. Differences: it never uses Elasticsearch, is not cached, returns the **standard Laravel paginator** JSON (with `links`, `first_page_url`...), and each item still carries the Product model's default eager loads and appends (variations, brand, delivery options, `related_products`, `cross_sell_products`, `user_review`, `layby_eligibility`, ...). It is much heavier than `/product`. Default order `created_at desc` when no `sortBy`.

Params: same as the DB-path params of `/product` (`paginate` default 20, `page`, `category`, `brand`, `tag`, `attribute`, `price`, `min`, `max`, `rating`, `on_sale`, `status`, `ids`, `skus`, `search`, `sortBy`, `field`, ...).

Not recommended for mobile lists; use `/product`.

---

### GET /product/{id}

Product detail by numeric id. Controller `ProductController@show`. **Public**, throttle 60/min. `id` must match `[0-9]+` (route pattern). Only returns products that are `status=1` and `is_approved=1`, else 404 (`{"message": "No query results for model [App\\Models\\Product] ..."}`-style from the exception wrapper). Cached server-side 10 minutes keyed by product id (cache is shared across users - see gotchas).

Example: `GET /api/product/4821`

**Response**: a single product object (no `data` wrapper). Same object as `GET /product/slug/{slug}` below.

---

### GET /product/slug/{slug}

Product detail by slug. `ProductController@getProductBySlug` -> `ProductRepository::getProductBySlug`. **Public**, throttle 120/min. Slug must match `^[A-Za-z0-9\-_]+$` (else 400 `Invalid slug.`). 404 `{"message":"Product not found.","slug":"..."}` when missing, inactive (`status != 1`) or unapproved. Response is `Cache-Control: public, max-age=600` and server-cached 10 min per slug.

Headers: `Accept: application/json`; optional `Authorization: Bearer` (adds `user_review`/`can_review`, but see caching gotcha).

**Response** (single object, no `data` wrapper; the web adapter reads `raw.data ?? raw`):
```json
{
  "id": 4821,
  "name": "Samsung 55\" 4K Smart TV",
  "slug": "samsung-55-4k-smart-tv",
  "short_description": "Plain text teaser",
  "description": "<p>Full HTML description</p>",
  "specifications": "<table>...</table>",
  "warranty": "12 months",
  "meta_title": "...",
  "meta_description": "...",
  "type": "simple",
  "unit": "piece",
  "sku": "SAM-TV-55",
  "quantity": 12,
  "weight": 15000,
  "price": 549.0,
  "sale_price": 499.0,
  "discount": 9,
  "is_sale_enable": 1,
  "sale_starts_at": "2026-11-01T00:00:00.000000Z",
  "sale_expired_at": "2026-12-31T23:59:59.000000Z",
  "stock_status": "in_stock",
  "status": 1,
  "is_approved": 1,
  "is_featured": 1,
  "is_trending": 0,
  "is_return": 1,
  "is_free_shipping": 0,
  "is_cod": 0,
  "is_external": 0,
  "external_url": null,
  "external_button_text": null,
  "is_gift_card": false,
  "voucher_validity_days": null,
  "zambia_only": false,
  "zimbabwe_only": false,
  "sa_only": false,
  "is_layby_disabled": false,
  "estimated_delivery_text": "Same Day Delivery",
  "return_policy_text": "30-day returns",
  "original_currency_code": "USD",
  "original_price": null,
  "original_sale_price": null,
  "safe_checkout": 1, "secure_checkout": 1, "social_share": 1, "encourage_order": 1, "encourage_view": 1,
  "store_id": 1,
  "brand_id": 7,
  "tax_id": null,
  "product_thumbnail_id": 9001,
  "product_thumbnail": { "id": 9001, "uuid": "...", "name": "tv.jpg", "image_url": "https://...", "original_url": "https://...", "takealot_url": null },
  "product_galleries": [ { "id": 9002, "image_url": "https://..." } ],
  "product_meta_image": null,
  "size_chart_image": null,
  "brand": { "id": 7, "name": "Samsung", "slug": "samsung", "description": null, "brand_image_id": 55, "status": 1 },
  "store": { "id": 1, "store_name": "OneStop", "slug": "onestop", "description": "...", "store_logo_id": 12, "hide_vendor_email": 0, "hide_vendor_phone": 0, "vendor_id": 3 },
  "categories": [ { "id": 5, "name": "TVs", "slug": "tvs", "parent_id": 2 } ],
  "tags": [ { "id": 3, "name": "Deal", "slug": "deal" } ],
  "attributes": [
    { "id": 1, "name": "Colour", "slug": "colour", "style": "color", "status": 1,
      "attribute_values": [ { "id": 11, "value": "Black", "slug": "black", "hex_color": "#000000", "attribute_id": 1 } ] }
  ],
  "variations": [
    {
      "id": 901, "product_id": 4821, "name": "Black / 55\"", "sku": "SAM-TV-55-BLK",
      "price": 549.0, "sale_price": 499.0, "discount": 9.0, "quantity": 5, "stock_status": "in_stock", "status": 1,
      "zambia_only": false, "zimbabwe_only": false, "sa_only": false,
      "variation_image": { "id": 9100, "image_url": "https://..." },
      "attribute_values": [ { "id": 11, "value": "Black", "slug": "black", "hex_color": "#000000", "attribute_id": 1, "pivot": { "variation_id": 901, "attribute_value_id": 11 } } ],
      "layby_eligibility": { "eligible": true, "price": 499.0, "price_usd": 499.0, "currency": "USD", "threshold": 100, "is_sale_product": true, "deposit_percentage": 30, "available_durations": [3] }
    }
  ],
  "delivery_options": [
    { "id": 1, "product_id": 4821, "label": "Fastest Delivery", "delivery_text": "Same Day", "delivery_days": 1, "price": 560.0, "sale_price": null, "quantity": 5, "stock_status": "in_stock", "sku": null, "sort_order": 0, "is_default": true, "status": true, "effective_price": 560.0 }
  ],
  "shipping_options": { "has_expedited_shipping": 1, "standard_shipping_days": "3-5", "expedited_shipping_days": "1-2", "standard_shipping_price": 4.5, "expedited_shipping_price": 9.0 },
  "layby_eligibility": { "eligible": true, "price": 499.0, "price_usd": 499.0, "currency": "USD", "threshold": 100, "is_sale_product": true, "deposit_percentage": 30, "available_durations": [3] },
  "reviews_count": 23,
  "rating_count": 4.3,
  "review_ratings": [0, 1, 2, 8, 12],
  "orders_count": 54,
  "order_amount": 27000.0,
  "related_products": [101, 102, 103],
  "cross_sell_products": [201],
  "user_review": null,
  "can_review": false,
  "has_expedited": 1,
  "created_at": "2026-03-01T10:00:00.000000Z"
}
```

How the web app uses it (copy this logic):
- **Sale price is only valid if** `sale_price > 0 && sale_price < price` AND `is_sale_enable == 1` AND (if set) `sale_starts_at <= now <= sale_expired_at`. Variations carry no `is_sale_enable`: treat as on-sale when `sale_price > 0 && sale_price < price`.
- Stock: `stock_status == "in_stock"` (values: `in_stock`, `out_of_stock`, `coming_soon`); `quantity` is the number. The web falls back to 100 when `in_stock` and `quantity <= 0`.
- Images: `product_thumbnail` + `product_galleries` (gallery order is the admin's order; the thumbnail is normally also a gallery member - de-duplicate by URL).
- Variants (classified products, `type: "classified"`): resolve the selected variation by matching the chosen `attribute_values[].id` set against each `variation.attribute_values[].id`. Group by `attribute_id` to render pickers; attribute **names** come from the top-level `attributes[]` (variation attribute values carry only `attribute_id`). `attributes[].attribute_values` has already been reduced to values actually used by variations.
- Delivery options (`delivery_options`): when non-empty the customer must pick one; the product's own `price` equals the cheapest option. Effective option price = `sale_price` if `0 < sale_price < price` else `price`. Cart lines then reference the option (see the Cart section of this guide).
- `related_products` / `cross_sell_products` are arrays of **product ids** (not objects) on this endpoint. Use `/product/recommendations/{id}` or `/product?ids=` for objects.
- `rating_count` here is the **average rating** (0-5, one decimal), and `reviews_count` is the number of reviews. (Naming is misleading.)
- `layby_eligibility` fields are in USD (see Conventions).
- `weight` is in grams; `unit` is free text.
- `description` and `meta_description` are visible only on detail endpoints.

**Gotchas**
- Server cache is not per-user: `user_review` / `can_review` can be stale or belong to whoever hit the cache first. Fetch the user's review via `GET /front/review?product_id=` (matching `consumer_id`) or `GET /review?product_id=` if you need per-user truth.
- Response headers mark the slug endpoint publicly cacheable for 10 min (`max-age=600`); expect up to 10 min of staleness on price/stock after admin edits (cache is invalidated on admin product updates, version bump).
- `/product/{id}` and `/product/slug/{slug}` only expose active+approved products; an inactive product 404s.
- Prices may be set per variation; for `type=classified` `price`/`sale_price` at product level is the display ("from") price (unverified how it is derived).

---

### GET /product/by-tag

List products for a tag. `ProductController@getProductsByTag`. **Public**, throttle 60/min.

Query: at least one of `tag_id` (int), `tag_name` (case-insensitive contains), `tag_slug` (exact) is **required**, else 422 `{"message":"Provide at least one of: tag_id, tag_name, tag_slug"}`. Also accepts every other filter of the DB path of `GET /product` (they go through the same `filter()`), plus `paginate` (default 20) and `page`. Order is forced to `created_at desc` (any `sortBy` is applied first and then overridden/secondary; do not rely on it). Cached 10 min.

Example: `GET /api/product/by-tag?tag_slug=deal&status=1&paginate=12`

Response: slim pagination, items same as the **DB path** of `GET /product`. Never uses Elasticsearch.

---

### GET /product/by-skus

Lookup lightweight product cards by SKU. `ProductController@getProductsBySKUs`. **Public**, throttle 60/min.

Query: `skus` (required, comma-separated string). No size limit enforced. Only `status=1` products (approval not checked here). Returns 400 when `skus` is missing/empty, 404 when nothing matched.

Example: `GET /api/product/by-skus?skus=SAM-TV-55,APL-IPH-15`

Response 200:
```json
{
  "success": true,
  "total_found": 2,
  "total_requested": 2,
  "products": [
    {
      "id": 4821, "name": "Samsung 55\" 4K Smart TV", "sku": "SAM-TV-55", "slug": "samsung-55-4k-smart-tv",
      "price": 549.0, "sale_price": 499.0,
      "thumbnail": { "id": 9001, "original_url": "https://...", "image_url": "https://...", "name": "tv.jpg" },
      "rating": 4.3, "reviews_avg_rating": 4.3, "rating_count": 4.3, "reviews_count": 23
    }
  ]
}
```
Error bodies: `{"success": false, "message": "No SKUs provided. ...", "example": "/api/product/by-skus?skus=SKU123,SKU456,SKU789"}` (400); `{"success": false, "message": "No products found for the provided SKUs.", "skus_searched": [...]}` (404). Note the list key is `products` (not `data`) and there is no pagination. Order is not guaranteed. `sale_price` is returned raw (not validated against `is_sale_enable`).

---

### GET /product/recommendations/{identifier}

Recommendation carousels for a product page. `ProductRecommendationsController@show`. **Public**, throttle 60/min. `identifier` = numeric product id **or** slug.

Query: `currency` (optional; `ZMW|ZW|USD|ZAR` regional visibility as in Conventions; omitted = no filtering, "backward-compatible with mobile apps"). Server-cached 1 h per (product, currency); response `max-age=600`.

Behaviour: finds the product's leaf categories, then returns up to 10 products per section, excluding the product itself, only active+approved: `related_products` (random from same categories), `top_rated` (average rating >= 4, most reviews first), `latest` (newest first).

Example: `GET /api/product/recommendations/samsung-55-4k-smart-tv?currency=USD`

Response:
```json
{
  "success": true,
  "product_id": 4821,
  "product_name": "Samsung 55\" 4K Smart TV",
  "product_slug": "samsung-55-4k-smart-tv",
  "data": {
    "related_products": [ { "id": 5001, "name": "...", "slug": "...", "short_description": "...", "type": "simple", "unit": null, "weight": null,
      "price": 399.0, "sale_price": 0, "discount": 0, "sku": "...", "stock_status": "in_stock", "is_sale_enable": 0,
      "sale_starts_at": null, "sale_expired_at": null, "is_featured": 0, "is_trending": 0, "quantity": 3,
      "estimated_delivery_text": null, "return_policy_text": null, "has_expedited_shipping": 0,
      "standard_shipping_days": null, "expedited_shipping_days": null, "standard_shipping_price": null, "expedited_shipping_price": null,
      "product_thumbnail": { "id": 1, "image_url": "https://...", "original_url": "https://..." },
      "product_galleries": [ { "id": 1, "image_url": "https://...", "original_url": "https://..." } ],
      "variations": [],
      "brand": { "id": 7, "name": "Samsung", "slug": "samsung" },
      "reviews_count": 5, "reviews_avg_rating": 4.2, "rating_count": 4, "review_ratings": [0,0,1,2,2],
      "created_at": "2026-03-01 10:00:00",
      "layby_eligibility": { "eligible": true, "price": 399.0, "price_usd": 399.0, "currency": "USD", "threshold": 100, "is_sale_product": false, "deposit_percentage": 30, "available_durations": [6] } } ],
    "top_rated": [ ],
    "latest": [ ]
  }
}
```
Gotchas: `sale_price` is `0` (not null) when absent; `variations` is always `[]` and `product_galleries` contains only the thumbnail on these cards; `rating_count` here is the **rounded integer** average (differs from detail endpoint meaning). `weight` always null. 404 `{"message":"Product not found.","identifier":"..."}`. Cards ignore `is_sale_enable` (a raw `sale_price` may be shown even if the sale is disabled/expired - validate `sale_price < price` and the dates client-side). `related_products` is random so it changes after cache expiry.

---

### GET /product/search-promo

Lightweight DB-only product lookup for promo/template tooling. `ProductController@searchForPromo`. **Public**, throttle **30/min**. Not intended for the shopping UI, but usable as a cheap name/SKU type-ahead.

Query: `search` (string, `iLIKE` against name, sku, search_keywords), `on_sale=1` (only `sale_price > 0`). Always `status=1`, hard limit 50, no pagination, no approval check.

Response:
```json
{
  "data": [ { "id": 4821, "name": "...", "sku": "SAM-TV-55", "price": 549.0, "sale_price": 499.0,
              "product_thumbnail": { "id": 9001, "original_url": "https://...", "image_url": "https://...", "name": "tv.jpg" } } ],
  "total": 1
}
```
No `slug` in items (cannot deep-link without a second call). On error: `{"data": [], "total": 0, "error": "..."}` with HTTP 500. Slow on big tables (full scan `iLIKE`).

---

### GET /product-feed-categories-tree-root

Category tree used by product feeds. `ProductController@getCategoryTree`. **Public**, no throttle. No params.

Returns a plain array of active (`status=1`) root categories ordered by name, each with `subcategories` (nested recursively). Item = full Category model: `id, name, slug, description, status, type, parent_id, commission_rate, sort_order, category_image, category_icon, subcategories[]`. Also `GET /product-feed-currencies-all` returns all currencies (same as `GET /currency` without pagination, 6 h cache).

---

### GET /search/products

Direct Elasticsearch product search (what `GET /product?search=` forwards to). `SearchController@products`. **Public**, throttle 60/min.

| Param | Type | Notes |
|---|---|---|
| `q` (aliases `search`, `keyword`) | string | Empty or `*` = browse/match-all. If no term **and** none of `category`, `brand`, `rating`, `price` is present, returns an empty page. |
| `page` | int | default 1 |
| `size` | int | default 20, clamped 1-100 (here it is `size`, not `paginate`) |
| `category` | csv slugs | |
| `brand` | csv brand slugs | |
| `price` | csv ranges `a-b` or `min` | effective price (sale if present else price) |
| `min`, `max` | number | both required |
| `rating` | csv 1-5 | star bands `[r, r+1)` |
| `attribute` | csv attribute-value slugs | |
| `tag` | csv tag **names**-ish | matched against `tags.keyword` (tag names in the index, not slugs - unverified: the index stores tag names, so passing a slug only works when slug == name) |
| `store_id` | int | |
| `on_sale`, `is_featured`, `is_trending` | `1` | |
| `delivery` | csv exact `estimated_delivery_text` | |
| `currency` | `ZMW|ZW|USD|ZAR` | regional visibility (see Conventions) |
| `sortBy` | string | see sort table; case-sensitive: `A_TO_Z, Z_TO_A, LOW_TO_HIGH, HIGH_TO_LOW, DISCOUNT_HIGH_TO_LOW, RATING_HIGH_TO_LOW, RATING_LOW_TO_HIGH, ON_SALE/SALE, RELEVANCE, NEWEST, OLDEST, POPULAR, ASCENDING, DESCENDING` (+ aliases). With a sort and a term, matching is stricter (term must be in name or SKU). |
| `submit` | `1` | logs the query for analytics |

Always filters `status=1`, `is_approved=1`, `price > 0`. A relevance floor (`min_score`) applies when searching without explicit filters. Fuzzy/typo tolerance and token overlap rules (>=75% of words, 100% for single-word queries) apply.

Example: `GET /api/search/products?q=air%20fryer&size=20&page=1&sortBy=LOW_TO_HIGH&currency=ZAR&submit=1`

Response (slim pagination, ES document items as described under `GET /product` ES path). 500 on failure with `{"error":"search_failed","message":"Internal Server Error","details":"..."}`. Empty hits: `{"data":[],"current_page":1,"last_page":0,"per_page":20,"total":0}`.

Gotchas: this path never reads the database for products so stock/price can lag by the indexing delay (indexing happens after commit on product save); `user_review` is always `null`.

---

### GET /search/categories

Categories that actually contain products (aggregation over the ES index). `SearchController@categories`. **Public**, throttle 60/min. No params.

Response:
```json
{
  "success": true,
  "data": [ { "id": 5, "slug": "tvs", "name": "TVs", "type": "product", "parent_id": 2, "product_count": 134, "subcategories": [] } ],
  "total": 1
}
```
Flat list (hierarchy via `parent_id`; `subcategories` always empty). Up to 1000 categories. If Elasticsearch fails it silently falls back to all active DB categories with `product_count: 0`.

---

### GET /natural-search

AI-assisted multilingual search (Shona, Ndebele, Zulu, Xhosa, Sesotho, Bemba, Nyanja, Swahili, Afrikaans -> English keywords). `NaturalSearchController@search`. **Public**, throttle **30/min**.

| Param | Type | Notes |
|---|---|---|
| `q` | string, **required** | Missing/empty -> 422 `{"error":"Query is required"}` (no `search` alias in this path). |
| `page` | int | default 1 |
| `size` | int | default 20, clamp 1-100 |
| `currency` | `ZMW|ZW|USD|ZAR` | same regional rules |

No other filters (no category/price/sort). Status 1, approved, price > 0 enforced. The query is expanded by an LLM (result cached 48 h per normalised query), then ranked by multi-keyword matching.

Example: `GET /api/natural-search?q=ndiri%20kutsvaga%20chikafu%20cheimbwa&currency=USD&size=20`

Response:
```json
{
  "ai": {
    "language": "Shona",
    "english_query": "dog food",
    "intent": "Looking for food for their dog",
    "keywords": ["dog food", "puppy food", "..."],
    "is_translated": true,
    "original": "ndiri kutsvaga chikafu cheimbwa"
  },
  "data": [ { "...ES product document..." } ],
  "total": 42,
  "current_page": 1,
  "last_page": 3,
  "per_page": 20
}
```
Gotchas: if `AI_SEARCH_ENABLED` is false it falls back to plain `/search/products` behaviour (and then the response has no `ai` key and empty `q` is handled by that endpoint). Items are raw ES `_source` (no defaults merged: fields such as `layby_eligibility`, `user_review`, `review_ratings` may be absent -> null-check everything). Slow (LLM call) on first use of a phrase; debounce and use only on submit. 500 `{"error": "Search failed: ..."}` on ES errors.

---

### GET /natural-search/expand

Returns just the AI expansion (no products). **Public**, throttle 30/min. Param: `q` (required; missing -> 422 `{"error":"Query required"}`).

Response (also what is embedded as `ai` above, plus categories):
```json
{
  "language": "Shona",
  "english_query": "dog food",
  "intent": "Looking for food for their dog",
  "keywords": ["dog food", "dry dog food", "..."],
  "categories": ["Pet Supplies", "Pet Food"],
  "is_translated": true,
  "original": "ndiri kutsvaga chikafu cheimbwa"
}
```
Up to 12 keywords. If AI providers fail it returns a fallback (keywords = the raw query; exact fallback shape unverified).

---

### GET /category

Paginated **root** categories with nested subcategories. `CategoryController@index`. **Public** (no auth, no throttle). Cached 10 min per full query string.

| Param | Type | Notes |
|---|---|---|
| `type` | string | Use `type=product` (the web does). Other value seen: blog categories (`type=post`, unverified). Note: when `type` is given the select-column list is dropped and the full Category row is returned. |
| `status` | `0`/`1` | Pass `status=1`; not applied by default. |
| `paginate` | int | default 25 (pass a large number, e.g. 100, to get all roots at once) |
| `page` | int | |
| `ids` | csv ids | |
| `parent` | any truthy | forces `parent_id IS NULL` (already the default) |
| `field` + `sort` (`asc`/`desc`) | | explicit ordering |
| `orderby` | `asc`/`desc` | direction for `sort_order` (default `asc`) |
| `store_slug` | slug | only categories having products from that store |

Example: `GET /api/category?type=product&status=1&paginate=100`

Response (standard Laravel paginator, `data` items):
```json
{
  "id": 2, "name": "Electronics", "slug": "electronics", "description": null,
  "category_image_id": 40, "category_icon_id": 41,
  "category_image": { "id": 40, "uuid": "...", "name": "...", "disk": "public", "file_name": "...", "image_url": "https://..." },
  "category_icon":  { "id": 41, "uuid": "...", "name": "...", "disk": "public", "file_name": "...", "image_url": "https://..." },
  "status": 1, "type": "product", "parent_id": null, "sort_order": 1, "commission_rate": 5.0,
  "subcategories": [
    { "id": 5, "name": "TVs", "slug": "tvs", "parent_id": 2, "sort_order": 1,
      "subcategories": [ { "id": 9, "name": "OLED", "slug": "oled", "parent_id": 5, "sort_order": 1 } ],
      "parent": { "id": 2, "name": "Electronics", "slug": "electronics", "parent_id": null, "sort_order": 1 } }
  ]
}
```
Gotchas: subcategory entries do **not** include `status`, images or `type` - only `id, name, slug, parent_id, sort_order` (+ nested `subcategories`, `parent`); fetch the leaf via `/category/slug/{slug}` for the full row. The web wraps the list in a synthetic root. Depth is whatever nests (2-3 levels).

---

### GET /category/{id}

`CategoryController@show`, **public** (route-model-bound numeric id). Returns the Category row with `subcategories` (each with its own `parent`). Does not filter by `status`. 404 when missing.

### GET /category/slug/{slug}

`CategoryController@getCategoryBySlug`, **public**, throttle 120/min, slug `^[A-Za-z0-9\-_]+$`. Only `status=1` categories. 400 `{"message":"Invalid slug."}`, 404 `{"message":"Category not found.","slug":"..."}`. Returns the Category model (`id, name, slug, description, category_image{..}, category_icon{..}, status, type, parent_id, sort_order, commission_rate, created_by_id, created_at, updated_at`); **no `subcategories`** here. `Cache-Control: public, max-age=600`.

Use the category `slug` as the `category` filter of `/product` and `/search/products`.

---

### GET /categoryFront

`CategoryController@indexFront` -> cached-forever (until admin changes) paginator (30 per page) of root categories with `subcategories` and `parent`, ordered by `sort_order`. **Public**. **No `status` filter and no `type` filter** (blog + product categories, disabled ones included), no params honored (the 31st+ root is unreachable). Prefer `/category?type=product&status=1&paginate=100`.

---

### GET /brand

`BrandController@index`. **Public**. Cached 10 min.

| Param | Notes |
|---|---|
| `status` | default 1 |
| `paginate` | int (default 50, max 100) or the literal string `all` (no pagination) |
| `page` | int |

Example: `GET /api/brand?paginate=100&page=1`

Response (paginated):
```json
{
  "success": true,
  "data": [ { "id": 7, "name": "Samsung", "slug": "samsung", "description": null, "brand_image_id": 55, "meta_title": null, "meta_description": null, "status": 1,
              "brand_image": { "id": 55, "uuid": "...", "image_url": "https://...", "original_url": "https://..." }, "created_at": "...", "updated_at": "..." } ],
  "message": "Brands fetched successfully",
  "current_page": 1, "last_page": 3, "per_page": 50, "total": 120, "from": 1, "to": 50,
  "cached": true
}
```
With `paginate=all`: `{ "success": true, "data": [...], "message": "...", "cached": bool, "total": n }`. Ordered by name asc. Filter products by brand with `brand=<slug>` on `/product`.

### GET /brand/{id}

Returns `{ "success": true, "data": { ...brand + brand_image }, "message": "Brand fetched successfully", "cached": bool }`; 404 when missing. Numeric id only (slug not supported).

---

### GET /attribute

`AttributeController@index`. **Public**. Cached 10 min per query string. Returns paginator (default `paginate=20`, newest first) of attributes with nested `attribute_values`.

Query: `paginate`, `page`, `status` (0/1), `field`+`sort`, `store_slug`.

Item:
```json
{ "id": 1, "name": "Colour", "slug": "colour", "style": "color", "status": 1, "created_by_id": 1,
  "attribute_values": [ { "id": 11, "value": "Black", "slug": "black", "hex_color": "#000000", "attribute_id": 1, "status": 1 } ],
  "created_at": "...", "updated_at": "..." }
```
`style` is a free string chosen in admin (required on create; known uses `color`, `rectangle`, `circle`, `image`, `dropdown` - unverified list). Hex only meaningful when `style` is color.

### GET /attribute/{id}
Single attribute (with values). 404 if missing.

### GET /attribute-value
`AttributeValueController@index`: **all** values (no filter), newest first, `paginate` defaults to the total count (pass `paginate`). Standard paginator. Items: `id, value, slug, hex_color, attribute_id, status, created_at, ...`. The table can be very large; avoid in the app. Use the nested values of `/attribute` or the product detail.

### GET /attribute-value/{id}
Single value.

To filter products by attribute: send `attribute=<value slug>[,<value slug>]` to `/product` or `/search/products`.

---

### GET /front/review

Public review list. `ReviewController@frontIndex`. **No auth**. Query:

| Param | Notes |
|---|---|
| `product_id` | filter to a product (recommended) |
| `paginate` | default = **all rows** (pass e.g. 50) |
| `page` | |
| `field` + `sort` | optional explicit ordering (default `created_at desc`) |

Example: `GET /api/front/review?product_id=4821&paginate=50`

Response (standard paginator). Item = raw review row (relations are **not** eager-loaded):
```json
{ "id": 77, "rating": 5, "description": "Great TV", "product_id": 4821, "store_id": 1, "consumer_id": 312, "review_image_id": null, "created_at": "2026-04-01T09:00:00.000000Z" }
```
Gotchas: no reviewer name/avatar and no image URL are included (the web adapter looks for `consumer.name` and shows "Anonymous" because the field is absent - treat reviewer identity as unavailable unless the backend is extended; `review_image` object is also not included, only `review_image_id`). `rating` is an integer 1-5. Hidden fields: `updated_at`, `deleted_at`.

### GET /review and GET /review/{id}

Routes are public in `routes/api.php` but the controller applies `authorizeResource`; `index`/`show` run policy `viewAny`/`view` which require a **logged-in user with permission `review.index`** (admin/vendor). A normal customer (or a guest) gets 403 (guest: policy needs a user -> 403/401). `show` returns nothing. **Mobile clients should use `GET /front/review` for listing.** If a user with permission calls `GET /review`, items include `product` and `store` relations; vendors only see their own store's reviews. The web only references `/review?product_id=` "for edit-ownership checks" in comments, but does not rely on it.

### POST /review

Create a review. **Auth required** (Bearer, Sanctum). `CreateReviewRequest`. Content-Type JSON (or multipart).

| Field | Type | Rules |
|---|---|---|
| `product_id` | int | required; must exist in products (not deleted) |
| `rating` | int | required; 1-5 |
| `description` | string | nullable |
| `review_image_id` | int | nullable; must be an existing **attachment id** (upload first, see below) |
| `store_id` | int | optional; validated if present but **ignored** (taken from the product) |

Business rules (repository): the user must have an order for that product whose payment is completed **and** order status is Delivered; and must not have already reviewed that product (one review per user per product). Otherwise errors (HTTP 400, `{"message": "...", "success": false}`):
- `Please purchase the product before adding a review.`
- `Review possible for completed payment and delivered order.`
- `A review for this product has already been submitted.`
Validation failures: HTTP 422 `{"message":"<first error>","success":false}`.

Example:
```
POST /api/review
Authorization: Bearer <token>
Content-Type: application/json

{ "product_id": 4821, "rating": 5, "description": "Great TV", "review_image_id": 9300 }
```
Response 200: the created review row, plus loaded relations `review_image` (attachment object or null) and `consumer` (the user object: `id, name, email, ...` - field set depends on the User model; unverified):
```json
{ "id": 78, "rating": 5, "description": "Great TV", "product_id": 4821, "store_id": 1, "consumer_id": 312, "review_image_id": 9300,
  "created_at": "...", "review_image": { "id": 9300, "image_url": "https://..." }, "consumer": { "id": 312, "name": "Jane" } }
```

**Review image upload** (two steps): 1) `POST /api/attachment` (auth required) as `multipart/form-data` with file field `attachment` (single) or `attachments[]` (multiple); aliases `file`, `image`, `files[]`, `images[]` are accepted. JSON alternatives: `image_base64` / `images_base64[]` / `attachment_base64` (raw base64 or data URI), or `image_url` / `images_url[]` (server fetches the URL). Allowed mime/ext: jpg, jpeg, png, webp, gif, avif, bmp, svg, ico; max 20 MB each. Response 201: the attachment object (`id`, `uuid`, `image_url`, `file_name`, ...) - an array if several files. 2) Use `id` as `review_image_id`. The web app does not currently send images with reviews; a single image per review is supported.

### PUT /review/{id}

Update own review. **Auth required**. Policy: only `consumer_id == current user`. `UpdateReviewRequest` rules: `rating` **required** int 1-5, `description` nullable string, `review_image_id` nullable existing attachment id, `product_id`/`store_id` nullable (ignored). **Gotcha**: the repository overwrites `review_image_id` and `description` with the submitted values, so always resend the existing values you want to keep (omitting `review_image_id` removes the image; omitting `description` blanks it). Returns the updated review row.

```
PUT /api/review/78
{ "rating": 4, "description": "Updated text", "review_image_id": null }
```

### DELETE /review/{id}

**Auth required**. `ReviewPolicy::delete` requires permission `review.destroy` (admin/staff). A normal customer is expected to get 403. (The web adapter exposes a delete call; whether customers are granted `review.destroy` by role is unverified - treat deletion as not available to customers.) Success returns the deleted count (`1`).

---

### GET /question-and-answer

Product Q&A list. `QuestionAndAnswerController@index`. **Public** (no auth needed).

| Param | Notes |
|---|---|
| `product_id` | filter by product (use this) |
| `product_slug` | filter by product slug |
| `paginate` | default = all rows; pass e.g. 50 |
| `page` | |
| `field` + `sort` | explicit order (otherwise `created_at desc`) |

Example: `GET /api/question-and-answer?product_id=4821&paginate=50`

Response (standard paginator), item:
```json
{
  "id": 15, "question": "Does it support Dolby Vision?", "answer": "Yes.", "product_id": 4821, "store_id": 1, "consumer_id": 312,
  "created_at": "...", "updated_at": "...",
  "product": { "id": 4821, "name": "Samsung 55\" 4K Smart TV" },
  "store": { "id": 1, "store_name": "OneStop" },
  "reaction": null, "total_likes": 3, "total_dislikes": 0
}
```
Gotchas: for guests / customers only answered questions (`answer IS NOT NULL`) are returned. When a Bearer token is sent the "answered only" filter is **dropped** (the controller resets the query for logged-in users; customers filtered by `product_id` additionally see their own unanswered questions). `reaction` is the logged-in user's like/dislike (null for guests). The consumer's name is not included in the payload (`consumer` relation not loaded).

### GET /question-and-answer/{id}
Single Q&A by id (public).

### POST /question-and-answer

Ask a question. **Auth required** (Bearer). Additionally the policy requires permission `question_and_answer.create` on the user's role; customers are expected to have it (web does this successfully). `QuestionAndAnswerRequest` rules: `question` required string, `product_id` required, must exist.

```
POST /api/question-and-answer
{ "product_id": 4821, "question": "Is wall mount included?" }
```
Response: the created row (`id, question, answer: null, product_id, store_id: null, consumer_id, created_at, ...` plus `product`, `store`, `reaction`, `total_likes`, `total_dislikes`). Note `store_id` is taken from the request body if sent, else null; the answer is added later by the vendor/admin (an unanswered question does not appear publicly). `answer` can technically be sent in the body but it is not validated or stripped (do not send).

(`PUT`/`DELETE /question-and-answer/{id}` need `question_and_answer.edit/destroy` permissions - staff only. `POST /question-and-answer/feedback` for likes/dislikes also exists; its body is `FeedbackRequest`, out of scope here - unverified.)

---

### GET /blog

Published blog posts. `BlogController@index`. **Public**. Forced `status = 1`; sticky posts first for guests/customers; then `created_at desc`. Default `paginate=12`.

| Param | Notes |
|---|---|
| `paginate`, `page` | |
| `category` | csv category slugs |
| `tag` | csv tag slugs |
| `ids` | csv ids |
| `field` + `sort` | extra ordering |

Response (standard paginator), item (list view hides `content` and `meta_description`):
```json
{
  "id": 3, "title": "Buying guide", "slug": "buying-guide", "description": "Short text",
  "blog_thumbnail_id": 70, "blog_meta_image_id": 71, "meta_title": "...",
  "is_featured": 0, "is_sticky": 1, "status": 1, "created_by_id": 1,
  "blog_thumbnail": { "id": 70, "image_url": "https://..." },
  "blog_meta_image": { "id": 71, "image_url": "https://..." },
  "categories": [ { "id": 2, "name": "Guides", "slug": "guides" } ],
  "tags": [ { "id": 4, "name": "tips", "slug": "tips" } ],
  "created_by": { "id": 1, "name": "Admin", "email": "admin@example.com" },
  "created_at": "...", "updated_at": "..."
}
```
Gotchas: `created_by` exposes author name + **email** publicly (do not display the email).

### GET /blog/{id}
Single post by id incl. `content` and `meta_description` (HTML). Not filtered by status (drafts reachable by id).

### GET /blog/slug/{slug}
Single post by slug, same payload as `/blog/{id}` (`content` HTML included). Not status-filtered (drafts reachable by slug). Not-found -> error body `{ "message": "...", "success": false }` with the status code (404 expected, may be 500 since the underlying exception code is 0 - unverified; the web treats any non-OK as "not found").

---

### GET /page

CMS pages. `PageController@index`. **Public**. No default status filter (pass `status=1`). `paginate` default = all. Also `field`+`sort`. Items: `id, title, slug, meta_title, page_meta_image_id, page_meta_image{..}, status, created_by_id, created_at, updated_at`, with `created_by`; `content` / `meta_description` visibility on list unverified (model hides nothing, so they are likely included, making this heavy).

### GET /page/{id}
Page by id (public).

### GET /page/slug/{slug}
`PageController@getPagesBySlug`. Returns the page including `content` (HTML) and `meta_description`. Not-found: HTTP 404 `{"message":"Page not found","error":"..."}`. Not status-filtered. Typical slugs: terms, privacy, about, returns etc. (depends on admin data - unverified list).

---

### GET /faq

`FaqController@index`. **Public**. `paginate` default = all, `page`, `status` is NOT honored in this controller (the web sends `status=1` anyway; unverified whether filtered by the repository's `RequestCriteria` - it is: Prettus `RequestCriteria` maps `?search=` / `?searchFields=` etc., but not `status` unless searchable; assume all FAQs are returned and filter `status == 1` client-side). Newest first.

Item:
```json
{ "id": 1, "title": "How long is delivery?", "description": "<p>...</p>", "status": 1, "created_by_id": 1, "created_at": "...", "updated_at": "..." }
```
Standard paginator (the web reads `payload.data` or a bare array).

### GET /faq/{id}
Single FAQ.

---

### GET /home

`HomePageController@index`. **Public**. Returns the home-page layout/config for the currently **active theme** (slug of the first theme with `status = true`), cached 10 min. Optional `slug` query forces another home page row and bypasses the cache.

Example: `GET /api/home`

Response:
```json
{
  "id": 1,
  "slug": "paris",
  "content": {
    "home_banner": {
      "status": true,
      "main_banner":  { "image_url": "https://.../1.0.png", "redirect_link": { "link": "", "link_type": "collection" } },
      "sub_banner_1": { "image_url": "...", "redirect_link": { "link": "", "link_type": "collection" } },
      "sub_banner_2": { "image_url": "...", "redirect_link": { "link": "", "link_type": "collection" } }
    },
    "featured_banners": { "status": true, "banners": [ { "status": true, "image_url": "...", "redirect_link": { "link": "", "link_type": "collection" } } ] },
    "main_content": {
      "status": true,
      "sidebar": {
        "status": true,
        "categories_icon_list": { "title": "Categories", "status": true, "category_ids": [2, 5] },
        "left_side_banners": { "status": true, "banner_1": { "image_url": "...", "redirect_link": { } }, "banner_2": { "image_url": "...", "redirect_link": { } } },
        "sidebar_products": { "title": "Trending Products", "status": true, "product_ids": [4821, 5001] }
      },
      "section1_products": { "title": "Top Save Today", "description": "...", "status": true, "product_ids": [1, 2, 3] },
      "home_appliances": { "title": "Best Selling Appliances", "description": null, "status": true, "product_ids": [] },
      "section2_categories_list": { "title": "Browse By Categories", "description": "...", "status": true, "image_url": null, "category_ids": [] },
      "section3_two_column_banners": { "status": true, "banner_1": { }, "banner_2": { } },
      "section4_products": { "title": "...", "description": "...", "status": true, "product_ids": [] },
      "section5_coupons": { "status": true, "image_url": "...", "redirect_link": { } },
      "section6_two_column_banners": { "status": true, "banner_1": { }, "banner_2": { } },
      "section7_products": { "title": "Our Best Seller", "description": "...", "status": true, "product_ids": [] },
      "section8_full_width_banner": { "status": true, "image_url": "...", "redirect_link": { } },
      "section9_featured_blogs": { "title": "Featured Blog", "description": "...", "status": false, "blog_ids": [] }
    },
    "news_letter": { "title": "...", "sub_title": "...", "image_url": "...", "status": false },
    "products_ids": [1, 2, 3, 4821, 5001],
    "popup_images": { "zambia": [ { "image_url": "...", "link": "" } ], "south_africa": [], "other": [] }
  }
}
```
How to render it: the response contains **only ids**, not products/categories/blogs. Resolve products with `GET /product?ids=1,2,3` (DB path; re-order client-side to the given id order, the API does not preserve it), categories via `/category`, blogs via `/blog?ids=`. `content.products_ids` is the server-aggregated union of every product id used by sections 1/4/7, `home_appliances` and the sidebar list, so one `GET /product?ids=<products_ids>&paginate=<n>` call can feed the whole page (watch URL length/page size: set `paginate` >= number of ids; default is 20). `redirect_link.link_type` is `collection` (link = collection/category slug), possibly also `product` or `page` (unverified); `link` may be empty. Honour `status: false` by hiding a section. `popup_images` are keyed per region: show `zambia` to ZMW users, `south_africa` to ZAR, `other` otherwise (matches the hardcoded keys in the admin controller). Banner `image_url`s may be absolute `http://` URLs of the API host: upgrade to https. The exact set of sections depends on the active theme row (the seeded theme is `paris`); fields can be missing or null, so parse defensively. `GET /home/{id}` exists but its controller method is empty (returns an empty 200); do not use.

---

### GET /theme/show

Active themes. `ThemeController@showing`. **Public**. Returns a plain array: `[ { "id": 1, "name": "Paris", "slug": "paris", "status": 1, "created_at": "...", "updated_at": "..." } ]` for `status = 1`, ordered by id.

### GET /theme/default

Single theme object (first active theme, or first theme if none active), same fields as above. Mobile apps usually do not need themes; `GET /home` already resolves the active theme.

(`GET /theme` is a paginator of themes, default `paginate=10`; `GET /theme/{id}` single; both public.)

---

### GET /themeOptions   (alias GET /themeOptionsFront)

Admin-editable site chrome: logos, header/footer text, support contacts, social links, copyright, SEO defaults. `ThemeOptionController@index` / `@indexFront` return the same cached (forever, until admin saves) single row. **Public**. No params.

Response shape: the ThemeOption row with an `options` object (the web reads `payload.options`):
```json
{
  "id": 1,
  "options": {
    "header": { "support_number": "+263 ...", "...": "..." },
    "footer": {
      "support_email": "support@...", "about_address": "...", "footer_about": "...",
      "footer_copyright": true, "copyright_content": "...",
      "addresses": [ ], "help_center": [ ],
      "social_media_enable": true, "facebook": "...", "twitter": "...", "instagram": "...", "pinterest": "..."
    }
  },
  "created_at": "...", "updated_at": "..."
}
```
Only the `header.support_number` and the `footer.*` keys above are verified (used by the web); other `options` keys (logos, seo, etc.) are unverified.

---

### GET /settings

Public store settings subset. `SettingController@frontSettings` (via `SettingRepository::frontSettings`). **Public**. No params. Cached on the server by the settings cache.

Response:
```json
{
  "values": {
    "general": { "min_order_amount": 0, "min_order_free_shipping": 0, "default_currency_id": 1, "...": "..." },
    "analytics": { },
    "activation": { },
    "maintenance": { },
    "delivery": { },
    "wallet_points": { "min_per_order_amount": 1, "point_currency_ratio": 1, "signup_points": 0, "reward_per_order_amount": 0 },
    "google_reCaptcha": { "status": false, "site_key": "" },
    "payment_methods": [
      { "name": "cod", "title": "Cash on delivery", "status": true },
      { "name": "bank_transfer", "title": "Bank transfer", "status": true, "accounts": [ ], "company": null }
    ]
  }
}
```
Only these 7 groups + `payment_methods` are exposed (enum `FrontSettingsEnum`: general, analytics, activation, maintenance, delivery, wallet_points, google_reCaptcha). `payment_methods[].status` is boolean; show only `status == true`. Other fields inside each group are admin-defined (not enumerated here - unverified).

**Mobile quirk**: when the `User-Agent` matches Flutter/Dart/okhttp/etc., the server coerces `values.general.min_order_amount` and `values.wallet_points.min_per_order_amount` / `point_currency_ratio` to **strings** (because the older shipped apps hard-cast them as String). All other numeric fields keep native types. The web (non-mobile UA) gets the original numeric types. Parse these defensively (`num.tryParse(v.toString())`) so it works regardless of UA.

### GET /settingsFront

`SettingController@indexFront`. **Public**. Returns `getCachedSettings()` serialised: the **entire** `settings` row `{ id, values: { ...ALL groups... }, created_at, updated_at }`, not the whitelisted subset (same mobile string-coercion rule). Contains more groups than `/settings` (unverified exactly which, possibly including payment gateway config; do not store/log it). Prefer `/settings`. (`GET /backend/settings` is the admin variant and requires permission.)

---

### GET /currency

`CurrencyController@index`. **Public**. `paginate` default **10** (pass `paginate=50`), `page`, `field`+`sort`. Standard paginator.

Item:
```json
{ "id": 1, "code": "USD", "symbol": "$", "no_of_decimal": 2, "exchange_rate": "1.0000", "status": 1,
  "symbol_position": "before_price", "decimal_separator": ".", "thousands_separator": ",", "created_by_id": 1, "created_at": "...", "updated_at": "..." }
```
`exchange_rate` is a decimal that may arrive as a **string** (not in the `$casts`); parse to double. `exchange_rate` = units of that currency per 1 USD (USD = 1). The web filters nothing by `status`; skip entries with `status == 0` yourself (unverified whether disabled rows are returned).

### GET /currencyFront
`getCachedCurrencies()`: all currency rows as a plain array (no pagination, cached until admin change). Preferred for the app currency picker. Same item shape.

### GET /currency/{id}
Single currency.

How the client chooses: see the Conventions section. Regional rule of thumb used in the apps: ZW/USD -> USD; Zambia -> ZMW; South Africa -> ZAR (also send the matching `currency` param to search endpoints so country-restricted products are filtered).

---

### GET /tax

`TaxController@index`. **Public**. `paginate` default = all, `status`, `field`+`sort`. Items: `{ "id": 1, "name": "VAT", "rate": "15.00", "status": 1, "created_by_id": 1, "created_at": "...", "updated_at": "..." }`. Product `tax_id` references these. Tax is computed server-side at checkout; the app normally does not need this list.

### GET /tax/{id}
Single tax.

---

### GET /coupon

Public coupon list. `CouponController@index`. **Public** (no auth; note that it exposes coupon codes). `paginate` default = all, `status` (0/1), `field`+`sort`. Items:
```json
{ "id": 1, "title": "Welcome 10%", "description": "...", "code": "WELCOME10", "type": "percentage", "amount": "10.00",
  "min_spend": 50, "start_date": "2026-01-01", "end_date": "2026-12-31", "status": 1, "is_expired": 0,
  "is_unlimited": 1, "is_apply_all": 1, "is_first_order": 0, "usage_per_coupon": null, "usage_per_customer": 1, "used": 0,
  "content": null, "created_by_id": 1, "created_at": "...", "updated_at": "..." }
```
(`type` is `percentage` or `fixed` - unverified naming.) Filter `status == 1`, `is_expired == 0`, and dates client-side. Coupon application/verification happens in the cart/checkout endpoints (other section).

### GET /coupon/{id}
Single coupon.

---

### GET /orderStatus

`OrderStatusController@index`. **Public**. `paginate` default = all, `status`, `field`+`sort` (default order `sequence asc`). Items: `{ "id": 1, "name": "Pending", "slug": "pending", "sequence": 1, "status": 1, "system_reserve": 1, "created_by_id": 1, "created_at": "...", "updated_at": "..." }`. Use `slug` / `name` to label order states (the "Delivered" name is also what gates review eligibility). `GET /orderStatus/{id}` single.

---

### POST /catalog/{slug}/hit

Page-view beacon for HTML catalog pages. `CatalogPageController@hit`. **Public**, throttle 300/min. `slug` must match `[a-z0-9_-]+`. No body. Counts the visit (the User-Agent decides whether it is counted as a bot or a human). Returns **204 No Content**; 404 if the catalog page does not exist or is inactive. (`GET /catalog/{slug}` serves the HTML itself; it is a web route outside `/api` - unverified for mobile use.) Mobile apps rarely need this; call it only if you embed a catalog page in a WebView and want visits counted.

---

### Wishlist - authenticated

All routes: `Route::apiResource('wishlist')` in the `auth:sanctum` group (Bearer required, 401 without). Headers: `Authorization: Bearer <token>`, `Accept: application/json`, `Content-Type: application/json`.

**GET /wishlist** - the user's wishlisted **products** (full Product models, with default eager loads and appends; heavy). Query: `paginate` (default = number of items; the web uses `paginate=200`), `page`. Response: standard paginator whose `data` is product objects (use `.id`). Order is database order. Unverified: if the user has zero items `paginate(0)` may misbehave; always pass `paginate`.

**POST /wishlist**

| Field | Type | Rules |
|---|---|---|
| `product_id` | int | required; must exist and not be deleted |

Idempotent (adding an existing product returns it again). Response 200: the Product object. `{"message": "...", "success": false}` (422) on validation errors.

**DELETE /wishlist/{id}** - **`{id}` is the PRODUCT id, not a wishlist row id.** Deletes the current user's row for that product. Returns the number of deleted rows (`1` or `0`), no error if absent.

`GET /wishlist/{id}` and `PUT /wishlist/{id}` are routed but not implemented in the controller (expect 500/405) - do not call.

### Compare - authenticated

Same auth requirements; `Route::apiResource('compare')`.

**GET /compare** - the user's compare list as full Product models; same shape and caveats as wishlist (`paginate`, default = all; the web uses `paginate=200`).

**POST /compare**

| Field | Type | Rules |
|---|---|---|
| `product_id` | int | required; must exist |
| `variation_id` | int | nullable; must exist (validated but not stored by the repository) |

Rules enforced by the repository (HTTP 400, `{"message": "...", "success": false}`): you can only compare products of the **same category** as items already in the list ("You can only compare similar products."), and a product may be added only once ("The selected product is already present in your compare list."). Success response 200: the created compare row `{ "id", "product_id", "category_id", "consumer_id", "created_at", ... }` (not the product).

**DELETE /compare/{id}** - `{id}` is the **product id**; deletes the user's row. Returns deleted-row count.

`GET /compare/{id}` / `PUT /compare/{id}` are no-ops returning empty bodies.

---

### Quick reference: which endpoints are authenticated in this section

| Endpoint | Auth |
|---|---|
| All `GET` product/search/category/brand/attribute/blog/page/faq/home/theme/settings/currency/tax/coupon/orderStatus endpoints, `GET /front/review`, `GET /question-and-answer`, `POST /catalog/{slug}/hit` | Public |
| `POST/PUT /review`, `DELETE /review/{id}` (plus `POST /attachment` for images) | Bearer |
| `GET /review`, `GET /review/{id}` | Bearer + `review.index` permission (staff) - use `/front/review` |
| `POST /question-and-answer` | Bearer (+ role permission `question_and_answer.create`) |
| `/wishlist`, `/compare` | Bearer |

### Key gotchas (summary)
1. `GET /product` is two different implementations (DB vs Elasticsearch), switched by whether a search term is present; item shapes (`categories`/`tags` as objects vs strings), supported params, and sort semantics differ. Use `search=*` to force the ES path for correct price/rating/popularity sorting.
2. Always send `status=1` on DB-path lists; use `paginate`/`page`; response meta is the slim 5-key format on `/product` and full Laravel paginator elsewhere.
3. Prices are USD; convert with `/currency` rates client-side. `currency=` on search only filters regional visibility (`USD` means Zimbabwe, `ZMW` Zambia, `ZAR` South Africa; none = unfiltered). Country-only products are returned unfiltered by the plain DB path: hide/blur by flags client-side.
4. Sale price validity requires `is_sale_enable==1`, price ordering, and the date window; recommendation/by-skus cards return raw `sale_price` (0 when absent on recommendations).
5. `rating_count` means average rating on detail, rounded int on recommendations; `reviews_avg_rating` is the numeric average on lists.
6. Product detail is cached server-side (10 min) and is not user-specific; `user_review`/`can_review` are unreliable.
7. Many list endpoints return everything unless you pass `paginate`.
8. `/review` (GET) is staff-only; public review reads use `/front/review`, which has no reviewer name/image data. Reviews require a purchased + delivered order and are one per product per user; `PUT` overwrites missing fields with null.
9. Wishlist/compare `DELETE` take the product id. Compare only allows same-category products.
10. `/settings` and `/settingsFront` coerce some fields to strings for Flutter/Dart user agents.
## Cart, Checkout, Orders, Payments, Wallet, Refunds, Tickets, Vouchers and Layby

Source of truth: `onestopstore-api` (routes in `routes/api.php`). Everything below was read from controllers, form requests, repositories, traits and `app/Payments/*`. Where behaviour could not be confirmed from code it is marked **unverified**.

### 0. Conventions that apply to every endpoint in this section

| Item | Value |
|---|---|
| Base URL | `{HOST}/api` (all paths below are relative to `/api`) |
| Auth | Everything here except `POST /layby/check-eligibility`, `GET /orderStatus`, `GET /coupon` and the payment webhooks requires `Authorization: Bearer <sanctum token>` (middleware `auth:sanctum`) |
| Required headers | `Accept: application/json`, `Content-Type: application/json` (or `multipart/form-data` for uploads), `Accept-Language: en` (the `localization` middleware sets the locale from it) |
| User-Agent | A UA containing `Dart/`, `okhttp`, `Flutter`, `ReactNative`, `CFNetwork...Darwin` or `expo` is treated as a mobile client. Effect: `standard_shipping_days` / `expedited_shipping_days` strings like `"7-14"` are rewritten to the first integer (`7`) in every JSON response, and request/payload is logged. Do not strip the default Dart UA. |
| Money | Totals from `/checkout` and stored on orders are in the **store base currency (USD)**. Numbers are JSON numbers truncated (floor) to 2 dp (`floor(x*100)/100`, not rounded). `currency`, `currency_symbol`, `exchange_rate` on an order are display metadata. Gateways convert server-side (PayFast/Yoco to ZAR, PesePay to USD, DPO to the order currency). |
| Error shape | See below. Do not rely on the HTTP status alone. |

**Error shape (important).** Most code throws `App\GraphQL\Exceptions\ExceptionHandler($message, $status)` and the intended body is
```json
{ "message": "Human readable error", "success": false }
```
Form-request validation (`CalculateCheckoutRequest`, `CreateOrderRequest`, `CreateUpdateCartRequest`, `CreateRefundRequest`, etc.) returns only the **first** validation message (HTTP 422 intended). Controllers that call `$request->validate()` directly (`/returns`, `/layby/*`, `/vouchers/redeem`, `/vouchers/check`) return the standard Laravel body `{ "message": "...", "errors": { "field": ["..."] } }` with 422. Tickets return `{ "success": false, "message": "...", "errors": {...} }`.
Unverified: `ExceptionHandler` and the plain `Exception`s thrown by `OrderRepository` have no custom render hook in `bootstrap/app.php` / `Handler.php`, so on the live server they may reach the client as HTTP 500 with the message in `message` (or just `"Server Error"` when `APP_DEBUG=false`). Always read `message`; treat any non-2xx as failure; do not branch on 422 vs 500 alone.
Standard Laravel responses still apply: `401 {"message":"Unauthenticated."}` for a missing/invalid token, `403 {"message":"This action is unauthorized."}` for policy failures, `404` for unknown model ids.

**Pagination.** Endpoints that return a Laravel paginator (`GET /order`, `GET /refund`, `GET /returns`, `GET /layby/my-applications`, wallet/points `transactions`) use the `paginate` (page size) and `page` query params. `paginate` defaults to "the total row count" on most list endpoints (so omitting it returns everything in one page). Always send `paginate`. Paginator body keys: `current_page, data[], first_page_url, from, last_page, last_page_url, links[], next_page_url, path, per_page, prev_page_url, to, total`.

---

## Part A. Cart

The server cart (per user) is optional: a mobile app may keep a local cart and only send `products[]` to `/checkout` and `/order`. If you do mirror to the server, read the quantity semantics carefully.

### Quantity semantics cheat sheet (this caused the doubling bug)

| Endpoint | Quantity behaviour | Key |
|---|---|---|
| `POST /cart` | **ADDS** `quantity` to the existing line, or creates the line | matches on (user, `product_id`, `variation_id`, `delivery_option_id`) |
| `PUT /cart` | **ADDS** as well (identical logic to POST; name is misleading) | same as above |
| `POST /sync/cart` | **ADDS** each line (guest-cart merge). Calling it twice doubles quantities | same as above |
| `PUT /replace/cart` | **SETS** the quantity absolutely | the cart row `id` |
| `DELETE /cart/{id}` | removes the line | row `id` |
| `POST /clear/cart` | removes all lines | |

Rule: use `POST /cart` only to add a delta (the amount the user just added), `PUT /replace/cart` for any "set quantity to N", never re-POST the full current quantity. Do not mirror server-pulled lines back to `POST /cart` (that doubled quantities on refresh in the web app).

### GET /cart
- **Auth:** yes
- **Query:** `paginate` (int; default = row count of the whole carts table, i.e. effectively unlimited; send e.g. `200`), `page`
- **Response 200:** NOT a paginator. Only the lines on the requested page, newest first:
```json
{
  "items": [
    {
      "id": 812,
      "product_id": 1425296,
      "variation_id": null,
      "delivery_option_id": null,
      "consumer_id": 77,
      "quantity": 2,
      "sub_total": "78.56",
      "item_shipping_method": "standard",
      "item_shipping_cost": 5,
      "created_at": "2026-11-20T08:10:00.000000Z",
      "updated_at": "2026-11-20T08:10:00.000000Z",
      "product": { "id": 1425296, "name": "…", "price": 39.28, "…": "full product object" },
      "variation": null,
      "delivery_option": null
    }
  ],
  "sub_total": 78.56,
  "shipping_total": 5,
  "total": 83.56,
  "has_gift_cards": false
}
```
- **Gotchas:** `sub_total` on a line is the amount frozen when the line was last added/replaced (price snapshot); totals here are NOT authoritative, call `POST /checkout` for real totals. `shipping_total` only sums `item_shipping_cost` (per-product standard/expedited prices), not global shipping rules. `sub_total` per line type (string vs number) is **unverified**: parse defensively. `item_shipping_cost` is a float or `null`. The relation key is `delivery_option` (snake_case).

### POST /cart  (add: ADDS quantity)
- **Auth:** yes
- **Body (JSON):**

| Field | Type | Req | Validation / notes |
|---|---|---|---|
| `product_id` | int | yes | `exists:products,id` (not soft-deleted) |
| `variation_id` | int\|null | no | `exists:variations,id` |
| `delivery_option_id` | int\|null | cond. | `exists:product_delivery_options,id`. **Required in practice** when the product has active delivery options, otherwise 400 "Please choose a delivery option for this product." |
| `quantity` | int | yes (in practice) | NOT validated by the request class; send an int >= 1 |
| `item_shipping_method` | `standard`\|`expedited` | no | only takes effect if product `has_expedited_shipping == 1`; sets `item_shipping_cost` from the product's `standard_shipping_price` / `expedited_shipping_price` |

```json
{ "product_id": 1425296, "variation_id": null, "quantity": 1 }
```
- **Behaviour:** if a line exists for (product, variation, delivery option) the quantity is added and `sub_total` is increased by `price * quantity` at the current price; stock is checked only in this "line already exists" case (error 400 `"You cannot add more than {existing quantity} items."`). A brand-new line is **not stock-checked**. Gift-card rule: gift vouchers cannot be mixed with other products (400 "Gift vouchers cannot be purchased with other products..." / "Your cart contains gift vouchers...").
- **Response 200:** totals object but only for the line just touched:
```json
{ "items": [ { "id": 812, "product_id": 1425296, "quantity": 2, "…": "see GET /cart" } ],
  "sub_total": 78.56, "shipping_total": 0, "total": 78.56, "has_gift_cards": false }
```
Read the cart row id from `items[0].id` (needed for replace/delete).
- **Errors:** 422 invalid/deleted product/variation/option; 400 delivery option missing/out of stock; 400 gift card mixing; 400 stock exceeded; 404 "Product not found."

### PUT /cart  (also ADDS)
Same body, validation, side effects and errors as `POST /cart`. Difference: response is the **whole** cart `{items:[all lines], sub_total, shipping_total, total, has_gift_cards}` (no pagination). Do not use this to "update" a quantity.

### PUT /replace/cart  (SET quantity absolutely)
- **Auth:** yes
- **Body:**

| Field | Type | Req | Notes |
|---|---|---|---|
| `id` | int | yes | cart row id (from `items[].id`); line must belong to the caller, else 404 "Cart item not found." |
| `product_id` | int | yes | |
| `variation_id` | int\|null | no | |
| `delivery_option_id` | int\|null | no | |
| `quantity` | int | yes | not validated server-side; send >= 1. Omitting it can corrupt the line. |
| `item_shipping_method` | `standard`\|`expedited` | no | updates `item_shipping_method` and `item_shipping_cost` |

```json
{ "id": 812, "product_id": 1425296, "variation_id": null, "quantity": 3 }
```
- **Behaviour:** stock check against option/variation/product stock; on failure 400 `"You cannot add more than {requested quantity} items."` (the message echoes the quantity you asked for). `sub_total` is recomputed at the current price.
- **Response 200:** the bare updated cart row (with `product`, `variation`, `delivery_option`), NOT the totals object.
- **Errors:** 404 line not found; 400 stock; 400 delivery option problems.

### POST /sync/cart  (guest-cart merge; ADDS per line)
- **Auth:** yes
- **Body:** a top-level JSON **array**:
```json
[ { "product_id": 1425296, "variation_id": null, "quantity": 1 },
  { "product_id": 1427777, "variation_id": 55, "delivery_option_id": 9, "quantity": 2 } ]
```
Validation: `*.product_id`, `*.variation_id`, `*.delivery_option_id` must exist when present.
- **Behaviour:** each line goes through the same add logic (quantities add to what is already stored). Lines whose product has delivery options but none selected are silently skipped. Whole call is one DB transaction.
- **Response 200:** totals object for the lines of this request only (not the full cart). If the array is empty or all lines were skipped the response degrades to a raw request item (edge case): follow with `GET /cart` instead of trusting this response.
- **Gotcha:** not idempotent. Call at most once per login merge, then clear the local guest cart.

### DELETE /cart/{id}
- **Auth:** yes. `{id}` = cart row id.
- **Response 200:** `true`. 404 if the id does not exist or belongs to someone else.

### POST /clear/cart
- **Auth:** yes. No body. **Response 200:** `true`.
- The server also clears the user's whole server cart automatically after a successful `POST /order`.

---

## Part B. Checkout (price preview)

### POST /checkout
Recalculates everything server-side (prices, per-item/rule shipping, coupon, tax, wallet, points). Read-only: creates nothing. Use it on every change in the checkout screen and just before `POST /order`.

- **Auth:** yes
- **Body:**

| Field | Type | Req | Validation / notes |
|---|---|---|---|
| `products` | array | yes | `required\|array` |
| `products[].product_id` | int | yes | exists (not deleted) |
| `products[].variation_id` | int\|null | no | exists |
| `products[].delivery_option_id` | int\|null | cond. | exists. Required if the product has active delivery options ("Please choose a delivery option for product N." 400) |
| `products[].quantity` | int | yes (in practice) | not validated by the request class but used for every calculation |
| `products[].selected_attribute_ids` | int[] | no | echoed into the response lines |
| `products[].variation_display_name` | string | no | echoed |
| `products[].item_shipping_method` | `standard`\|`expedited` | no | per-item shipping choice (see shipping rules) |
| `products[].price` / `single_price` | | | **ignored**; price always comes from the DB |
| `billing_address_id` | int | yes | `exists:addresses,id` (ownership is not checked server-side) |
| `shipping_address_id` | int | yes | same; its `country_id` selects the shipping rules |
| `coupon` | string | no | must equal an existing coupon `code` (`exists:coupons,code`), otherwise message "We could not find an {code} coupon". The web app sends `coupon_code`, which the API **ignores**: send `coupon`. |
| `payment_method` | string | no | nullable. If empty, totals are still computed. If sent, the method must be enabled in Settings (`cod, bank_transfer, paypal, pese, payfast, pdo_zambia, yoco`) or be `wallet`/`points`/`layby`, else 400 "The provided payment method is not currently enable." |
| `wallet_balance` | bool (or 1/0) | no | apply wallet credit (includes `non_cashable_balance`) |
| `points_amount` | bool (or 1/0) | no | apply loyalty points |
| `delivery_price` | number | no | delivery fee chosen by the customer. **Client-supplied and added to the total as-is** (the API has no delivery-method pricing table). |
| `consumer_id` | int | no | defaults to the token's user; do not send |

```json
{
  "products": [
    { "product_id": 1425296, "variation_id": null, "quantity": 2, "item_shipping_method": "standard" }
  ],
  "billing_address_id": 31,
  "shipping_address_id": 31,
  "payment_method": "payfast",
  "coupon": "SAVE10",
  "wallet_balance": false,
  "points_amount": false,
  "delivery_price": 10
}
```
- **Response 200:**
```json
{
  "items": [
    {
      "store": 1,
      "products": [
        {
          "store_id": 1,
          "product_id": 1425296,
          "variation_id": null,
          "selected_attribute_ids": null,
          "variation_display_name": null,
          "delivery_option_id": null,
          "delivery_option_label": null,
          "delivery_option_text": null,
          "delivery_option_price": null,
          "tax": 0,
          "shipping_cost": 5,
          "fast_shipping_cost": 0,
          "item_shipping_method": "standard",
          "has_fast_shipping": false,
          "item_status": "pending",
          "estimated_delivery_text": "7-14 days",
          "single_price": 39.28,
          "quantity": 2,
          "subtotal": 70.7,
          "product_name": "…", "product_sku": "…", "product_slug": "…",
          "product_price": 39.28, "product_sale_price": null, "product_image_url": "https://…"
        }
      ],
      "total": {
        "tax_total": 0, "shipping_total": 5, "fast_shipping_total": 0,
        "sub_total": 70.7, "total": 75.7,
        "convert_point_amount": 0, "convert_wallet_balance": 0, "coupon_total_discount": 7.85
      }
    }
  ],
  "total": {
    "tax_total": 0,
    "shipping_total": 5,
    "fast_shipping_total": 0,
    "points": 120,
    "convert_point_amount": 0,
    "points_amount": 1.2,
    "wallet_balance": 14.5,
    "convert_wallet_balance": 0,
    "coupon_total_discount": 7.85,
    "delivery_price": 10,
    "sub_total": 70.7,
    "total": 77.85
  }
}
```
- **How to read `total`:** `total = sub_total + tax_total + shipping_total + fast_shipping_total + delivery_price - coupon_total_discount - |convert_point_amount| - |convert_wallet_balance|` (never below 0). `sub_total` is already after coupon discount. `points` = raw points balance; `points_amount` = currency value of points still unused after this order; `wallet_balance` = wallet credit still unused after this order; `convert_point_amount` / `convert_wallet_balance` = **negative** amounts that will actually be applied (only non-zero when you sent `points_amount`/`wallet_balance: true`; points are applied first, then wallet). The per-store `items[].total` ignores wallet/points. With multi-vendor enabled there is one `items[]` entry per store.
- **Errors (message strings):**
  - 422 "Please ensure your order is at least {min_order_amount} before proceed." (compares the raw product subtotal, before coupon, to setting `general.min_order_amount`)
  - 422 coupon problems: "To apply coupon code X, your order total should be {min_spend} or higher.", "The coupon code X has reached its maximum usage...", "The coupon code X was applicable from {start} to {end}", "The coupon code cannot be used as the coupon feature is currently disabled."
  - 400 "The selected payment method is not available for this order amount." / "The provided payment method is not currently enable."
  - 400 "Gift vouchers cannot be purchased using wallet balance or points..." and "Gift vouchers must be purchased separately from other products."
  - 400 `{ "success": false, "message": "Product N is inactive or missing." | "Product N requires a variation." | "Variation V for product N is inactive." | "Variation V for product N has insufficient stock." | "Product N has insufficient stock." | "Please choose a delivery option for product N." }` (returned as a response, not thrown)
  - 405 "Wallet feature currently disabled..." / "Points feature currently disabled..." (when wallet/points are requested while the feature is off)
  - 422 first validation message, for example "Product ID is required for all items.", "One or more products in your cart are no longer available. Please refresh your cart and try again.", "The selected billing address is invalid."

### How shipping cost is computed (`/checkout` and `POST /order` use the same code)
Order of precedence, evaluated per product line:
1. **Gift cards** (`is_gift_card`): no shipping at all.
2. **Client-forced expedited:** if the line has `has_fast_shipping: true` and `fast_shipping_cost`, the server trusts it: `fast_shipping_cost * quantity` goes to `fast_shipping_total` (method `expedited`). Do not send these fields from the app unless you got the price from the product object; prefer option 3.
3. **Per-product prices:** if the product has `standard_shipping_price > 0` and/or `expedited_shipping_price > 0`:
   - `item_shipping_method: "expedited"` and expedited price > 0 -> `expedited_shipping_price * quantity` added to `fast_shipping_total`
   - `"standard"` (also the default when the method is empty and a standard price exists) -> `standard_shipping_price * quantity` added to `shipping_total`
   - A price of `0`/`null` means "not configured" and falls through to step 4.
   Line fields in the response: `item_shipping_method` (defaults to `"standard"` even when nothing applied), `shipping_cost`, `fast_shipping_cost`, `has_fast_shipping`.
4. **Global shipping rules** (admin tables `shippings` -> `shippingRule`), only when the line had no per-item shipping, the product is not `is_free_shipping`, and the cart subtotal is **below** `general.min_order_free_shipping` (setting; seed default 100). The rules are looked up from the **shipping address country** (`shipping_address_id` -> `country_id` -> active `Shipping` -> its active `ShippingRule`s). For each rule:
   - `rule_type = base_on_weight`: applies per product when the product's `weight` is between `min` and `max`: `shipping_type = fixed` -> `quantity * amount`; `percentage` -> `subtotal * amount / 100`.
   - `rule_type = base_on_price`: applies when the unit price **or** the line subtotal is within `[min, max]`: `fixed` -> `amount` once per order (first matching product only); `percentage` -> `subtotal * amount / 100`.
   - `shipping_type = free` (or anything else) adds 0.
   All matching rules are summed (they stack).
5. A cart at or above the free-shipping threshold gets no step-4 shipping, but step-3 per-product shipping still applies.

`shipping_total` (standard + rules) and `fast_shipping_total` (expedited) are reported separately. Tax is exclusive: `tax = discounted line subtotal * tax.rate / 100` using the product's tax record. The checkout response does not tell you which rule matched; the mobile UI only needs the totals. To show "standard vs expedited" choices, read `standard_shipping_price`, `expedited_shipping_price`, `has_expedited_shipping`, `standard_shipping_days`, `expedited_shipping_days` from the product (Products section) and send the choice as `products[].item_shipping_method`, then re-call `/checkout`.

### Coupons at checkout
Send the code as `coupon` to `/checkout` and again to `POST /order`. `GET /coupon` (public, paginated) lists coupons (see the Coupons section of the guide). Behaviour worth knowing:
- Coupon lookup uses `code LIKE %value%` (or id LIKE), so a partial string can match another coupon; the request validation first requires an exact code.
- `type = fixed`: the fixed `amount` is subtracted **from every eligible line** (so N eligible lines get N times the amount); skipped for a line whose subtotal is smaller than the amount.
- `type = percentage`: `subtotal * amount / 100` per eligible line (also skipped if subtotal < the percentage number).
- Eligibility per line: `is_apply_all` (minus `exclude_products`) or listed `products`.
- Checked: coupon feature enabled, `min_spend` against the raw subtotal, `usage_per_coupon` remaining, `usage_per_customer`, date window when `is_expired` is set. On successful `POST /order` the coupon's `usage_per_coupon` is decremented.
- The discount is returned as `total.coupon_total_discount`.

---

## Part C. Orders

Order identifier: **`order_number`** (integer, starts at 1000). The route key for `/order/{order}` is `order_number`, not the database `id`. `id` is still present in JSON and is used by refunds/returns/order notes/tickets bodies (`order_id`).

### POST /order  (place order)
- **Auth:** yes (consumer needs the `order.create` permission, which the consumer role has)
- **Body:**

| Field | Type | Req | Validation / notes |
|---|---|---|---|
| `products` | array | yes | |
| `products[].product_id` | int | yes | exists |
| `products[].variation_id` | int\|null | no | exists |
| `products[].delivery_option_id` | int\|null | cond. | exists; required when the product has active delivery options |
| `products[].quantity` | int | yes | |
| `products[].selected_attribute_ids` | int[]\|null | no | `array` |
| `products[].variation_display_name` | string | no | max 255 |
| `products[].item_shipping_method` | string | no | `standard` / `expedited` |
| `billing_address_id` | int | yes | exists |
| `shipping_address_id` | int | yes | exists |
| `payment_method` | string | yes (in practice) | `in:payfast,pdo_zambia,pese,cod,bank_transfer,paypal,yoco,wallet`. `stripe`, `pesepay`, `layby`, `points` are rejected. Omitting it fails later with "The provided payment method is not currently enable." |
| `consumer_id` | int | no for consumers | exists. For the consumer role it is optional and defaults to the token user. Do not send another user's id (see security notes). |
| `coupon` | string | no | exact existing code |
| `wallet_balance` | bool | no | debit wallet |
| `points_amount` | bool | no | debit points |
| `delivery_price` | number | no | delivery fee, trusted as given |
| `delivery_description` | string | no | free text, e.g. "Standard Delivery" |
| `delivery_interval` | string | no | e.g. "8am-5pm" |
| `note` | string | no | order note |
| `currency` | string(<=10) | no | defaults to `USD`; normalised from the `currencies` table |
| `currency_symbol` | string(<=5) | no | |
| `exchange_rate` | number >= 0 | no | used if > 1, else DB rate |
| `return_url` | string | cond. | gateway return URL (see Part D). Not validated by the request. |
| `cancel_url` | string | cond. | gateway cancel URL |
| `payfast_fee` | number >= 0 | no | extra PayFast fee added to the total (SA-only orders) |
| `sub_total`, `shipping_total`, `grand_total` | number | no | **Only honoured when `payment_method = yoco`** (then the server trusts these client values for `amount`, `shipping_total`, `total`). For every other method they are ignored. If you use Yoco, copy them from the latest `/checkout` response. |
| `session_id` | string | no | links an analytics cart-abandonment record |

Do not send: `order_status_id`, `order_status`, `payment_status`, `tax_total`, `parent_id`, `store_id`, `created_by_id`. The first two are trusted if present (a customer could set an arbitrary initial status), `tax_total` overrides tax when > 0.

```json
{
  "products": [ { "product_id": 1425296, "variation_id": null, "quantity": 2, "item_shipping_method": "standard" } ],
  "billing_address_id": 31,
  "shipping_address_id": 31,
  "payment_method": "payfast",
  "coupon": null,
  "wallet_balance": false,
  "points_amount": false,
  "delivery_price": 10,
  "delivery_description": "Standard Delivery",
  "note": "Leave at the gate",
  "currency": "USD",
  "currency_symbol": "$",
  "exchange_rate": 1,
  "return_url": "https://shop.example.com/order",
  "cancel_url": "https://shop.example.com/checkout"
}
```
- **What the server does (in order):** normalises/dedupes `products`; recomputes all amounts (same as `/checkout`, client totals never trusted except Yoco); creates the order(s) with status `pending` and `payment_status = PENDING`; clears the user's server cart; debits points then wallet (immediately, even if a gateway still has to be paid); decrements coupon usage; then creates the payment. If wallet+points cover the whole total the order is marked paid (`COMPLETED`, status moved to `processing`). With multi-vendor enabled, extra stores become `sub_orders` (child orders with `parent_id`).
- **HTTP status:** 200 (not 201) for every success shape.
- **Response shapes** (decide by `is_redirect` / presence of `url`):

  1. **Redirect gateways** (`paypal`, `pese`, `payfast`, `pdo_zambia`, `yoco`):
  ```json
  { "order_number": 1055, "transaction_id": "1042-AbCdEfGhIj", "url": "https://…gateway or API redirect page…", "is_redirect": true }
  ```
  Open `url` in an in-app WebView / Custom Tab. The order already exists (status `pending`, payment `PENDING`).

  2. **`cod` and `bank_transfer`:** the full order object (see GET /order/{order_number}) with `payment_method` = the method and `payment_status = "PENDING"`. No payment step; for bank transfer show the bank details from `GET /settings` -> `values.payment_methods[]` where `name == "bank_transfer"` (`title`, `status`, `company`, `accounts[]{bank, account_number, bic}`).

  3. **`wallet`:** slim body, order already marked paid:
  ```json
  { "order_number": 1055, "payment_method": "wallet", "payment_status": "COMPLETED" }
  ```
- **Errors:** any failure inside placement is rethrown as `"Order placement failed: <reason>"` (validation of stock/coupon/payment-method messages from Part B apply). A failure **after** the order was committed (for example the gateway refusing to create the payment: `"Order placement failed: Payment creation failed: …"`) leaves a real `pending` order behind and wallet/points already debited, and the cart already cleared. The app must then `GET /order?paginate=…` / `GET /order/{n}` to find it and offer `POST /rePayment`, instead of re-posting `/order` (which would create a second order).
- **Gotchas:**
  - `payment_method: "wallet"` marks the order `COMPLETED` unconditionally. Only use it when wallet (+points) fully covers `total` (check `/checkout` returned `total.total == 0`). Unverified: the server does not re-check that nothing remains to pay.
  - If wallet+points fully cover the total but you still sent a gateway method, the order is marked paid and then the gateway is asked to charge 0, which fails. Switch to `wallet` in that case.
  - Gateways receive `order.total + order.delivery_price`, and `order.total` already includes `delivery_price` (see `createOrder`). If `delivery_price > 0` the gateway may be asked to charge delivery twice (code review observation, unverified in production). Confirm with the backend before sending a non-zero `delivery_price` on gateway payments.
  - `coupon_code`, `delivery_title`, `shippingOption` and similar keys the web app sends are ignored.
  - Stored `points_amount` and `wallet_balance` on the order are **negative** numbers (amount used).

### GET /order  (my orders)
- **Auth:** yes (`order.index`). Role filtering: consumers see only their own orders; vendors see orders containing their store's products; admins see all. Only parent orders are listed (`parent_id IS NULL`); sub-orders are nested in `sub_orders`.
- **Query:**

| Param | Type | Notes |
|---|---|---|
| `paginate` | int | page size. **Omit = all orders in one page.** (The web app's `limit` param is ignored.) |
| `page` | int | |
| `field` + `sort` | string | both required for ordering, e.g. `field=created_at&sort=desc`. Default order is newest first. |
| `status` | 0\|1 | row active flag |
| `order_status_id` | int | filter by status id (list from `GET /orderStatus`) |
| `start_date` + `end_date` | date | both required; filters `created_at` |
| `search` | string | free-text over `order_number`, `payment_method`, `payment_status`, `orderStatus.name`, consumer name/email/phone, product `search_keywords`, shipping city/street (case-insensitive LIKE) |
| `searchFields`, `searchJoin`, `orderBy`, `sortedBy`, `filter`, `with` | | Prettus repository criteria params also work (e.g. `search=cod&searchFields=payment_method:like`); not needed by the app |

`payment_status`, `consumer_id`, `store_id` and `order_number` filters shown in the Swagger annotations are **not** implemented; use `search`.
- **Response 200:** paginator; each `data[]` item is an order row with relations (`consumer`, `order_status`, `products` with only `id,name,product_thumbnail_id,…` columns, `sub_orders`, `billing_address`, `shipping_address`, `status_histories`, `notes` (public only), plus `summary`). The list `products` entries do not include `pivot` details; fetch the order for line prices.
- **Errors:** on an internal failure this endpoint returns `{ "success": false, "message": "Failed to fetch orders", "error": "…", "data": [], "meta": {…} }`.

### GET /order/{order_number}  (order detail)
- **Auth:** yes. `{order_number}` = the integer order number, **not** `id`. (Same data is exposed at `GET /trackOrder/{order_number}` and `GET /verifyPayment/{order_number}`.)
- **Access:** consumers only see their own (else `403 {"message":"You are not authorized to view this order."}`); vendors only orders containing their products; unknown number -> `404 {"message":"Order not found.","error":"…"}`.
- **Side effect (important):** for orders that have a gateway transaction (`paypal`, `pese`, `payfast`, `pdo_zambia`, `yoco`), this call also runs the gateway status check (see Part D). Reading the order can therefore capture a PayPal payment or mark a DPO payment `FAILED`. For plain `cod`/`bank_transfer`/`wallet` orders it is a pure read.
- **Response 200:** the order. Real field names:
```json
{
  "id": 4412,
  "order_number": 1055,
  "consumer_id": 77,
  "store_id": 1,
  "parent_id": null,
  "amount": 70.7,
  "tax_total": 0,
  "shipping_total": 5,
  "fast_shipping_total": 0,
  "delivery_price": 10,
  "payfast_fee": 0,
  "coupon_id": null,
  "coupon_total_discount": 0,
  "points_amount": 0,
  "wallet_balance": 0,
  "total": 85.7,
  "payment_method": "payfast",
  "payment_status": "PENDING",
  "order_status_id": 1,
  "currency": "USD",
  "currency_symbol": "$",
  "exchange_rate": 1,
  "delivery_description": "Standard Delivery",
  "delivery_interval": null,
  "note": "Leave at the gate",
  "invoice_url": null,
  "qr_code_url": null,
  "is_gift_order": false,
  "billing_address_id": 31,
  "shipping_address_id": 31,
  "status": 1,
  "created_by_id": 77,
  "created_at": "2026-11-24T09:12:03.000000Z",
  "consumer": { "id": 77, "name": "…", "email": "…", "country_code": "263", "phone": "…" },
  "order_status": { "id": 1, "name": "pending", "slug": "pending", "sequence": 1 },
  "status_histories": [ { "old_status_id": 1, "new_status_id": 2, "old_status": {"id":1,"name":"pending"}, "new_status": {"id":2,"name":"processing"}, "updated_by": {"id":3,"name":"…","email":"…"}, "created_at": "…" } ],
  "notes": [ { "id": 9, "order_id": 4412, "note": "Shipped via courier", "privacy": "public", "created_by_id": 3, "created_at": "…" } ],
  "products": [
    {
      "id": 1425296, "name": "…", "product_thumbnail_id": 55,
      "pivot": {
        "order_id": 4412, "product_id": 1425296, "variation_id": null,
        "selected_attribute_ids": null, "variation_display_name": null,
        "delivery_option_id": null, "delivery_option_label": null, "delivery_option_text": null, "delivery_option_price": null,
        "quantity": 2, "single_price": 39.28, "tax": 0, "shipping_cost": 5, "fast_shipping_cost": 0,
        "item_shipping_method": "standard", "has_fast_shipping": false,
        "refund_status": null, "item_status": "pending", "cancellation_reason": null, "eta": null,
        "estimated_delivery_text": "7-14 days", "subtotal": 78.56, "qr_code": null,
        "product_name": "…", "product_sku": "…", "product_slug": "…", "product_image_url": "https://…",
        "product_price": 39.28, "product_sale_price": null
      }
    }
  ],
  "sub_orders": [],
  "billing_address": { "id": 31, "…": "address fields" },
  "shipping_address": { "id": 31, "…": "address fields" },
  "summary": {
    "subtotal": 70.7, "shipping": 5, "fast_shipping": 0, "delivery": 10, "tax": 0,
    "grand_total": 85.7, "coupon_discount": 0, "points_used": 0, "wallet_used": 0,
    "total_discounts": 0, "final_total": 85.7, "amount_to_pay": 85.7
  }
}
```
- **Gotchas:** `delivered_at`, `updated_at`, `store`, `deleted_at` are hidden from the JSON (the Swagger `delivered_at` field never appears). `order_number` is an int. `private` order notes are filtered out for non-admins here. Use `pivot.product_name` / `product_image_url` / `single_price` (frozen snapshot) rather than the live product, which may have changed or been deleted. `order.total` is the amount **left to pay after** coupon/points/wallet; `summary.grand_total` is before deductions.

### PUT /order/{order_number}  and  DELETE /order/{order_number}
Not for customers. `DELETE` is denied for everyone (policy returns nothing -> 403). `PUT` is an admin/CRM status update (`order_status_id`, `payment_method`, address ids, …); authorisation is not enforced on it (see security notes), so do not call it from the app. Order cancellation by the customer is **not available through the API**: use a support ticket or a return/refund request.

### GET /trackOrder/{order_number}
Same payload and permissions as `GET /order/{order_number}` (it calls the same code path). Unknown/foreign order numbers fail with a message like `"Payment verification failed: Order verification failed: The provided order number is not valid."`.

### GET /verifyPayment/{order_number}
- **Auth:** yes
- Looks up the order (consumers: own orders only), and if the order has a stored gateway transaction, asks the gateway for status and updates `payment_status`. Returns the order object (same shape as above) with the refreshed `payment_status` (and `order_status` moved to `processing` once paid).
- Error `"Payment verification failed: Order verification failed: The provided order number is not valid."` when the order is not yours.
- Per-gateway behaviour is in Part D. Poll this endpoint, not `POST /rePayment`.

### POST /rePayment  (retry / pay for an existing pending order)
- **Auth:** yes
- **Body:**

| Field | Type | Req | Notes |
|---|---|---|---|
| `order_number` | int/string | yes | must be your order |
| `payment_method` | string | yes | one of `cod, bank_transfer, paypal, pese, payfast, pdo_zambia, yoco, wallet`; any other value -> "The selected payment method is not valid for this transaction." |
| `wallet_balance`, `points_amount` | bool | no | only used to decide whether a 0.01-or-less remainder may finish the order without a gateway |
| `return_url`, `cancel_url` | string | cond. | same meaning as `POST /order` |

```json
{ "order_number": 1055, "payment_method": "payfast", "return_url": "https://shop.example.com/order", "cancel_url": "https://shop.example.com/checkout" }
```
- **Behaviour:** rejects an already paid order (`"This payment has already been successfully processed previously."`). Recomputes the remaining amount `amount + shipping + fast_shipping + delivery + tax - coupon - points_used - wallet_used`. If that remainder is `<= 0` it marks the order paid via `wallet` and returns `{ "order_number", "payment_method": "wallet", "payment_status": "COMPLETED", "amount_charged": 0 }`. Otherwise it creates a new gateway payment and returns the same shape as in `POST /order` (`{order_number, transaction_id, url, is_redirect}`, or the full order for `cod`/`bank_transfer`). It also overwrites the order's `payment_method`. It does not check whether the order was cancelled; do not offer it for cancelled orders.
- **Errors:** `"Re-payment failed: …"`.

### GET /orderStatus  (public) and status reference
`GET /orderStatus` returns the configurable statuses (`id, name, slug, sequence`, …). Seeded: `pending`(1), `processing`(2), `cancelled`(3), `shipped`(4), `out for delivery`(5), `delivered`(6); admins can add more (the code also references `collected` and CRM-driven names such as `ready for collection`, `warehouse packing`, `from supplier`, `stuck`, `in transit to zim`, `dropped at the deport`, `arrived at local branch`). Always render `order_status.name`/`slug` from the API instead of hard-coding ids.

**Order `payment_status` values seen in code** (compare case-insensitively; the PayFast webhook writes lowercase `completed` while others write `COMPLETED`; PayPal writes the raw PayPal status string): `PENDING` (initial, also COD/bank transfer until staff confirm), `COMPLETED` / `COMPLETE` / `Success` / `completed` (paid), `FAILED`, `CANCELLED`, `EXPIRED`, `REFUND`, `PROCESSING`, `AWAITING_FOR_APPROVAL`, and other raw PayPal statuses (for example `CREATED`, `APPROVED`). Treat paid = uppercase value in {`COMPLETED`,`COMPLETE`,`SUCCESS`}; failed = {`FAILED`,`CANCELLED`,`EXPIRED`}; anything else = still pending.

**Item (line) statuses** (`products[].pivot.item_status`, set per line, independent of the order status): `pending, processing, shipped, delivered, collected, cancelled, out_of_stock, out of stock, refunded, in transit to zim, out for delivery, ready for collection, warehouse packing, dropped at the deport, from supplier, stuck, arrived at local branch`. Related pivot fields: `cancellation_reason`, `eta` (date), `estimated_delivery_text`, `refund_status` (`pending|approved|rejected|completed`). When an item becomes `out_of_stock` the customer's wallet is automatically credited with the line amount (and the shipping fee if the whole order is out of stock); there is no API call for the app to trigger this.

### POST /checkout/quotation-pdf
- **Auth:** yes
- **Body:** exactly the `POST /checkout` body (same validation).
- **Response 200:** binary PDF, `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="quotation-YYYYMMDD-HHMMSS.pdf"`. Save/share it as a file; do not parse JSON.
- **Errors:** JSON `{ "success": false, "message": "…" }` with 400 (out of stock/inactive/etc., same messages as `/checkout`), 422 ("Unable to generate a quotation for the current cart.") or 500 ("Failed to generate quotation PDF: …"). Nothing is persisted. Currency printed = the user's `preferred_currency` or `currency` body field (default USD). Generation can take several seconds (timeout 300 s): use a long receive timeout.

### Order notes: /order-notes
Staff-facing notes attached to an order (`privacy`: `public` or `private`). Customers already receive public notes inside the order object (`notes[]`), so the app normally does not call these.
| Method + path | Body / query | Response |
|---|---|---|
| `GET /order-notes?order_id=&privacy=&paginate=` | filters optional | paginator of notes (`id, order_id, note, privacy, created_by_id, created_at`); **no ownership or privacy filtering**: do not call from the customer app |
| `POST /order-notes` | `order_id` (required, exists), `note` (required string), `privacy` (required, `public`\|`private`) | the created note |
| `GET /order-notes/{id}` | | note |
| `PUT /order-notes/{id}` | `note` (sometimes\|required string), `privacy` (sometimes\|required `public`\|`private`) | updated note |
| `DELETE /order-notes/{id}` | | deleted count |
These routes have no per-user authorisation (any authenticated user can touch any order's notes, including private ones). Treat them as admin-only; use the order `note` field on `POST /order` for customer remarks.

---

## Part D. Payment methods and gateway flows

Enabled methods come from `GET /settings` -> `values.payment_methods[]` (`name`, `title`, `status`; bank transfer also `company`, `accounts[]`). Show only entries with a truthy `status`. `wallet` is internal and always accepted. `stripe` is not supported (code is commented out).

| `payment_method` | Gateway | Charged in | Returns on `POST /order` | Needs `return_url`/`cancel_url`? | Completion signal |
|---|---|---|---|---|---|
| `cod` | none | n/a | full order, `PENDING` | no | staff mark paid on delivery |
| `bank_transfer` | none | n/a | full order, `PENDING` | no | staff confirm the deposit |
| `wallet` | internal | n/a | `{order_number,payment_method,payment_status}` | no | immediate `COMPLETED` |
| `paypal` | PayPal Orders v2 | store default currency (must be a PayPal-supported currency) | `{order_number,url,transaction_id,is_redirect}` | **yes both** | return -> `GET /verifyPayment` (captures) and PayPal webhook |
| `pese` | PesePay | USD | `{order_number,transaction_id,url,is_redirect}` | return_url optional (config default), cancel not used | PesePay webhook only |
| `payfast` | PayFast | ZAR (converted) | `{order_number,transaction_id,url,is_redirect}` | return_url optional; cancel not used | PayFast webhook only |
| `pdo_zambia` | DPO Pay (3gDirectPay) | order currency (ZMW/ZAR/INR/USD conversion) | `{order_number,transaction_id,url,is_redirect}` | return_url optional (config fallback); cancel_url is from server config only | DPO return hook, DPO webhook, and `GET /verifyPayment` |
| `yoco` | Yoco checkout | ZAR (converted, minimum R1.00) | `{order_number,transaction_id,url,is_redirect}` | return_url and cancel_url used | Yoco webhook (polling only finalises if the server flag `YOCO_ALLOW_POLL_FINALIZE` is on; unverified) |

Common to all redirect gateways: the order exists with `payment_status = PENDING` before the user pays; the gateway page loads in a WebView/Custom Tab from `url`; payment confirmation is delivered to the **server** by a webhook, so the order may flip to `COMPLETED` a few seconds after the customer returns to the app. Webhook endpoints (called by the gateways, never by the app): `POST /paypal/webhook`, `GET|POST /pesepay/webhook`, `POST /payfast/webhook`, `GET|POST /yoco/webhook`, `GET|POST /dpo/webhook`, browser hop `GET|POST /dpo/return`, `GET /dpo/redirect`.

**Return/cancel URL handling for a mobile app.** The server appends `/{order_number}` to your `return_url` / `cancel_url` for PayPal, PesePay, PayFast, DPO and Yoco (Yoco: if the URL contains the literal `{order_number}` it is substituted, and `?status=successful` / `?status=cancelled` is added). So send bare bases such as `https://shop.example.com/order` and `https://shop.example.com/checkout` (https URLs; many gateways reject custom schemes like `myapp://`). In the WebView, intercept navigation to those prefixes (do not actually load the page), close the WebView, extract the order number from the last path segment, then poll. PayPal in particular requires both URLs: when they are missing the cancel/return URL becomes just `"/1055"` and PayPal rejects it.

**Polling contract (recommended).** After the WebView closes (or the user taps "I have paid"), call `GET /verifyPayment/{order_number}` every ~3 s for up to ~2 minutes (stop on the first terminal value):
- paid: `payment_status` upper-cased is `COMPLETED`, `COMPLETE` or `SUCCESS` -> show success (`order_status` will be `processing`).
- failed: `FAILED`, `CANCELLED`, `EXPIRED` -> offer retry with `POST /rePayment`.
- anything else (`PENDING`, `PROCESSING`, raw PayPal statuses) -> keep polling, then show "payment pending, we will notify you".
Poll cadence caveats per gateway:
- **PayPal:** `verifyPayment` calls PayPal's *capture* API. Call it only after the customer returned from PayPal (return_url hit). Calling before approval makes PayPal reject the capture and the server marks the order `FAILED` and returns an error. After a successful capture, later calls return the order unchanged (`ORDER_ALREADY_CAPTURED`). The PayPal webhook also completes the order.
- **DPO (pdo_zambia):** `verifyPayment` queries DPO and maps anything not approved to `FAILED`, even if the payment is still in progress. Only start polling after the DPO redirect back; a later webhook/poll can still move `FAILED` to `COMPLETED`. DPO flow: `url` is an API-hosted page `/api/dpo/redirect?...` that creates the DPO token and 302s to DPO; afterwards DPO returns to `/api/dpo/return?redirect=<your return_url>/{order_number}` which updates the order server-side and 302s to your return URL.
- **PayFast, PesePay:** `verifyPayment` does not contact the gateway; it only re-reads the order. The webhook is the only thing that changes the status, so keep polling until it lands. PayFast's `url` is an API-hosted page (route `payfast.redirect`) that auto-posts a form to PayFast.
- **Yoco:** same as PayFast unless the server enables polling-finalise; webhook is authoritative. Webhook signature enforcement is configurable server side.
- **COD / bank transfer / wallet:** no polling needed (`PENDING` is the normal state for the first two).
`GET /order/{order_number}` triggers the same verification and can be used instead of `verifyPayment`.

**Wallet/points + gateway (split payment).** Send `wallet_balance`/`points_amount: true` with a gateway method: the wallet/points portion is debited at order creation, and the gateway is asked for the remainder (`order.total`). If the customer abandons the gateway the debited wallet/points are **not** automatically refunded by this API; the order stays `pending` and can be retried with `POST /rePayment`.

**Totals the gateway charges.** `order.total` (+ `delivery_price`; see the double-count note above) converted to the gateway currency using server exchange rates; PayFast adds the optional `payfast_fee` you passed.

---

## Part E. Shipping endpoints (admin tables)

`GET /shipping`, `GET /shipping/{id}`, `POST/PUT/DELETE /shipping`, `GET /shippingRule`, `GET /shippingRule/{id}`, `POST/PUT/DELETE /shippingRule`, `PUT /shipping/{id}/{status}`, `PUT /shippingRule/{id}/{status}` all require staff permissions (`shipping.index/create/edit/destroy`) that the consumer role does **not** have, so a customer token gets 403. They are **not usable from the mobile app**. Shipping cost for a customer must come from `POST /checkout` (see "How shipping cost is computed"). For completeness the admin payloads are:
- `Shipping`: `{ country_id (required), status (0|1) }` -> `{ id, country_id, status, country{}, shipping_rules[] }`.
- `ShippingRule`: `{ name (required, <=255), rule_type (required: base_on_price|base_on_weight), shipping_type (required: free|fixed|percentage), min (required numeric >= 0), max (required numeric >= min), amount (required for percentage: 0 to 99.99), status (required 0|1), shipping_id (required, exists) }`.

---

## Part F. Wallet and points

### GET /wallet/consumer/self
- **Auth:** yes (any role; no permission gate). Returns the caller's wallet (created on demand).
- **Query:** `paginate` (transactions page size; default = all), `page`, `search` (matches transaction `type`: `credit`/`debit`), `start_date` + `end_date` (both, filters `created_at`). Do **not** pass `consumer_id`: the endpoint honours it and would return another user's wallet (security note).
- **Response 200:**
```json
{
  "id": 12,
  "consumer_id": 77,
  "balance": 14.5,
  "non_cashable_balance": 5,
  "transactions": {
    "current_page": 1,
    "data": [
      { "id": 301, "wallet_id": 12, "point_id": null, "order_id": null,
        "detail": "Wallet amount successfully debited for Order #1055",
        "amount": 10, "type": "debit", "from": 3, "created_at": "2026-11-24T09:12:03.000000Z" }
    ],
    "per_page": 15, "total": 1, "last_page": 1, "…": "paginator keys"
  }
}
```
`balance` = cashable credit (refundable); `non_cashable_balance` = gift-voucher/store credit (spendable on orders, not withdrawable). Spendable total = `balance + non_cashable_balance` (that is what `/checkout` uses; non-cashable is spent first). Currency = store base currency. Errors: 405 "Wallet feature currently disabled. Turn it on in Settings > Activation."; 400 "user must be consumer" for non-consumer tokens.
Staff-only siblings (not for the app): `GET /wallet/consumer` (`wallet.index`, accepts `consumer_id`), `POST /credit/wallet`, `POST /debit/wallet`.

### POST /wallet/refund-all  (request a withdrawal of the whole cashable balance)
- **Auth:** yes. No body.
- **Behaviour:** debits the entire `balance` column (not `non_cashable_balance`) immediately and opens a pending refund request (`payment_type: wallet`) for staff to process; if staff reject it the amount is credited back.
- **Response 200:** `{ "wallet": { …wallet incl. transactions… }, "refund": { "id":…, "consumer_id":…, "amount":…, "payment_type":"wallet", "status":"pending", "reason":"Wallet full refund request", "quantity":1, "order_id":null, "product_id":null, … } }`
- **Errors:** 400 `{ "message": "Wallet balance is zero" }`; 400 "The wallet balance is not sufficient for this refund request.".

### GET /points/consumer
- **Auth:** yes (consumer role has `point.index`). Same query params as the wallet (`paginate`, `search`, `start_date`, `end_date`; omit `consumer_id`).
- **Response 200:** `{ "id", "consumer_id", "balance": 120, "transactions": { paginator of {id, point_id, order_id, detail, amount, type, from, created_at} } }`. `balance` is in **points**; convert to currency with the setting `wallet_points.point_currency_ratio` (points per 1 currency unit; `/checkout` already returns the converted `points_amount`). Reward points are credited when an order reaches `delivered`/`collected`. Error 405 when the points feature is off.
- Staff-only: `POST /credit/points`, `POST /debit/points`.

---

## Part G. Vouchers (gift cards)

Gift vouchers are products with `is_gift_card = true`. They must be bought alone (cart/checkout reject mixing, wallet and points payments, and shipping is skipped). When the order is paid the server generates one voucher per unit (code format `XXXX-XXXX-XXXX`) and emails the codes. Redeeming a voucher adds its amount to the wallet's **non-cashable** balance (in the voucher's own currency, no conversion).

### POST /vouchers/check
- **Auth:** yes. **Body:** `{ "code": "ABCD-EFGH-JKLM" }` (`required|string`).
- **Response 200:**
```json
{ "success": true, "message": "Voucher is valid and ready to be redeemed.", "data": { "voucher": { "id": 5, "code": "ABCD-EFGH-JKLM", "amount": "25.00", "currency_code": "USD", "status": "active", "expires_at": null, "redeemed_at": null, "…": "…" } } }
```
When not valid the same shape is returned with `success: false` and a message (`Invalid voucher code.` -> `data: null`; `This voucher has already been redeemed.`; `This voucher has expired.`; `This voucher is not active.`).

### POST /vouchers/redeem
- **Auth:** yes. **Body:** `{ "code": "…" }`.
- **Response 200:** `{ "success": true, "message": "Voucher redeemed successfully! USD 25.00 has been added to your wallet.", "data": { "voucher": {…}, "wallet_balance": 14.5 } }`. Note `wallet_balance` is only the cashable `balance`, not including the newly added non-cashable credit; re-fetch `GET /wallet/consumer/self` for the true spendable total.
- **Errors (HTTP 400, `{success:false,message}`):** `Invalid voucher code.`, `This voucher has already been redeemed.`, `This voucher has expired.`, `This voucher cannot be redeemed.`. Missing `code` -> Laravel 422 `{message, errors}` (the controller catches it and returns 400 with the message).

### GET /vouchers/my-vouchers
- **Auth:** yes. **Query:** `status` (`all`, `active`, `redeemed`, `expired`; default all).
- **Response 200:** `{ "success": true, "data": { "vouchers": [ { "id", "code", "amount", "currency_code", "product_id", "order_id", "status", "redeemed_at", "expires_at", "created_at", "product": { "id","name","price","is_gift_card" } } ] } }` (vouchers you **purchased**, newest first, not paginated).

### GET /vouchers/redeemed
- **Auth:** yes. **Response 200:** `{ "success": true, "data": { "vouchers": [ voucher + product + purchased_by ] } }` (vouchers **you redeemed**, newest first).

### POST /vouchers/{voucherId}/resend-email
- **Auth:** yes. No body. Emails all voucher codes from the same order to your account email.
- **Response 200:** `{ "success": true, "message": "Voucher codes have been sent to your email: user@example.com" }`; 404 `{ "success": false, "message": "Voucher not found or you do not have permission to access it" }`.

### GET /vouchers/wallet-balance and GET /vouchers/{id}
Routes exist but the controller methods (`walletBalance`, `show`) are **not implemented**, so both fail with a server error. Do not use them: use `GET /wallet/consumer/self` for the balance and `GET /vouchers/my-vouchers` for details.

---

## Part H. Refunds and returns

### GET /refund
- **Auth:** yes (`refund.index`; consumer has it). Returns the caller's refund requests (vendors see their store's, admins all).
- **Query:** `paginate` (default all), `page`, `search` (user name/email, store name, order number).
- **Response 200:** paginator; item fields: `id, consumer_id, store_id, order_id, product_id, variation_id, quantity, amount, reason, payment_type, status (pending|approved|rejected|completed), is_used, refund_image_id, created_at, return_request` (appended) plus relations `user`, `store`, `order{id,order_number,currency_symbol}`, `product{id,name,sku,product_thumbnail}`, `refund_image`.

### POST /refund
- **Auth:** yes (`refund.create`).
- **Body:**

| Field | Type | Req | Notes |
|---|---|---|---|
| `order_id` | int | yes (in practice) | order **id** (not order number). Not in the validation rules but read by the repository (missing -> 404 style error) |
| `product_id` | int | yes | exists; must be in that order |
| `reason` | string | yes | |
| `payment_type` | string | yes | `in:paypal,bank,wallet,yoco,payfast,pese,dpo_zambia`. Anything except `wallet` requires a saved payout account (`/paymentAccount`) else 400 "Kindly create a payment account before claiming your refund." |
| `refund_image_id` | int | no | attachment id (upload via the attachment endpoint) |

```json
{ "order_id": 4412, "product_id": 1425296, "reason": "Arrived damaged", "payment_type": "bank", "refund_image_id": 880 }
```
- **Eligibility (all enforced; failures return 400 with these messages):** refunds enabled in settings (else "The refund feature is currently not enabled."); product `is_return` true ("Refunds are not allowed for this product."); order paid (`COMPLETED`/`COMPLETE`/`Success`) **and** status `delivered` or `collected` ("Refund possible for completed payment and delivered order."); within `settings.refund.refundable_days` of delivery ("Refund are not possible after N days from delivery."); no earlier request for the same consumer/product/order ("A refund request for this product has already been submitted.").
- **Behaviour:** refund `amount` = the line `subtotal`, `quantity` = line quantity (cannot be partial). The line `pivot.refund_status` becomes `pending`. Unverified/suspect: with `payment_type: wallet` the server **debits** the wallet `balance` by the refund amount at request time (credited back if staff reject). Prefer `bank`/gateway payout types unless the backend confirms.
- **Response 200:** the refund object (fields above, `status: "pending"`).
- **Other verbs:** `PUT /refund/{id}` needs `refund.action` (staff approve/reject: body `status` required `pending|approved|rejected`, optional `reason`, `payment_type`); `GET /refund/{id}` and `DELETE /refund/{id}` are stubs (no body).

### GET /returns
- **Auth:** yes. Consumers see their own return requests; users with `return.index` or admin role see all.
- **Query:** `order_id` (filter), `paginate` (default 20), `page`.
- **Response 200:** paginator of
```json
{
  "id": 14, "user_id": 77, "order_id": 4412, "product_id": 1425296,
  "return_reason": "Defective item", "sub_reason": "Does not turn on", "description": "…",
  "preferred_outcome": "refund", "product_not_used": true, "in_original_packaging": true, "include_all_accessories": true,
  "status": "pending", "rejection_reason": null, "created_at": "…", "updated_at": "…",
  "order": { "id": 4412, "order_number": 1055, "payment_method": "payfast", "payment_status": "COMPLETED", "amount": 70.7, "shipping_total": 5, "delivery_price": 10, "points_amount": 0, "wallet_balance": 0, "total": 85.7, "currency": "USD", "currency_symbol": "$", "exchange_rate": 1, "delivery_description": "…", "created_at": "…", "order_status": {"id":6,"name":"delivered"}, "products": [ … ] },
  "product": { "id": 1425296, "name": "…", "sku": "…", "product_thumbnail_id": 55, "price": 39.28, "product_thumbnail": {…} },
  "user": { "id": 77, "name": "…", "email": "…", "phone": "…", "country_code": "…", "payment_account": {…} },
  "order_item": { "product_id": 1425296, "variation_id": null, "quantity": 2, "single_price": 39.28, "shipping_cost": 5, "subtotal": 78.56 }
}
```

### POST /returns
- **Auth:** yes. **Body (JSON):** all required except `sub_reason`.

| Field | Type | Validation |
|---|---|---|
| `order_id` | int | `required\|exists:orders,id` (order **id**, not number) |
| `product_id` | int | `required\|exists:products,id` |
| `return_reason` | string | required |
| `sub_reason` | string | nullable |
| `description` | string | required |
| `preferred_outcome` | string | required, `refund` \| `replacement` \| `credit` |
| `product_not_used` | bool | required |
| `in_original_packaging` | bool | required |
| `include_all_accessories` | bool | required |

```json
{ "order_id": 4412, "product_id": 1425296, "return_reason": "Defective item", "sub_reason": "Does not turn on", "description": "Stopped working after 2 days", "preferred_outcome": "refund", "product_not_used": true, "in_original_packaging": true, "include_all_accessories": true }
```
- **Response 201:** the created row (`id, user_id, order_id, product_id, …, status: "pending", created_at, updated_at`). 409 `{ "message": "Return already submitted for this item" }` for a repeat of the same order/product. 422 Laravel validation body. The server does not check that the order belongs to the caller or is delivered: validate in the app (only offer returns for your own delivered orders).
- `PUT /returns/{id}` is the staff approve/reject action (`status` `approved|rejected|pending`, optional `rejection_reason`; approval credits the wallet for `credit` or opens a refund for `refund`) and has no authorisation check: never call it from the app. `GET /returns/{id}` and `DELETE /returns/{id}` are empty stubs.
- Outcome emails/notifications are sent server-side; poll `GET /returns` for status.

---

## Part I. Support tickets  `/tickets`

Customer-facing helpdesk. Vendor accounts get 403 ("Access denied. Please use the vendor dashboard for support."). Every response is `{ "success": bool, ... }`. Non-admins can only see/modify their own tickets and never see internal (`is_internal`) messages.

Enumerations: `status`: `open, in_progress, waiting_customer, waiting_admin, resolved, closed`. `priority`: `low, medium, high, urgent`. `category`: `general, technical, billing, account, order, other`.

### GET /tickets
- **Query (all optional):** `status` (`open` = open/in_progress/waiting_*; `closed` = resolved/closed; or an exact status), `priority`, `category`, `search` (ticket number, subject, description LIKE), `sort_by` (default `created_at`), `sort_order` (default `desc`), `per_page` (default 15), `page`.
- **Response 200:**
```json
{
  "success": true,
  "tickets": {
    "current_page": 1,
    "data": [
      { "id": 21, "ticket_number": "TKT-AB1-20261124-4821", "user_id": 77, "subject": "Where is my order?", "description": "…",
        "priority": "medium", "status": "open", "category": "order", "assigned_to": null,
        "resolved_at": null, "closed_at": null, "unread_count": 0, "created_at": "…", "updated_at": "…",
        "user": {…}, "assigned_to": null, "latest_message": { "id": 40, "ticket_id": 21, "user_id": 77, "message": "…", "is_internal": false, "attachments": null, "user": {…}, "created_at": "…" } }
    ],
    "total": 1, "per_page": 15, "last_page": 1, "…": "paginator keys"
  }
}
```
(`assigned_to` relation vs column naming is **unverified**; read the foreign key from `assigned_to` and the relation from `assigned_to` / `assignedTo`.)

### POST /tickets
- **Body:** `subject` (required string, max 255), `description` (required string), `priority` (optional, enum above, default `medium`), `category` (optional, enum above, default `general`).
- **Response 201:** `{ "success": true, "message": "Ticket created successfully", "ticket": { …ticket, "user": {…}, "messages": [ first message = description ] } }`. 422 `{ "success": false, "message": "Validation error", "errors": {…} }`.

### GET /tickets/{id}
`{ "success": true, "ticket": { …, "user", "assigned_to"/relation, "messages": [ { id, ticket_id, user_id, message, is_internal:false, attachments, user:{…}, created_at } ] } }` (messages ascending). 404 `Ticket not found`, 403 `Unauthorized` for someone else's ticket.

### PUT /tickets/{id}
Owner may change `subject`, `description`, `priority`, `category` (same validation as create, all optional). `status`/`assigned_to` are honoured only for admins. Response `{ "success": true, "message": "Ticket updated successfully", "ticket": {…} }`.

### POST /tickets/{id}/messages
- **Body:** `message` (required string); `is_internal` is ignored for customers. No attachment upload (the `attachments` column exists but the endpoint does not accept files).
- **Response 201:** `{ "success": true, "message": "Message added successfully", "ticket_message": { id, ticket_id, user_id, message, is_internal, user, created_at } }`. A customer reply moves a `waiting_customer`/`resolved` ticket to `waiting_admin`; staff are emailed.

### POST /tickets/{id}/close  and  POST /tickets/{id}/reopen
No body. `close` -> status `closed`, sets `closed_at`. `reopen` only works from `closed` or `resolved` (else 400 `{ "success": false, "message": "Ticket cannot be reopened" }`) and sets status `open`. Response `{ "success": true, "message": "Ticket closed successfully" | "Ticket reopened successfully", "ticket": {…} }`.

### DELETE /tickets/{id}  and  GET /tickets/statistics
Admin only (403 `Unauthorized` for customers).

---

## Part J. Layby (installment purchase)

Rules from code and `config/layby.php` / layby settings (admin-editable via `getLaybySetting`): a product is layby-eligible when its USD-equivalent price is at least **100** (the config says 300 and the apply error text says "$300", but the check in `LaybyController` compares to 100; unverified which is intended), the product is not `sa_only` / `is_layby_disabled`, and the user is logged in. Deposit percentage defaults to 30% (regular and sale products, per setting). Regular products: durations come from setting `regular_products_duration_months` (default `6`, comma list allowed); products currently on sale: only the single `sale_products_duration_months` (default 3). One active application per product (and per variation when given). Currency conversion uses the server session defaults (`session('currency')` falls back to the app default and rate 1 for token clients, **unverified for mobile**), so layby amounts are effectively in the store base currency (USD).

Application `status` values: `pending, under_review, awaiting_documents, approved, active, completed, rejected, cancelled` (staff approve; payments are only accepted in `approved` / `active`; `completed` when the balance reaches 0, after which the server creates a real order and links it as `order_id`).

### POST /layby/check-eligibility  (public, no auth)
- **Body:** `{ "product_id": 123, "variation_id": 456 }` (`product_id` required exists; `variation_id` nullable exists).
- **Response 200:**
```json
{ "eligible": true, "price": 500, "price_usd": 500, "currency": "USD", "threshold": 100, "is_sale_product": false, "deposit_percentage": 30, "available_durations": [6] }
```
Note: the field is `available_durations` (array of months), `eligible` is a boolean, and an ineligible product is still HTTP 200 with `eligible: false` (no reasons array). Unknown ids -> 422 Laravel validation body.

### GET /layby/check-existing?product_id=&variation_id=
- **Auth:** yes. **Response 200:** `{ "has_existing": true, "application_id": 55, "status": "pending" }` (`false`/`null` otherwise). Considers statuses `pending, under_review, approved, active, awaiting_documents`.

### POST /layby/documents/upload-chunk  (multipart, repeat per chunk)
- **Auth:** yes. **multipart/form-data fields:**

| Field | Type | Validation |
|---|---|---|
| `uploadId` | string | required, max 100; choose a unique id per file, only `[a-zA-Z0-9_-]` survive (e.g. `doc_1734432000_ab12`) |
| `fileName` | string | required, max 255 |
| `chunkIndex` | int | required, >= 0 (0-based) |
| `totalChunks` | int | required, >= 1 |
| `chunk` | file | required, max 1024 KB per chunk (send <= 512 KB to be safe) |

- **Response 200:** `{ "success": true, "received": 0, "total": 3 }`. Chunks are stored on disk keyed by `uploadId`. A small ID photo can be sent as one chunk (`chunkIndex=0`, `totalChunks=1`), which is how the web app does it.

### POST /layby/documents/upload-complete
- **Auth:** yes. **Body (JSON):** `{ "uploadId": "doc_1734432000_ab12", "fileName": "passport.jpg", "totalChunks": 3 }` (all required).
- **Behaviour:** assembles the chunks, checks the MIME type (jpeg, png, gif, webp, pdf only), uploads to the media service.
- **Response 200:** `{ "success": true, "attachment": { "id": "<uuid>", "uuid": "<uuid>", "url": "https://…" }, "message": "Document uploaded successfully" }`. Use `attachment.id` (a UUID string) as `id_document_attachment_id`.
- **Failures are mostly HTTP 200 or 400 with `success: false`:** `"Upload session not found"` (200), `"Missing chunk N"` (400), `"Invalid file type. Only images and PDFs are allowed."` (400), `"Failed to upload document. Please try again or contact support."` (500). Always check `success`.

### GET /layby/uploaded-documents
- **Auth:** yes. **Response 200:** `{ "success": true, "documents": [ { "id", "attachment_id", "type", "number", "url", "uploaded_at": "Dec 17, 2025" } ] }` (documents from the user's earlier applications, for reuse).

### POST /layby/apply
- **Auth:** yes. **Body:** JSON, or multipart if sending a raw `id_document` file. (`selected_attribute_ids` may be a JSON string when using multipart.)

| Field | Type | Req | Validation |
|---|---|---|---|
| `product_id` | int | yes | exists |
| `variation_id` | int\|null | no | exists |
| `selected_attribute_ids` | int[] | no | array |
| `variation_display_name` | string | no | |
| `duration_months` | int | yes | min 1. Must equal the single allowed duration for sale products ("Products on sale can only have N months payment plan" 422) |
| `id_document_attachment_id` | string | no | UUID or id from `upload-complete`; invalid -> 422 `{success:false,message:"Invalid ID document attachment",errors:{id_document_attachment_id:[…]}}` |
| `id_document` | file | no | jpg/jpeg/png/pdf, max 5120 KB (legacy direct upload) |
| `id_document_type` | string | no | `passport` \| `id_card` \| `drivers_license` |
| `id_document_number` | string | no | max 50 |

The ID document is optional at apply time and can be added later with `PUT /layby/applications/{id}/document`.
```json
{ "product_id": 123, "variation_id": null, "duration_months": 6, "id_document_attachment_id": "550e8400-e29b-41d4-a716-446655440000", "id_document_type": "passport", "id_document_number": "AB123456" }
```
- **Response 201:** `{ "success": true, "message": "Layby application submitted successfully. We will review and get back to you shortly.", "application": { "id", "application_number": "LB-65F1A2B3C4D5E", "user_id", "product_id", "variation_id", "product_name", "product_price", "currency", "currency_symbol", "exchange_rate", "duration_months", "deposit_amount", "monthly_amount", "total_amount", "total_paid", "balance_remaining", "status": "pending", "id_document_*", "created_at", "product": {…} } }`. Pricing: `deposit = price * deposit% / 100`, `monthly = (price - deposit) / duration_months`, `total = deposit + monthly * duration`.
- **Errors:** 422 `{ "success": false, "message": "You already have a pending layby application for this item. Please check your existing application.", "existing_application": { "id", "reference_number", "status" } }`; 422 `{ "message": "Layby is only available for products above $300" }` (price check); 422 `{ "message": "Layby is not available for this product" }`; 500 `{ "message": "Failed to submit application" }`.

### GET /layby/my-applications
- **Auth:** yes. Paginator, 10 per page (`page` param; `paginate` ignored). Each item is an application with `product` (+`product_thumbnail`), `variation`, `payments[]`.

### GET /layby/applications/{id}
- **Auth:** yes (own applications only, else 404). Response: the application (all fields above) with `product.product_thumbnail`, `variation`, `order.orderStatus` (when completed), and `payments[]` newest first.
```json
{ "id": 55, "application_number": "LB-65F1A2B3C4D5E", "status": "active", "total_amount": "500.00", "total_paid": "150.00", "balance_remaining": "350.00", "deposit_amount": "150.00", "monthly_amount": "58.33", "duration_months": 6, "order_id": null,
  "payments": [ { "id": 9, "payment_number": "…", "amount": "150.00", "currency": "USD", "payment_method": "payfast", "payment_status": "completed", "paid_at": "…", "gateway_reference": "LAYBY_PAYMENT:9|APPLICATION:55", "payment_meta": { "original_amount": 150, "original_currency": "USD", "zar_amount": 2700, "to_usd_rate": 1, "to_zar_rate": 18 } } ] }
```
Payment `payment_status` enum: `pending, completed, failed, refunded` (lowercase).

### PUT /layby/applications/{id}/document
- **Auth:** yes. **Body:** `id_document_attachment_id` (required string: attachment id or UUID), `id_document_type` (required `passport|id_card|drivers_license`), `id_document_number` (required, max 50).
- **Response 200:** `{ "success": true, "message": "Document updated successfully", "application": {…} }`; 422 `{ success:false, message:"Invalid ID document attachment", errors }`.

### POST /layby/applications/{id}/payment
- **Auth:** yes. Application must be `approved` or `active` (else 422 `{ "message": "Cannot make payment for this application" }`).
- **Body:**

| Field | Type | Req | Notes |
|---|---|---|---|
| `amount` | number | yes | `numeric\|min:0.1`, in the currency given by `currency` |
| `payment_method` | string | yes | supported: `payfast`, `pdo_zambia`, `pese`, `cod`, `bank_transfer`. Anything else (incl. `yoco`, `paypal`) -> 500 "Payment processing failed: Unsupported payment method: …" |
| `currency` | string(3) | no | ISO code of `amount` (default `USD`); converted to USD for storage and ZAR for PayFast |

```json
{ "amount": 58.33, "payment_method": "payfast", "currency": "USD" }
```
- **Response 200:** `{ "success": true, "message": "Payment initiated", "payment": { "id": 10, "amount": "58.33", "currency": "USD", "payment_method": "payfast", "payment_status": "pending", "payment_meta": {…}, "gateway_reference": "LAYBY_PAYMENT:10|APPLICATION:55", … }, "redirect_url": "https://…" }`. `redirect_url` is `null` for `cod` / `bank_transfer` (the payment stays `pending` until staff capture it). Otherwise open `redirect_url` in a WebView.
- **Errors:** 422 `{ "message": "Payment amount exceeds balance" }` (compares the USD equivalent to `balance_remaining`); 500 `{ "message": "Payment processing failed: …" }`; 404 for an application that is not yours.
- **Completion:** the gateway webhook credits the payment (`payment_status: completed`, `total_paid` up, `balance_remaining` down, status -> `active`, then `completed` at zero balance, which also creates the order). There is no layby `verifyPayment`: poll `GET /layby/applications/{id}` (every ~3 s, up to ~2 min) until the new payment's `payment_status` is `completed` or `failed`. The return/cancel URLs for layby gateways are built from the server's `FRONTEND_URL` (`…/en/account/laybys/{id}?payment=success|failed&payment_id={paymentId}`), not from the app: expect the WebView to end on the website; detect the URL pattern `/account/laybys/{id}` and close the WebView.
- Behind the scenes `pese` and `pdo_zambia` create a temporary order (note `TEMP_LAYBY_PAYMENT:{paymentId}`) hidden from `/order` lists; PayFast sends the payment id in `custom_str1=LAYBY_PAYMENT`.

### GET /api/layby-files/{path}
Streams uploaded layby documents (public route; `path` like `layby_documents/2026/03/06/uuid.pdf`). Not normally needed.

---

## Part K. End-to-end "place an order" sequence (mobile)

1. **Pre-checks (cached):** `GET /settings` (enabled `payment_methods[]`, `general.min_order_amount`, `general.min_order_free_shipping`, wallet/points ratio) and `GET /orderStatus`.
2. **Addresses:** the user must have at least one address (`GET /address`; create with `POST /address`); choose `billing_address_id` and `shipping_address_id`.
3. **Cart:** keep a local cart (product id, variation id, delivery option id, quantity, optional `item_shipping_method`). If you also mirror to the server: `POST /cart` for additions (delta only), `PUT /replace/cart` for "set quantity", `DELETE /cart/{id}`, and on first login do a one-time `POST /sync/cart` of the guest cart then clear it locally.
4. **Preview totals:** `POST /checkout` with `products[]`, both address ids, the chosen `payment_method`, `coupon` (if any), `wallet_balance` / `points_amount` toggles, `delivery_price`. Render `total.sub_total, shipping_total, fast_shipping_total, tax_total, coupon_total_discount, delivery_price, convert_point_amount, convert_wallet_balance, total`. Re-call on every change. Handle `400/422` messages inline (out of stock, minimum order, coupon).
5. **Choose payment method:** show the enabled list. If `total.total == 0` after wallet/points, use `wallet`; otherwise any enabled gateway (`cod`/`bank_transfer` need no redirect).
6. **Place order:** `POST /order` with the same body plus `delivery_description`, `note`, `currency`, `currency_symbol`, `exchange_rate`, and `return_url` / `cancel_url` (https bases you control). On success the server has already cleared the server cart: clear the local cart too (or keep until the payment result for redirect gateways if you want "back to cart on cancel", but do not re-post).
7. **Branch on the response:**
   - has `url` / `is_redirect: true` -> open in a WebView, wait for the return/cancel URL, close it.
   - full order object (`cod`, `bank_transfer`) -> show confirmation; for bank transfer show the bank details and the order number as the payment reference.
   - `payment_method: "wallet"` slim body -> show confirmation (payment already `COMPLETED`).
8. **Confirm payment (gateways):** poll `GET /verifyPayment/{order_number}` as described in Part D; success -> confirmation screen, failure -> offer `POST /rePayment` (same order, optionally another method).
9. **After placing:** `GET /order/{order_number}` for the receipt; `GET /order?paginate=10&page=1` for history; `GET /trackOrder/{order_number}` or the same detail for status; item-level tracking via `products[].pivot.item_status` / `eta`.
10. **Failure recovery:** if `POST /order` returns an error after the user's wallet/cart changed (message starts with `Order placement failed: Payment creation failed`), call `GET /order?paginate=5` and use the newest `pending` order with `POST /rePayment` rather than re-submitting.

---

## Part L. Server-side issues the backend team should know about (observed while reading the code)

These affect what the app can safely rely on. Verify before launch.

1. `PUT /order/{order}`, `PUT /crm-orders/{order}`, `PUT /order/{order_number}/item-status`, `PUT /returns/{id}` have no authorisation (the order resource policy excludes `update`; returns have none). Any logged-in customer could change order/return status. `item-status` with `out_of_stock` also auto-credits the wallet.
2. `GET /wallet/consumer/self` and `GET /points/consumer` honour a client-supplied `consumer_id` (another user's wallet/points transactions are readable).
3. `/order-notes` has no ownership/privacy check.
4. `POST /order`: client can supply `consumer_id` (consumer role is only validated as "an existing user"), `order_status_id`, and for `yoco` the totals (`grand_total`, `sub_total`, `shipping_total`). `delivery_price`, `has_fast_shipping`+`fast_shipping_cost`, and `tax_total` are client-trusted amounts.
5. Delivery fee appears to be charged twice at gateways (`order.total` already contains `delivery_price`, gateways add it again).
6. `payment_method: "wallet"` completes an order even if a balance remains.
7. `GET /order/{n}` / `GET /verifyPayment/{n}` mutate state (PayPal capture, DPO marks unapproved as `FAILED`).
8. Web client sends `coupon_code`; the API reads `coupon`. Coupon `usage_per_customer` check passes arguments to `getCountUsedPerConsumer` in swapped order.
9. `/vouchers/wallet-balance` and `/vouchers/{id}` point at missing controller methods.
10. Error HTTP statuses: validation/ExceptionHandler errors may surface as 500 (see section 0).
