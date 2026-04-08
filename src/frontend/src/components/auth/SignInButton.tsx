/**
 * Sign In Button Component
 * 
 * Displays a button that triggers the sign-in flow when clicked.
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Alert } from '../ui';

export function SignInButton() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleSignIn}
        disabled={isLoading}
        variant="primary"
      >
        {isLoading ? 'Signing in...' : 'Sign In with Microsoft'}
      </Button>
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}
    </div>
  );
}
