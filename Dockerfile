# ----------- Stage 1: Build the app ----------- #
FROM node:18-alpine AS builder

WORKDIR /app

# Copy only package files first to leverage caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Create a .env file with the required environment variables
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID

# Create .env file with the build arguments
RUN echo "VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}" > .env && \
    echo "VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}" >> .env && \
    echo "VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}" >> .env && \
    echo "VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}" >> .env && \
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}" >> .env && \
    echo "VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}" >> .env && \
    echo "VITE_FIREBASE_MEASUREMENT_ID=${VITE_FIREBASE_MEASUREMENT_ID}" >> .env

# Create the firebase directory and copy the config file
RUN mkdir -p src/firebase && \
    echo "import { initializeApp } from 'firebase/app';" > src/firebase/firebaseConfig.ts && \
    echo "import { getAuth } from 'firebase/auth';" >> src/firebase/firebaseConfig.ts && \
    echo "import { getFirestore } from 'firebase/firestore';" >> src/firebase/firebaseConfig.ts && \
    echo "import { getStorage } from 'firebase/storage';" >> src/firebase/firebaseConfig.ts && \
    echo "" >> src/firebase/firebaseConfig.ts && \
    echo "const firebaseConfig = {" >> src/firebase/firebaseConfig.ts && \
    echo "  apiKey: import.meta.env.VITE_FIREBASE_API_KEY," >> src/firebase/firebaseConfig.ts && \
    echo "  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN," >> src/firebase/firebaseConfig.ts && \
    echo "  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID," >> src/firebase/firebaseConfig.ts && \
    echo "  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET," >> src/firebase/firebaseConfig.ts && \
    echo "  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID," >> src/firebase/firebaseConfig.ts && \
    echo "  appId: import.meta.env.VITE_FIREBASE_APP_ID," >> src/firebase/firebaseConfig.ts && \
    echo "  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID" >> src/firebase/firebaseConfig.ts && \
    echo "};" >> src/firebase/firebaseConfig.ts && \
    echo "" >> src/firebase/firebaseConfig.ts && \
    echo "const app = initializeApp(firebaseConfig);" >> src/firebase/firebaseConfig.ts && \
    echo "export const auth = getAuth(app);" >> src/firebase/firebaseConfig.ts && \
    echo "export const db = getFirestore(app);" >> src/firebase/firebaseConfig.ts && \
    echo "export const storage = getStorage(app);" >> src/firebase/firebaseConfig.ts && \
    echo "" >> src/firebase/firebaseConfig.ts && \
    echo "export default app;" >> src/firebase/firebaseConfig.ts

# Build the app
RUN npm run build

# ----------- Stage 2: Serve with Nginx ----------- #
FROM nginx:alpine

# Remove default Nginx static files if any
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config for SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]