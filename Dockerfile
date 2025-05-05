# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./ 

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage with Nginx
FROM nginx:alpine

# Copy the built app to the Nginx container
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom Nginx config (you will need to add this)
COPY ./nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost || exit 1

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
