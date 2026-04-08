/**
 * Protected Route Component
 * 
 * Guards routes requiring authentication. Redirects to sign-in if not authenticated.
 * This component is ready for use with React Router or other routing libraries.
 */

import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SignInButton } from './auth';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRoles?: string[];
}

/**
 * ProtectedRoute component
 * 
 * Renders children only if user is authenticated.
 * Optionally checks for required roles.
 * 
 * @param children - Content to render when authenticated
 * @param fallback - Custom fallback content (optional)
 * @param requiredRoles - Array of roles required to access this route (optional)
 */
export function ProtectedRoute({ children, fallback, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center space-y-4">
          <div className="text-4xl">🔒</div>
          <h2 className="text-2xl font-bold text-slate-900">Authentication Required</h2>
          <p className="text-slate-600">
            You need to sign in to access this page.
          </p>
          <SignInButton />
        </div>
      </div>
    );
  }

  // Check for required roles
  if (requiredRoles && requiredRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white shadow rounded-lg p-8 text-center space-y-4">
            <div className="text-4xl">⛔</div>
            <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
            <p className="text-slate-600">
              You do not have the required permissions to access this page.
            </p>
            <div className="text-sm text-slate-500">
              Required role{requiredRoles.length > 1 ? 's' : ''}: {requiredRoles.join(', ')}
            </div>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required roles (if any)
  return <>{children}</>;
}
