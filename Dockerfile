# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy package files first for better layer caching
COPY package.json package-lock.json ./

# 2. Install dependencies (clean install)
RUN npm ci

# 3. Copy all files except those in .dockerignore
COPY . .

# 4. Set build environment variables
ENV NODE_ENV=production
ENV VITE_API_URL=${VITE_API_URL:-http://localhost:8000}

# 5. Install TypeScript globally (if needed for your project)
RUN npm install -g typescript

# 6. Run the build process (TypeScript compile + Vite build)
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

# 1. Copy built assets from builder
COPY --from=builder /app/dist ./dist

# 2. Copy production package files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# 3. Install only production dependencies
RUN npm ci --omit=dev

# 4. Expose port
EXPOSE 3000

# 5. Run Vite preview (matches your package.json script)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]