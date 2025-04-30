# Stage 1: Build the application
FROM node:20-alpine AS builder

# Add build arguments for Firebase configuration
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Create a temporary .env file with Firebase configuration
RUN echo "VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}" > .env && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}" >> .env && \
    echo "VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}" >> .env && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}" >> .env && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}" >> .env && \
    echo "VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}" >> .env && \
    echo "VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}" >> .env

# Install TypeScript globally and update tsconfig
RUN npm install -g typescript && \
    npm install -D @types/node @types/react @types/react-dom && \
    sed -i 's/"moduleResolution": "bundler"/"moduleResolution": "node"/g' tsconfig.json && \
    sed -i 's/"moduleResolution": "bundler"/"moduleResolution": "node"/g' tsconfig.node.json

# Build the application
RUN npm run build

# Stage 2: Serve with Caddy
FROM caddy:latest

# Copy built assets from builder
COPY --from=builder /app/dist /srv

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:80 || exit 1

EXPOSE 80