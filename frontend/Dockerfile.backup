# Multi-stage build: build static assets with pnpm (Vite), serve with Nginx.

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install Corepack (not bundled in Alpine variant)
RUN npm install -g corepack && corepack enable && corepack prepare pnpm@latest --activate

# Copy only manifest files first for better layer caching.
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen to lockfile).
RUN pnpm install --frozen-lockfile

# Copy the rest of the sources and build.
COPY . .
# Produces static files in /app/dist by default for Vite
RUN pnpm run build

# --- Runtime stage ---
FROM nginx:alpine
# Copy build output to Nginx web root.
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP
EXPOSE 80