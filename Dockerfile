# Stage 1: Build the Vite app
FROM node:20-alpine as BUILD_IMAGE

LABEL name="dashboard"

WORKDIR /app

# Copy package files first for better caching
COPY package.json .
COPY package-lock.json* .

# Install dependencies
RUN npm install

# Copy all files and build
COPY . .
RUN npm run build 

# Stage 2: Production image with Nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=BUILD_IMAGE /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
