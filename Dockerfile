# 1. Build stage — full Node 22 (not alpine) to support native npm packages (sharp, etc.)
FROM node:22 AS build
WORKDIR /app

# Copy package.json for caching
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy all source code (.env.production supplies the default/production URLs;
# build ARGs below override them per-environment without editing source)
COPY . .

# Build-time overrides for NEXT_PUBLIC_* values only — these get inlined
# into the CLIENT bundle at build time, so they must be set now. Next.js's
# env loader treats already-set process.env vars as higher priority than
# the values in .env files, so setting these ENV vars before `next build`
# overrides .env.production for this build only.
#
# Everything else (NEXT_SERVER_API_BASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET)
# is intentionally NOT here: those are server-only values read fresh from
# process.env at REQUEST time in the final image, never inlined into
# client JS, and this "build" stage's ENV vars don't carry over to the
# `FROM node:22-alpine` stage below anyway — they belong in
# docker-compose's `environment:` block instead.
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MEDIA_BASE_URL
ARG NEXT_PUBLIC_STORE_DOMAIN
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_MEDIA_BASE_URL=$NEXT_PUBLIC_MEDIA_BASE_URL \
    NEXT_PUBLIC_STORE_DOMAIN=$NEXT_PUBLIC_STORE_DOMAIN

# next build automatically sets NODE_ENV=production and loads .env.production
RUN npm run build

# mkcert-rootCA.pem is a developer's local mkcert CA, not committed to git —
# only present on machines that have generated one for local HTTPS dev. Make
# sure a (possibly empty) file exists so the COPY below never fails a
# server/CI build that doesn't have one.
RUN touch mkcert-rootCA.pem

# 2. Production stage
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy built files from previous stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/jsconfig.json ./jsconfig.json
COPY --from=build /app/next.config.js ./next.config.js
# `next start` resolves images.loaderFile (src/lib/imageLoader.js) from disk
# at runtime, not just at build time — src/ must ship in the runtime image.
COPY --from=build /app/src ./src

# Trust the local mkcert dev CA in addition to Node's default trusted CAs —
# this ADDS one local-dev CA to the trust store, it does not disable
# verification. Harmless in a real production image (nothing there ever
# presents a cert signed by this CA); required for local Traefik/mkcert.
COPY --from=build /app/mkcert-rootCA.pem ./mkcert-rootCA.pem
ENV NODE_EXTRA_CA_CERTS=/app/mkcert-rootCA.pem

# Expose the Next.js port
EXPOSE 80

# Start the Next.js server
CMD ["npm", "run", "start", "--", "-p", "80", "-H", "0.0.0.0"]
