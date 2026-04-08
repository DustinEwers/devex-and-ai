import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useMsal } from '@azure/msal-react';
import { User, SyncState, UserContextValue } from '../types/user';
import * as msalApiClient from '../utils/msalApiClient';

/**
 * Get the API base URL from environment variables
 * Use VITE_API_BASE_URL for consistency with other modules
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * User Context for providing user data throughout the application
 */
export const UserContext = createContext<UserContextValue | undefined>(undefined);

/**
 * Hook to access the user context
 * @throws Error if used outside of UserProvider
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

/**
 * UserProvider component that manages user synchronization state
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance: msalInstance, accounts } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [error, setError] = useState<Error | null>(null);
  const isSyncingRef = useRef(false);

  /**
   * Synchronize user data from the backend
   */
  const syncUser = useCallback(async () => {
    // Prevent concurrent sync requests
    if (isSyncingRef.current) {
      if (import.meta.env.DEV) {
        console.log('[UserContext] Sync already in progress, skipping');
      }
      return;
    }

    if (!accounts || accounts.length === 0) {
      if (import.meta.env.DEV) {
        console.log('[UserContext] No authenticated accounts, skipping sync');
      }
      return;
    }

    isSyncingRef.current = true;
    setSyncState('loading');
    setError(null);

    if (import.meta.env.DEV) {
      console.log('[UserContext] Starting user sync for account:', accounts[0].username);
    }

    try {
      const userData = await msalApiClient.get<User>(
        msalInstance,
        `${API_BASE_URL}/api/users/me`
      );

      setUser(userData);
      setSyncState('success');

      if (import.meta.env.DEV) {
        console.log('[UserContext] User sync successful:', userData.email);
        console.log('[UserContext] User data received:', userData);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      setSyncState('error');

      if (import.meta.env.DEV) {
        console.error('[UserContext] User sync failed:', error);
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [msalInstance, accounts]);

  /**
   * Clear user data (e.g., on logout)
   */
  const clearUser = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('[UserContext] Clearing user data');
    }
    setUser(null);
    setSyncState('idle');
    setError(null);
    isSyncingRef.current = false;
  }, []);

  /**
   * Automatically sync user when authenticated
   */
  useEffect(() => {
    if (accounts && accounts.length > 0 && syncState === 'idle') {
      if (import.meta.env.DEV) {
        console.log('[UserContext] Authenticated account detected, triggering auto-sync');
      }
      syncUser();
    }
  }, [accounts, syncState, syncUser]);

  /**
   * Clear user data when logged out
   */
  useEffect(() => {
    if (!accounts || accounts.length === 0) {
      if (user !== null || syncState !== 'idle') {
        if (import.meta.env.DEV) {
          console.log('[UserContext] No accounts detected, clearing user data');
        }
        clearUser();
      }
    }
  }, [accounts, user, syncState, clearUser]);

  const value: UserContextValue = {
    user,
    syncState,
    error,
    syncUser,
    clearUser,
    isLoading: syncState === 'loading',
    isError: syncState === 'error',
    isSuccess: syncState === 'success',
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
