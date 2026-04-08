/**
 * Authentication Error Handler Component
 * 
 * Displays user-friendly error messages for authentication failures.
 */

import React from 'react';
import { ApiError } from '../utils/apiClient';
import { NoAccountError, TokenAcquisitionError } from '../utils/msalApiClient';

interface AuthErrorProps {
  error: Error;
  onRetry?: () => void;
  onSignIn?: () => void;
}

export function AuthErrorDisplay({ error, onRetry, onSignIn }: AuthErrorProps) {
  // Determine error type and appropriate message
  let title = 'Authentication Error';
  let message = 'An error occurred during authentication.';
  let showRetry = true;
  let showSignIn = false;

  if (error instanceof NoAccountError) {
    title = 'Sign In Required';
    message = 'You need to sign in to access this feature.';
    showRetry = false;
    showSignIn = true;
  } else if (error instanceof TokenAcquisitionError) {
    title = 'Token Acquisition Failed';
    message = 'Unable to get an access token. Please try signing in again.';
    showSignIn = true;
  } else if (error instanceof ApiError) {
    if (error.statusCode === 401) {
      title = 'Authentication Failed';
      message = 'Your session has expired. Please sign in again.';
      showSignIn = true;
    } else if (error.statusCode === 403) {
      title = 'Access Denied';
      message = 'You do not have permission to access this resource.';
      showRetry = false;
    } else {
      title = 'API Error';
      message = error.message;
    }
  } else {
    message = error.message;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="text-red-600 text-2xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
          <p className="text-red-800 mb-4">{message}</p>
          <div className="flex space-x-3">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Retry
              </button>
            )}
            {showSignIn && onSignIn && (
              <button
                onClick={onSignIn}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
