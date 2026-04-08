/**
 * Type definitions for authentication-related data structures
 */

import { AccountInfo } from '@azure/msal-browser';

/**
 * User information extracted from Entra ID claims
 */
export interface UserInfo {
  /** User's unique identifier (oid claim) */
  id: string;
  /** User's email address (preferred_username or email claim) */
  email: string;
  /** User's display name (name claim) */
  name: string;
  /** User's first name (given_name claim) */
  firstName?: string;
  /** User's last name (family_name claim) */
  lastName?: string;
  /** User roles from the token (if configured) */
  roles?: string[];
}

/**
 * Authentication state
 */
export interface AuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication is in progress */
  isLoading: boolean;
  /** User information if authenticated */
  user: UserInfo | null;
  /** Error message if authentication failed */
  error: string | null;
}

/**
 * Authentication context value
 */
export interface AuthContextValue extends AuthState {
  /** Sign in the user */
  signIn: () => Promise<void>;
  /** Sign out the user */
  signOut: () => Promise<void>;
  /** Get an access token for API calls */
  getAccessToken: () => Promise<string>;
  /** MSAL account information */
  account: AccountInfo | null;
}

/**
 * API error response
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** HTTP status code */
  statusCode?: number;
  /** Additional error details */
  details?: unknown;
}

/**
 * Extract user information from MSAL AccountInfo
 */
export function extractUserInfo(account: AccountInfo | null): UserInfo | null {
  if (!account) {
    return null;
  }

  const claims = account.idTokenClaims as Record<string, unknown> | undefined;

  return {
    id: account.localAccountId,
    email: account.username,
    name: account.name || account.username,
    firstName: claims?.given_name as string | undefined,
    lastName: claims?.family_name as string | undefined,
    roles: claims?.roles as string[] | undefined,
  };
}
