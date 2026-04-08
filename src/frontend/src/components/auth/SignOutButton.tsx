/**
 * Sign Out Button Component
 * 
 * Displays a button that triggers the sign-out flow when clicked.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Alert } from '../ui';

interface SignOutButtonProps {
  fullWidth?: boolean;
}

export function SignOutButton({ fullWidth = false }: SignOutButtonProps) {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSignOut}
        disabled={isLoading}
        variant="secondary"
        className={fullWidth ? 'w-full' : ''}
      >
        {isLoading ? 'Signing out...' : 'Sign Out'}
      </Button>
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}
    </div>
  );
}
