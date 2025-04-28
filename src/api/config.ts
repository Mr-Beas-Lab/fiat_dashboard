// API configuration

// Get the URL from environment variables with fallbacks
const API_BASE_URL = import.meta.env.VITE_API_URL || 
                    // Check if we're in development mode
                    (import.meta.env.DEV ? 
                      // Try these URLs in order during development
                      'http://localhost:3000/api' : 
                      // In production, default to relative URL
                      '/api');

// Export configuration
export const config = {
  API_BASE_URL,
  TIMEOUT: 60000, // 60 seconds timeout for large file uploads
  RETRY_DELAY: 1000, // 1 second between retries
  MAX_RETRIES: 2, // Maximum number of retries
};

export default config; 