import React from 'react';
import { useUser } from '../contexts/UserContext';
import { Card, Button, Spinner } from './ui';

/**
 * UserSyncGuard component that ensures user is synced before rendering children
 * 
 * Displays:
 * - Loading indicator during sync
 * - Error message with retry button on failure
 * - Children on successful sync
 */
export const UserSyncGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isError, error, syncUser } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center max-w-md p-8">
          <Spinner size="lg" color="blue" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Syncing your profile...</h2>
          <p className="text-slate-300">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Card className="text-center max-w-md">
          <div className="text-rose-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-100 mb-2">Sync Failed</h2>
          <p className="text-slate-300 mb-6">
            {error?.message || 'Unable to sync your profile. Please try again.'}
          </p>
          <Button onClick={syncUser} variant="primary">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
