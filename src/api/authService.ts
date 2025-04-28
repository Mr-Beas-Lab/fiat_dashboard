import apiClient from './apiClient';

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  uid: string;
  role: "admin" | "ambassador" | "superadmin";
  accessToken: string;
  email: string;
}

interface VerifyRoleResponse {
  uid: string;
  role: "admin" | "ambassador" | "superadmin";
  email: string;
}

/**
 * Authenticates a user with email and password
 * @param credentials User login credentials
 * @returns Authentication response with user data and token
 */
export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    // Store token and user data in localStorage
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify({
        uid: response.data.uid,
        email: response.data.email,
        role: response.data.role,
        firstName: response.data.firstName,
        lastName: response.data.lastName
      }));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.response?.status === 401) {
      throw { error: 'invalid-credentials', message: 'Invalid email or password' };
    } else if (error.response?.status === 400) {
      // Handle validation errors
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message[0] 
        : error.response.data.message;
      throw { error: 'validation-error', message: errorMessage };
    } else {
      throw { error: 'server-error', message: 'Server error. Please try again later.' };
    }
  }
};

/**
 * Verifies the user's role from their JWT token
 * @returns User role and ID information
 */
export const verifyRole = async (): Promise<VerifyRoleResponse> => {
  try {
    const response = await apiClient.get('/auth/verify-role');
    return response.data;
  } catch (error: any) {
    console.error('Role verification error:', error);
    
    // Check if this is an authentication error
    if (error.response?.status === 401) {
      throw { 
        error: 'unauthorized', 
        message: 'Authentication required' 
      };
    } 
    // Check if this is a network error
    else if (!error.response && error.code === 'ERR_NETWORK') {
      throw { 
        error: 'network-error', 
        message: 'Network error. Could not verify role.' 
      };
    }
    // Other errors
    else {
      throw { 
        error: 'verification-failed', 
        message: 'Failed to verify user role' 
      };
    }
  }
};

/**
 * Logs out the current user
 */
export const logout = async (): Promise<void> => {
  try {
    // Call logout endpoint
    await apiClient.post('/auth/logout', {});
  } catch (error) {
    console.warn("Error calling logout API:", error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
}; 