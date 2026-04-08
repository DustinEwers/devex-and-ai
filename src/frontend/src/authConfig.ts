/**
 * Microsoft Entra ID (Azure AD) Authentication Configuration
 * 
 * This module exports MSAL configuration objects for browser-based authentication.
 * Configuration values are read from Vite environment variables (VITE_*).
 */

import { Configuration, PopupRequest } from '@azure/msal-browser';

/**
 * MSAL configuration for PublicClientApplication
 * Defines how MSAL will authenticate users and cache tokens
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID || '',
    authority: import.meta.env.VITE_ENTRA_AUTHORITY || 'https://login.microsoftonline.com/common/v2.0',
    redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Use sessionStorage for better security
    storeAuthStateInCookie: false, // Set to true if you have issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // Error
            console.error(message);
            return;
          case 1: // Warning
            console.warn(message);
            return;
          case 2: // Info
            console.info(message);
            return;
          case 3: // Verbose
            console.debug(message);
            return;
        }
      },
    },
  },
};

/**
 * Scopes for interactive login
 * These are OpenID Connect scopes for user authentication
 */
export const loginRequest: PopupRequest = {
  scopes: ['openid', 'profile', 'offline_access'],
};

/**
 * Scopes for API access token
 * Used when acquiring tokens to call the Cheersly backend API
 */
export const apiRequest: PopupRequest = {
  scopes: [import.meta.env.VITE_ENTRA_API_SCOPE || ''],
};

/**
 * Validate that required environment variables are set
 * Throws an error if critical configuration is missing
 */
export function validateAuthConfig(): void {
  const required = [
    { key: 'VITE_ENTRA_CLIENT_ID', value: import.meta.env.VITE_ENTRA_CLIENT_ID },
    { key: 'VITE_ENTRA_API_SCOPE', value: import.meta.env.VITE_ENTRA_API_SCOPE },
  ];

  const missing = required.filter(({ value }) => !value);

  if (missing.length > 0) {
    const keys = missing.map(({ key }) => key).join(', ');
    throw new Error(
      `Missing required authentication environment variables: ${keys}. ` +
      'Please check your .env.local file and ensure all required variables are set.'
    );
  }
}
