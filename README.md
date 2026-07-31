# KachaBazar — Store Frontend

Customer-facing eCommerce storefront built with **Next.js** and Tailwind CSS. Connects to the shared **Backend API**.

Use this package with:

- **KachaBazar Store + Backend** only, or
- Full **KachaBazar** stack (Admin + Backend + Store)

## Requirements

- Node.js **v20.x (LTS)**
- Running Backend API (see `backend/README.md`)

## Tech Stack

- Next.js (App Router)
- Tailwind CSS
- NextAuth (credentials, OTP, social login)
- React Query
- Stripe / RazorPay (optional)
- PWA support

## Getting Started

```bash
cd store
npm install
cp .env.example .env.local
```

### Configure `.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5055/v1
NEXT_PUBLIC_STORE_URL=http://localhost:3000

# SSR / server-side API (usually same as public in local)
NEXT_SERVER_API_BASE_URL=http://localhost:5055/v1

# MUST match backend INTERNAL_API_KEY
# Generate: openssl rand -hex 32
NEXT_SERVER_INTERNAL_API_KEY=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# Stripe publishable key (optional)
NEXT_PUBLIC_STRIPE_KEY=pk_test_xxxxxxxxxxxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
# Generate: openssl rand -base64 32
NEXTAUTH_SECRET=...

# Optional social (client IDs; secrets often loaded from Admin Store Settings)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_FACEBOOK_ID=
NEXT_PUBLIC_GITHUB_ID=

# Optional
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | Backend URL ending with `/v1` |
| `NEXT_PUBLIC_STORE_URL` | Yes | This storefront URL |
| `NEXT_SERVER_API_BASE_URL` | Yes | Server-side API URL |
| `NEXT_SERVER_INTERNAL_API_KEY` | Yes | Same as backend `INTERNAL_API_KEY` |
| `NEXT_PUBLIC_CLOUDINARY_*` | Yes | Image upload |
| `NEXTAUTH_URL` | Yes | Store URL for auth callbacks |
| `NEXTAUTH_SECRET` | Yes | NextAuth encryption secret |
| `NEXT_PUBLIC_STRIPE_KEY` | No | Stripe publishable key |
| Social / Pixel IDs | No | Optional integrations |

### Run

```bash
npm run dev     # → http://localhost:3000
npm run build
npm start
```

Start the **backend first**, then the store.

## Features

- Multi-layout storefront (default, modern, clothing, electronic)
- Email/password, email OTP, phone OTP, Google / Facebook / GitHub login
- Guest checkout + public order tracking (`/track`)
- Product variants, campaigns, flash sale, offers
- Cart, checkout, invoices, reviews
- Dynamic translation for catalog content

## Production Tips

- Set `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_STORE_URL`, and `NEXTAUTH_URL` to live HTTPS URLs
- Update OAuth redirect URLs for Google / GitHub / Facebook to your live domain
- Deploy order: **Backend → Admin (if any) → Store**

## Support

Questions or setup help: **aislam270@gmail.com**
