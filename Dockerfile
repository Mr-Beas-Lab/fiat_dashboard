# ----------- Stage 1: Build the app ----------- #
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create Firebase config file
RUN mkdir -p src/firebase && \
    echo "import { initializeApp } from 'firebase/app';" > src/firebase/firebaseConfig.ts && \
    echo "import { getAuth } from 'firebase/auth';" >> src/firebase/firebaseConfig.ts && \
    echo "import { getFirestore } from 'firebase/firestore';" >> src/firebase/firebaseConfig.ts && \
    echo "import { getStorage } from 'firebase/storage';" >> src/firebase/firebaseConfig.ts && \
    echo "" >> src/firebase/firebaseConfig.ts && \
    echo "const firebaseConfig = {" >> src/firebase/firebaseConfig.ts && \
    echo "  apiKey: process.env.VITE_FIREBASE_API_KEY," >> src/firebase/firebaseConfig.ts && \
    echo "  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN," >> src/firebase/firebaseConfig.ts && \
    echo "  projectId: process.env.VITE_FIREBASE_PROJECT_ID," >> src/firebase/firebaseConfig.ts && \
    echo "  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET," >> src/firebase/firebaseConfig.ts && \
    echo "  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID," >> src/firebase/firebaseConfig.ts && \
    echo "  appId: process.env.VITE_FIREBASE_APP_ID," >> src/firebase/firebaseConfig.ts && \
    echo "  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID" >> src/firebase/firebaseConfig.ts && \
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

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config for SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy error pages
COPY 50x.html /usr/share/nginx/html/
COPY 502.html /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
