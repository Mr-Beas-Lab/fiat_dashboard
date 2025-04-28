import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import apiClient from "../api/apiClient";

// Define AuthUser type
interface AuthUser {
  uid: string;
  email: string | null;
  role: "admin" | "ambassador" | "superadmin";
  firstName?: string;
  lastName?: string;
}

// Define AuthContext type
interface AuthContextType {
  currentUser: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  setCurrentUser: (user: AuthUser | null) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provide context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const loadUserFromStorage = () => {
      setIsLoading(true);
      try {
        const userJson = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');
        
        if (!userJson || !token) {
          setCurrentUser(null);
          return;
        }
        
        const user = JSON.parse(userJson);
        if (user && user.uid && user.email && user.role) {
          // Verify the role is one of the expected values
          const role = user.role as "admin" | "ambassador" | "superadmin";
          
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            role: role,
            firstName: user.firstName,
            lastName: user.lastName
          });
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);
  
  const logout = async () => {
    try {
      // No logout endpoint mentioned in the documentation, so we'll just clear local storage
      
      // Clear localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setCurrentUser(null);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
