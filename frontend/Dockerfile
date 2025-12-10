# Multi-stage build: build static assets with pnpm (Vite), serve with Node.js (serve).

# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Install Corepack (not bundled in Alpine variant)
RUN npm install -g corepack && corepack enable && corepack prepare pnpm@latest --activate

# Build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy only manifest files first for better layer caching.
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen to lockfile).
RUN pnpm install --frozen-lockfile

# Copy the rest of the sources and build.
COPY . .
# Produces static files in /app/dist by default for Vite
RUN pnpm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install serve to serve static files
RUN npm install -g serve

# Copy build output from build stage
COPY --from=build /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
