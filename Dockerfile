# Build stage
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Health check (recommended for backend services)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1

# Expose the correct port (should match what you specified in docker-compose)
EXPOSE 3000

# Run the application (ensure this matches your built file structure)
CMD ["node", "dist/src/main.js"]