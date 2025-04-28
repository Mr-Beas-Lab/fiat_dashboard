import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { verifyRole } from '../api/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "ambassador" | "superadmin")[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { currentUser, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);

  useEffect(() => {
    const verifyUserRole = async () => {
      // Don't proceed if still loading or already verified
      if (isLoading || verificationAttempted) {
        return;
      }

      setIsVerifying(true);
      
      if (!currentUser) {
        setIsVerifying(false);
        setVerificationAttempted(true);
        return;
      }

      try {
        // Check if role is already in allowed roles before making API call
        if (currentUser.role && allowedRoles.includes(currentUser.role)) {
          // First authorize based on local data
          setIsAuthorized(true);
          
          // Then verify with backend (non-blocking)
          try {
            const response = await verifyRole();
            
            // Update authorization if backend responds differently
            if (response.role && allowedRoles.includes(response.role)) {
              // Role matches, make sure we're still authorized
              setIsAuthorized(true);
            } else {
              // Role from backend doesn't match allowed roles
              console.warn('Backend role verification failed. User will be logged out.');
              await logout();
              setIsAuthorized(false);
            }
          } catch (apiError) {
            // Only log out if it's an authorization error, not a network error
            if (apiError.error === 'unauthorized') {
              console.error('API verified user is unauthorized:', apiError);
              await logout();
              setIsAuthorized(false);
            } else if (apiError.error === 'network-error') {
              // For network errors, log a warning but keep user authorized based on local data
              console.warn('Role verification network error, maintaining local authorization:', apiError);
              // Don't change isAuthorized - keep whatever it was set to earlier
            } else {
              // For other errors, also keep local authorization but log it
              console.warn('Role verification API error, maintaining local authorization:', apiError);
            }
          }
        } else {
          // Local role check failed, try backend verification as fallback
          try {
        const response = await verifyRole();
        
        if (response.role && allowedRoles.includes(response.role)) {
          setIsAuthorized(true);
        } else {
          console.warn('User role verification failed. Logging out...');
          await logout();
              setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error verifying user role:', error);
        await logout();
            setIsAuthorized(false);
          }
        }
      } finally {
        setIsVerifying(false);
        setVerificationAttempted(true);
      }
    };

      verifyUserRole();
  }, [currentUser, isLoading, allowedRoles, logout, verificationAttempted]);

  // Show loading state while authentication is in progress
  if (isLoading || (isVerifying && !verificationAttempted)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to unauthorized page if not authorized
  if (!isAuthorized) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // Render children if authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute; 