import React from 'react';
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ApiErrorAlertProps {
  message?: string;
  isVisible: boolean;
  onRetry?: () => void;
  showLoginLink?: boolean;
  actionText?: string;
}

export function ApiErrorAlert({ 
  message, 
  isVisible, 
  onRetry, 
  showLoginLink, 
  actionText = "Try Again" 
}: ApiErrorAlertProps) {
  if (!isVisible) return null;
  
  // User-friendly default message
  const userFriendlyMessage = message || "Something went wrong. Please try again later.";
  
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 mb-4 rounded relative" role="alert">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="block sm:inline font-medium">
            {userFriendlyMessage}
          </span>
        </div>
        <div className="flex space-x-2">
          {showLoginLink && (
            <Link 
              to="/login"
              className="flex items-center text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-800 transition-colors"
            >
              <LogIn className="h-3 w-3 mr-1" />
              Login
            </Link>
          )}
          {onRetry && (
            <button 
              type="button"
              onClick={onRetry}
              className="flex items-center text-sm bg-red-100 hover:bg-red-200 px-3 py-1 rounded text-red-800 transition-colors"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              {actionText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApiErrorAlert; 