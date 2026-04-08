/**
 * Authentication Context
 * 
 * Provides authentication state and utilities throughout the application.
 * Wraps MSAL functionality in a React context for easier consumption.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';
import { getApiToken, getApiTokenInteractive, NoAccountError } from '../utils/msalApiClient';
import { AuthContextValue, AuthState, extractUserInfo } from '../types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Manages authentication state and provides auth utilities to child components.
 * Must be used within MsalProvider.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  // Update auth state when MSAL state changes
  useEffect(() => {
    const account = accounts[0] || null;
    const user = extractUserInfo(account);

    setAuthState({
      isAuthenticated,
      isLoading: false,
      user,
      error: null,
    });
  }, [isAuthenticated, accounts]);

  // Attempt silent SSO on mount
  useEffect(() => {
    const attemptSilentSignIn = async () => {
      if (isAuthenticated) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const accounts = instance.getAllAccounts();
        if (accounts.length > 0) {
          // Account exists in cache, try to acquire token silently
          const account = accounts[0];
          await instance.acquireTokenSilent({
            ...loginRequest,
            account,
          });
          // State will be updated by the useEffect above
        } else {
          // No cached account, mark as not loading
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        // Silent sign-in failed, user will need to sign in interactively
        console.info('Silent sign-in not available:', error);
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    attemptSilentSignIn();
  }, [instance, isAuthenticated]);

  /**
   * Sign in the user using popup flow
   */
  const signIn = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await instance.loginPopup(loginRequest);
      // State will be updated by the useEffect above
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [instance]);

  /**
   * Sign out the user
   */
  const signOut = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const account = accounts[0];
      await instance.logoutPopup({
        account,
        postLogoutRedirectUri: window.location.origin,
      });
      // State will be updated by the useEffect above
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [instance, accounts]);

  /**
   * Get an access token for API calls
   * Automatically handles token refresh and interactive authentication if needed
   */
  const getAccessToken = useCallback(async (): Promise<string> => {
    try {
      return await getApiToken(instance);
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Token refresh failed, need interactive authentication
        return await getApiTokenInteractive(instance);
      }
      if (error instanceof NoAccountError) {
        // No account, trigger sign in
        await signIn();
        return await getApiToken(instance);
      }
      throw error;
    }
  }, [instance, signIn]);

  const contextValue: AuthContextValue = {
    ...authState,
    signIn,
    signOut,
    getAccessToken,
    account: accounts[0] || null,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * 
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
