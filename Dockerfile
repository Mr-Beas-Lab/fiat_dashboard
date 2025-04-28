# Stage 1: Build the app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy all files (including firebase config)
COPY . .

# Create .env file with Firebase config (replace with your actual values or build args)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

RUN echo "VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}" > .env && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}" >> .env && \
    echo "VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}" >> .env && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}" >> .env && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}" >> .env && \
    echo "VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}" >> .env && \
    echo "VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}" >> .env

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]