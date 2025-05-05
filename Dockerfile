# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source files (excluding what's in .dockerignore)
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine
WORKDIR /app

# Copy production files from builder
COPY --from=builder /app/dist ./dist/
COPY --from=builder /app/node_modules ./node_modules/
COPY --from=builder /app/package.json .
COPY --from=builder /app/vite.config.ts .
COPY --from=builder /app/tsconfig.json .

# Environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000 || exit 1

EXPOSE 3000

# Run Vite preview server with explicit host binding
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]