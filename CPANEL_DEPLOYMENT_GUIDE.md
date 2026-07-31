# KachaBazar — cPanel Deployment Guide for kachabazar.com

> **Stack:** Backend (Node.js/Express) · Admin (Vite + React SPA) · Store (Next.js)  
> **Domain:** `kachabazar.com`

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Domain / Subdomain Planning](#2-domain--subdomain-planning)
3. [Deploy the Backend (Node.js API)](#3-deploy-the-backend-nodejs-api)
4. [Deploy the Admin Dashboard (Vite React SPA)](#4-deploy-the-admin-dashboard-vite-react-spa)
5. [Deploy the Store (Next.js)](#5-deploy-the-store-nextjs)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [SSL / HTTPS Setup](#7-ssl--https-setup)
8. [Common Issues & Troubleshooting](#8-common-issues--troubleshooting)

---

## 1. Prerequisites

Before you begin, make sure you have:

| Requirement | Details |
|-------------|---------|
| **cPanel hosting** | Must support **Node.js** (look for "Setup Node.js App" in cPanel). Most shared hosts with CloudLinux + cPanel have this. |
| **SSH access or cPanel Terminal** | Go to **cPanel → Advanced → Terminal** (or SSH via `ssh yourusername@kachabazar.com`). |
| **MongoDB database** | Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier available). cPanel does NOT include MongoDB. |
| **Node.js 18+** | Select Node.js v18 or v20 when creating the app in cPanel. |
| **Domain** | `kachabazar.com` (your main domain). |

---

## 2. Domain / Subdomain Planning

You will use **3 domains/subdomains**:

| App | Domain | Document Root | Type |
|-----|--------|---------------|------|
| **Store (Frontend)** | `kachabazar.com` | `/home/YOURUSERNAME/public_html` | Next.js (Node.js app) |
| **Backend API** | `api.kachabazar.com` | `/home/YOURUSERNAME/api.kachabazar.com` | Express (Node.js app) |
| **Admin Dashboard** | `admin.kachabazar.com` | `/home/YOURUSERNAME/admin.kachabazar.com` | Static files (no Node.js needed) |

> 📝 Replace `YOURUSERNAME` with your actual cPanel username (e.g., `amdaniex`). Find it at cPanel top-right, or run `whoami` in the Terminal.

### How to create the subdomains:

1. Log in to **cPanel**
2. Go to **Domains** → **Create A New Domain** (or **Subdomains** on older cPanel)
3. Create **`api.kachabazar.com`**
   - Document Root: `api.kachabazar.com`
4. Create **`admin.kachabazar.com`**
   - Document Root: `admin.kachabazar.com`
5. The main domain `kachabazar.com` already exists → it uses `public_html`

---

## 3. Deploy the Backend (Node.js API)

### Step 3.1 — Upload Backend Files

1. On your **local machine**, go to the `backend/` folder
2. **Delete** `node_modules/` folder if it exists (do NOT upload it)
3. **Delete** `.env` file (you'll create a new one on the server)
4. Compress the `backend/` folder into a **`.zip`** file
5. In **cPanel → File Manager**, navigate to: `/home/YOURUSERNAME/api.kachabazar.com/`
6. **Upload** the `.zip` file
7. **Extract** the zip file
8. **Move all files** from the extracted `backend/` subfolder into the root so the structure is:

```
/home/YOURUSERNAME/api.kachabazar.com/
├── api/
│   └── index.js          ← startup file
├── config/
│   ├── auth.js
│   └── db.js
├── controller/
├── lib/
├── models/
├── routes/
├── script/
├── utils/
├── package.json
└── .env                  ← you will create this next
```

> ⚠️ Make sure `package.json` and the `api/` folder are at the **root** of `api.kachabazar.com/`, NOT inside a subfolder.

### Step 3.2 — Create the `.env` File

In **cPanel → File Manager**, create a new file named `.env` inside `api.kachabazar.com/`:

```env
# ========== SERVER ==========
PORT=5000
NODE_ENV=production

# ========== DATABASE ==========
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/YOUR_DB_NAME?retryWrites=true&w=majority

# ========== JWT / AUTH ==========
JWT_SECRET=your_jwt_secret_key_here
JWT_ACCESS_LIFETIME=15m
JWT_SECRET_FOR_VERIFY=your_verify_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_LIFETIME=7d
ENCRYPT_PASSWORD=your_32_character_hex_key_here

# ========== EMAIL (SMTP) ==========
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# ========== URLS ==========
STORE_URL=https://kachabazar.com
ADMIN_URL=https://admin.kachabazar.com

# ========== STRIPE (Optional) ==========
STRIPE_KEY=sk_live_xxxxxxxxxxxx
MAX_AMOUNT=5000
MIN_AMOUNT=1
STRIPE_PAYMENT_DESCRIPTION=kachabazar Payment
CURRENCY=usd

# ========== SMS (Optional) ==========
SMS_PROVIDER=mock
APP_NAME=kachabazar
```

> ⚠️ Replace ALL placeholder values with your actual credentials.

### Step 3.3 — Setup Node.js App in cPanel

1. Go to **cPanel → Setup Node.js App**
2. Click **"Create Application"**
3. Fill in:

| Field | Value |
|-------|-------|
| **Node.js version** | `18` or `20` (latest available) |
| **Application mode** | `Production` |
| **Application root** | `api.kachabazar.com` |
| **Application URL** | Select `kachabazar.com` dropdown → type `api.kachabazar` |
| **Application startup file** | `api/index.js` |

4. Click **"Create"**
5. At the top you'll see a command like:
   ```
   source /home/YOURUSERNAME/nodevenv/api.kachabazar.com/18/bin/activate
   ```
   **Copy this command.**

### Step 3.4 — Install Dependencies

Go to **cPanel → Advanced → Terminal** and run:

```bash
source /home/YOURUSERNAME/nodevenv/api.kachabazar.com/18/bin/activate
cd /home/YOURUSERNAME/api.kachabazar.com
npm install --production
```

### Step 3.5 — Verify `.htaccess` Has Passenger Config

This is **critical**. Run in the Terminal:

```bash
cat /home/YOURUSERNAME/api.kachabazar.com/.htaccess
```

It **must** contain Passenger lines like:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/YOURUSERNAME/api.kachabazar.com"
PassengerBaseURI "/"
PassengerNodejs "/home/YOURUSERNAME/nodevenv/api.kachabazar.com/18/bin/node"
PassengerAppType node
PassengerStartupFile api/index.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

If these lines are **missing**, cPanel didn't auto-generate them. Create the file:

```bash
cat > /home/YOURUSERNAME/api.kachabazar.com/.htaccess << 'EOF'
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/YOURUSERNAME/api.kachabazar.com"
PassengerBaseURI "/"
PassengerNodejs "/home/YOURUSERNAME/nodevenv/api.kachabazar.com/18/bin/node"
PassengerAppType node
PassengerStartupFile api/index.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
EOF
```

> ⚠️ Replace `YOURUSERNAME` with your actual cPanel username in the command above.

### Step 3.6 — Restart & Test

1. Go to **cPanel → Setup Node.js App** → click **"Restart"**
2. Visit: **https://api.kachabazar.com**
3. You should see: **"App works properly!"**
4. Test an API endpoint: **https://api.kachabazar.com/v1/products/**

If you see a JSON response, your backend is live! 🎉

### If it doesn't work — check logs:

```bash
cat /home/YOURUSERNAME/api.kachabazar.com/stderr.log
```

### (Optional) Seed the database:

```bash
source /home/YOURUSERNAME/nodevenv/api.kachabazar.com/18/bin/activate
cd /home/YOURUSERNAME/api.kachabazar.com
npm run data:import
```

---

## 4. Deploy the Admin Dashboard (Vite React SPA)

The admin is a **static SPA** — no Node.js app needed on the server. Just upload the built files.

### Step 4.1 — Set Environment Variables on Your Local Machine

On your **local machine**, create/update the `.env` file in the `admin/` folder:

```env
VITE_APP_API_BASE_URL=https://api.kachabazar.com/v1
VITE_APP_STORE_URL=https://kachabazar.com
VITE_APP_ADMIN_URL=https://admin.kachabazar.com
VITE_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_APP_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload
VITE_APP_ENCRYPT_PASSWORD=your_32_character_hex_key_here
VITE_APP_DEMO=false
```

> ⚠️ `VITE_APP_ENCRYPT_PASSWORD` must match the backend's `ENCRYPT_PASSWORD`.

### Step 4.2 — Build the Admin Locally

```bash
cd admin
npm install
npm run build
```

This creates a `build/` folder with static files.

### Step 4.3 — Upload Build Files to cPanel

1. Compress the `build/` folder into a `.zip`
2. In **cPanel → File Manager**, go to: `/home/YOURUSERNAME/admin.kachabazar.com/`
3. Upload the `.zip` file
4. Extract it
5. **Move all files** from the `build/` subfolder into the root:

```
/home/YOURUSERNAME/admin.kachabazar.com/
├── index.html              ← must be here at root
├── manifest.webmanifest
├── robots.txt
├── sw.js
├── @/
│   └── assets/
│       ├── *.js
│       └── *.css
└── ...
```

### Step 4.4 — Create `.htaccess` for SPA Routing

Create a `.htaccess` file in `admin.kachabazar.com/` via File Manager or Terminal:

```bash
cat > /home/YOURUSERNAME/admin.kachabazar.com/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # If the request is not for an existing file
  RewriteCond %{REQUEST_FILENAME} !-f
  # If the request is not for an existing directory
  RewriteCond %{REQUEST_FILENAME} !-d

  # Redirect all requests to index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css
  AddOutputFilterByType DEFLATE application/javascript application/json
  AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
EOF
```

### Step 4.5 — Verify

Visit **https://admin.kachabazar.com** — you should see the admin login page! 🎉

> ⚠️ If you change any `VITE_*` environment variable later, you must **rebuild** the admin locally and re-upload. Vite embeds these at build time.

---

## 5. Deploy the Store (Next.js)

The store is a **Next.js app** that requires Node.js on the server.

### Step 5.1 — Set Environment Variables & Build Locally

On your **local machine**, create/update `.env.local` in the `store/` folder:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.kachabazar.com/v1
NEXT_PUBLIC_STORE_URL=https://kachabazar.com
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxxxxxxxxx

# NextAuth
NEXTAUTH_URL=https://kachabazar.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# Social Login (Optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_FACEBOOK_ID=
NEXT_PUBLIC_FACEBOOK_SECRET=
NEXT_PUBLIC_GITHUB_ID=
NEXT_PUBLIC_GITHUB_SECRET=

# Facebook Pixel (Optional)
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=
```

Then build:

```bash
cd store
npm install
npm run build

Make sure the build script like this
  "scripts": {
    "dev": "next dev",
     "build": "next build --webpack",
    "start": "next start",
    "lint": "next lint"
  },
```

This creates a `.next/` folder.

### Step 5.2 — Upload Store Files to cPanel

1. **Delete** `node_modules/` from the store folder (do NOT upload it)
2. Compress the **entire store folder** (including `.next/`, `package.json`, `next.config.js`, `public/`, `src/`) into a `.zip`
3. In **cPanel → File Manager**, go to: `/home/YOURUSERNAME/public_html/`
4. ⚠️ **Delete** all existing default files (like default `index.html`, `cgi-bin/`, etc.) EXCEPT `.htaccess`
5. Upload and extract the `.zip`
6. **Move all files** from the extracted subfolder into `public_html/` root:

```
/home/YOURUSERNAME/public_html/
├── .next/              ← pre-built output (IMPORTANT!)
├── public/
├── src/
├── package.json
├── next.config.js
├── server.js           ← you will create this
├── .env                ← you will create this
└── ...
```

### Step 5.3 — Create `server.js` for Passenger

Create this file in `public_html/` via File Manager or Terminal:

```bash
cat > /home/YOURUSERNAME/public_html/server.js << 'EOF'
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false;
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
EOF
```

### Step 5.4 — Create `.env` on the Server

```bash
cat > /home/YOURUSERNAME/public_html/.env << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://api.kachabazar.com/v1
NEXT_PUBLIC_STORE_URL=https://kachabazar.com
NEXT_PUBLIC_CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxxxxxxxxx
NEXTAUTH_URL=https://kachabazar.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# IMPORTANT: Server-side API URL for SSR (avoids DNS/loopback issues on cPanel)
# This must be the internal URL that the Node.js process can reach.
# Option 1: Use the same public URL (works if server can resolve its own domain)
NEXT_SERVER_API_BASE_URL=https://api.kachabazar.com/v1
# Option 2: If the above doesn't work, try using http:// instead of https://
# NEXT_SERVER_API_BASE_URL=http://api.kachabazar.com/v1
# Option 3: If still failing, add to /etc/hosts: 127.0.0.1 api.kachabazar.com
# Then use: NEXT_SERVER_API_BASE_URL=http://127.0.0.1/v1 (with Host header)
EOF
```

### Step 5.5 — Setup Node.js App in cPanel

1. Go to **cPanel → Setup Node.js App**
2. Click **"Create Application"**
3. Fill in:

| Field | Value |
|-------|-------|
| **Node.js version** | `18` or `20` |
| **Application mode** | `Production` |
| **Application root** | `public_html` |
| **Application URL** | `kachabazar.com` |
| **Application startup file** | `server.js` |

4. Click **"Create"**

### Step 5.6 — Install Dependencies

In **cPanel Terminal**:

```bash
source /home/YOURUSERNAME/nodevenv/public_html/18/bin/activate
cd /home/YOURUSERNAME/public_html
npm install --production
```

### Step 5.7 — Verify `.htaccess` Has Passenger Config

```bash
cat /home/YOURUSERNAME/public_html/.htaccess
```

It must contain:

```apache
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppRoot "/home/YOURUSERNAME/public_html"
PassengerBaseURI "/"
PassengerNodejs "/home/YOURUSERNAME/nodevenv/public_html/18/bin/node"
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END
```

If missing, add it manually (same approach as Step 3.5).

### Step 5.8 — Restart & Test

1. Go to **cPanel → Setup Node.js App** → click **"Restart"** on the store app
2. Visit: **https://kachabazar.com**
3. You should see the store homepage! 🎉

If not working:

```bash
cat /home/YOURUSERNAME/public_html/stderr.log
```

---

## 6. Environment Variables Reference

### Backend `.env` (on server: `api.kachabazar.com/.env`)

| Variable | Example Value | Required |
|----------|---------------|----------|
| `PORT` | `5000` | ✅ |
| `MONGO_URI` | `mongodb+srv://...` | ✅ |
| `JWT_SECRET` | `mysecretkey123` | ✅ |
| `JWT_ACCESS_LIFETIME` | `15m` | ✅ |
| `JWT_SECRET_FOR_VERIFY` | `verifysecret` | ✅ |
| `JWT_REFRESH_SECRET` | `refreshsecret` | ✅ |
| `JWT_REFRESH_LIFETIME` | `7d` | ✅ |
| `ENCRYPT_PASSWORD` | `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6` | ✅ |
| `EMAIL_HOST` | `smtp.gmail.com` | ✅ |
| `EMAIL_PORT` | `587` | ✅ |
| `EMAIL_USER` | `you@gmail.com` | ✅ |
| `EMAIL_PASS` | `app password` | ✅ |
| `STORE_URL` | `https://kachabazar.com` | ✅ |
| `ADMIN_URL` | `https://admin.kachabazar.com` | ✅ |
| `STRIPE_KEY` | `sk_live_...` | ❌ |
| `MAX_AMOUNT` | `5000` | ❌ |
| `MIN_AMOUNT` | `1` | ❌ |
| `CURRENCY` | `usd` | ❌ |

### Admin `.env` (local machine only — used at build time)

| Variable | Example Value | Required |
|----------|---------------|----------|
| `VITE_APP_API_BASE_URL` | `https://api.kachabazar.com/v1` | ✅ |
| `VITE_APP_STORE_URL` | `https://kachabazar.com` | ✅ |
| `VITE_APP_ADMIN_URL` | `https://admin.kachabazar.com` | ✅ |
| `VITE_APP_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | ✅ |
| `VITE_APP_CLOUDINARY_UPLOAD_PRESET` | `your_preset` | ✅ |
| `VITE_APP_CLOUDINARY_URL` | `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload` | ✅ |
| `VITE_APP_ENCRYPT_PASSWORD` | `a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6` | ✅ |
| `VITE_APP_DEMO` | `false` | ❌ |

### Store `.env` (on server: `public_html/.env`)

| Variable | Example Value | Required |
|----------|---------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.kachabazar.com/v1` | ✅ |
| `NEXT_PUBLIC_STORE_URL` | `https://kachabazar.com` | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_URL` | `https://api.cloudinary.com/v1_1/your_cloud_name/image/upload` | ✅ |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `your_preset` | ✅ |
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_live_...` | ❌ |
| `NEXTAUTH_URL` | `https://kachabazar.com` | ✅ |
| `NEXTAUTH_SECRET` | `random_string` | ✅ |

---

## 7. SSL / HTTPS Setup

1. Go to **cPanel → SSL/TLS** → **Let's Encrypt** (or **AutoSSL**)
2. Issue free SSL certificates for:
   - `kachabazar.com`
   - `api.kachabazar.com`
   - `admin.kachabazar.com`
3. Enable **"Force HTTPS"** for all three domains

> 💡 Most cPanel hosts auto-install Let's Encrypt SSL. Check **SSL/TLS Status** to verify.

---

## 8. Common Issues & Troubleshooting

### ❌ "Cannot GET /api.kachabazar.com" or similar path error

**Cause:** Missing Passenger configuration in `.htaccess`.  
**Fix:** See Step 3.5 — make sure the `.htaccess` contains the `PassengerAppRoot`, `PassengerBaseURI "/"`, etc. lines.

### ❌ Red error when clicking "Run NPM Install" in cPanel

**Cause:** This is a known cPanel false alarm. The install usually DID succeed.  
**Fix:** Ignore it. Use **cPanel Terminal** to run `npm install --production` manually instead.

### ❌ "502 Bad Gateway" or "Application Error"

- Check **startup file** path is correct in Setup Node.js App
- Check Node.js version is 18+
- Check logs:
  ```bash
  cat ~/api.kachabazar.com/stderr.log
  ```

### ❌ Admin shows blank page or 404 on sub-routes

- Make sure `.htaccess` exists in `admin.kachabazar.com/` with the SPA rewrite rules
- Make sure `index.html` is at the root (not inside a subfolder)

### ❌ CORS errors in browser

- The backend uses `app.use(cors())` which allows all origins — this should work
- If you restricted CORS, add `https://kachabazar.com` and `https://admin.kachabazar.com`

### ❌ MongoDB connection failed

- In **MongoDB Atlas → Network Access**, add IP **`0.0.0.0/0`** (allow from anywhere)
- Double-check the `MONGO_URI` in your `.env`

### ❌ "Cannot find module" errors

- Go to Terminal, activate the Node env, run `npm install` again
- Make sure you're in the correct directory

### ❌ Next.js store not loading

- Verify `.next/` folder was uploaded
- Check `server.js` exists and is set as startup file
- Check logs:
  ```bash
  cat ~/public_html/stderr.log
  ```

### ❌ Admin API calls failing / showing localhost

- Open browser DevTools → Network tab
- If API URL shows `localhost`, **rebuild** admin locally with correct `VITE_APP_API_BASE_URL=https://api.kachabazar.com/v1` and re-upload

### ❌ Environment variables not working in admin

- Vite embeds `VITE_*` variables at **build time**. Changing them on the server does nothing.
- You must rebuild locally and re-upload the `build/` folder.

---

## Summary & Quick Checklist

| # | Task | Status |
|---|------|--------|
| 1 | MongoDB Atlas cluster created & IP `0.0.0.0/0` whitelisted | ☐ |
| 2 | Subdomain `api.kachabazar.com` created in cPanel | ☐ |
| 3 | Subdomain `admin.kachabazar.com` created in cPanel | ☐ |
| 4 | Backend files uploaded to `api.kachabazar.com/` | ☐ |
| 5 | Backend `.env` created with all required variables | ☐ |
| 6 | Backend Node.js app created in cPanel (startup: `api/index.js`) | ☐ |
| 7 | Backend `.htaccess` has Passenger config | ☐ |
| 8 | Backend `npm install --production` completed | ☐ |
| 9 | Backend working: `https://api.kachabazar.com` → "App works properly!" | ☐ |
| 10 | Admin `.env` set locally with `VITE_APP_API_BASE_URL=https://api.kachabazar.com/v1` | ☐ |
| 11 | Admin built locally (`npm run build`) | ☐ |
| 12 | Admin `build/` files uploaded to `admin.kachabazar.com/` | ☐ |
| 13 | Admin `.htaccess` created with SPA rewrite rules | ☐ |
| 14 | Admin working: `https://admin.kachabazar.com` shows login page | ☐ |
| 15 | Store `.env.local` set locally with `NEXT_PUBLIC_API_BASE_URL=https://api.kachabazar.com/v1` | ☐ |
| 16 | Store built locally (`npm run build`) | ☐ |
| 17 | Store files (including `.next/`) uploaded to `public_html/` | ☐ |
| 18 | Store `server.js` created in `public_html/` | ☐ |
| 19 | Store `.env` created on server | ☐ |
| 20 | Store Node.js app created in cPanel (startup: `server.js`) | ☐ |
| 21 | Store `npm install --production` completed | ☐ |
| 22 | Store working: `https://kachabazar.com` shows homepage | ☐ |
| 23 | SSL active for all 3 domains | ☐ |

---

## Deployment Order (Recommended)

1. **Backend first** → so the API is ready
2. **Admin second** → so you can manage products/settings
3. **Store last** → the customer-facing site

---

**🎉 Once all 3 are done, kachabazar.com is live!**


## Command for build and zip store for cPanel

cd store && rm -f store-deploy.zip && zip -r store-deploy.zip \
  .next \
  public \
  package.json \
  package-lock.json \
  server.js \
  next.config.js \
  .env.local \
  .htaccess \
  -x ".next/cache/*" 2>&1 | tail -5


