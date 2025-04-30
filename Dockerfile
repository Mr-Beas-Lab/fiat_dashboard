# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:latest

# Copy built assets from builder
COPY --from=builder /app/build /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:80 || exit 1

EXPOSE 80