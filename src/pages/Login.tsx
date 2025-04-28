import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, currentUser } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (currentUser && !isLoading && !redirecting) {
      redirectToDashboard();
    }
  }, [currentUser, isLoading]);

  const redirectToDashboard = async () => {
    setRedirecting(true);
    setError(null);
    try {
      if (!currentUser) {
        console.error("Cannot redirect: No current user found");
        setError("Please log in first");
        setRedirecting(false);
        return;
      }
      
      console.log("Redirecting user with full user object:", JSON.stringify(currentUser));
      
      // Directly redirect based on role from the context without verifying with backend first
      let path = "/login"; // Default fallback
      
      // Redirect based on role from context
      switch (currentUser.role) {
        case "superadmin":
          path = "/superadmin-dashboard";
          break;
        case "admin":
          path = "/admin-dashboard";
          break;
        case "ambassador":
          path = "/ambassador-dashboard";
          break;
        default:
          console.error("Unknown role:", currentUser.role);
          setError(`Unknown role: ${currentUser.role}`);
          setRedirecting(false);
          return;
      }
      
      console.log("Navigating to path:", path);
      
      // Navigate to the appropriate dashboard
      navigate(path);
    } catch (error) {
      console.error("Error determining redirect path:", error);
      setError("Something went wrong. Please try logging in again.");
      // On error, keep user on login page
    } finally {
      setRedirecting(false);
    }
  };

  const handleLoginSuccess = () => {
    // After successful login, redirectToDashboard will be triggered by the useEffect
    // Adding a small delay to ensure context is updated
    setTimeout(() => {
      redirectToDashboard();
    }, 300);
  };

  if (isLoading || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;