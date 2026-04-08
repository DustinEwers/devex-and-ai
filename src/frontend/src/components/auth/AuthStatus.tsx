/**
 * Auth Status Component
 * 
 * Displays the current authentication status and user information.
 */

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Badge, Alert } from '../ui';

export function AuthStatus() {
  const { isAuthenticated, isLoading, user, error } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-slate-300">
        <Spinner size="sm" color="blue" />
        <span>Checking authentication...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Authentication Error">
        {error}
      </Alert>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-slate-300">
        <p>You are not signed in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-slate-100">{user.name}</p>
          <p className="text-sm text-slate-300">{user.email}</p>
        </div>
      </div>
      {user.roles && user.roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {user.roles.map((role) => (
            <Badge key={role} variant="info">
              {role}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
