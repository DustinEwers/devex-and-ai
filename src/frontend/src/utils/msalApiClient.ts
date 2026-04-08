/**
 * MSAL API Client Utilities
 * 
 * Helper functions for acquiring access tokens to call the Cheersly backend API.
 */

import {
  IPublicClientApplication,
  AuthenticationResult,
  InteractionRequiredAuthError,
  SilentRequest,
} from '@azure/msal-browser';
import { apiRequest } from '../authConfig';

/**
 * Error thrown when no account is available for token acquisition
 */
export class NoAccountError extends Error {
  constructor() {
    super('No authenticated account found. Please sign in.');
    this.name = 'NoAccountError';
  }
}

/**
 * Error thrown when token acquisition fails
 */
export class TokenAcquisitionError extends Error {
  constructor(message: string, public readonly originalError?: unknown) {
    super(message);
    this.name = 'TokenAcquisitionError';
  }
}

/**
 * Acquires an access token for the Cheersly API
 * 
 * This function attempts to acquire a token silently first. If that fails due to
 * interaction being required (e.g., expired refresh token, consent needed), it will
 * throw an InteractionRequiredAuthError that the caller should handle by triggering
 * an interactive login flow.
 * 
 * @param msalInstance - The MSAL IPublicClientApplication instance
 * @returns Promise resolving to the access token string
 * @throws {NoAccountError} When no authenticated account is found
 * @throws {InteractionRequiredAuthError} When user interaction is required
 * @throws {TokenAcquisitionError} For other token acquisition failures
 */
export async function getApiToken(msalInstance: IPublicClientApplication): Promise<string> {
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    throw new NoAccountError();
  }

  // Use the first account (in a production app, you might need to select the correct account)
  const account = accounts[0];

  const silentRequest: SilentRequest = {
    ...apiRequest,
    account,
  };

  try {
    // Attempt silent token acquisition
    const result: AuthenticationResult = await msalInstance.acquireTokenSilent(silentRequest);
    return result.accessToken;
  } catch (error) {
    // If interaction is required, re-throw so the caller can handle it
    if (error instanceof InteractionRequiredAuthError) {
      throw error;
    }

    // For any other error, wrap it in our custom error
    throw new TokenAcquisitionError(
      'Failed to acquire access token',
      error
    );
  }
}

/**
 * Acquires an access token using a popup-based interactive flow
 * 
 * Use this when silent token acquisition fails and user interaction is required.
 * 
 * @param msalInstance - The MSAL IPublicClientApplication instance
 * @returns Promise resolving to the access token string
 * @throws {TokenAcquisitionError} If interactive token acquisition fails
 */
export async function getApiTokenInteractive(msalInstance: IPublicClientApplication): Promise<string> {
  try {
    const result: AuthenticationResult = await msalInstance.acquireTokenPopup(apiRequest);
    return result.accessToken;
  } catch (error) {
    throw new TokenAcquisitionError(
      'Failed to acquire access token interactively',
      error
    );
  }
}

/**
 * Acquires an access token with automatic fallback to interactive flow
 * 
 * This is a convenience function that attempts silent acquisition first,
 * and automatically falls back to popup-based interactive flow if needed.
 * 
 * @param msalInstance - The MSAL IPublicClientApplication instance
 * @returns Promise resolving to the access token string
 * @throws {NoAccountError} When no authenticated account is found
 * @throws {TokenAcquisitionError} If both silent and interactive acquisition fail
 */
export async function getApiTokenWithFallback(msalInstance: IPublicClientApplication): Promise<string> {
  try {
    return await getApiToken(msalInstance);
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // Fall back to interactive flow
      return await getApiTokenInteractive(msalInstance);
    }
    throw error;
  }
}

/**
 * Configuration for API requests with retry and timeout
 */
export interface ApiRequestConfig {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

/**
 * Default API request configuration
 */
const DEFAULT_CONFIG: Required<ApiRequestConfig> = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 1000, // 1 second base delay for exponential backoff
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Make an authenticated API request with retry logic and timeout
 * 
 * @param msalInstance - The MSAL IPublicClientApplication instance
 * @param url - The API endpoint URL (absolute or relative to API base)
 * @param options - Fetch options (method, headers, body, etc.)
 * @param config - Request configuration (timeout, retry settings)
 * @returns Promise resolving to the response
 */
export async function makeApiRequest<T = unknown>(
  msalInstance: IPublicClientApplication,
  url: string,
  options: RequestInit = {},
  config: ApiRequestConfig = {}
): Promise<T> {
  const { timeout, maxRetries, retryDelay } = { ...DEFAULT_CONFIG, ...config };
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Get access token
      const token = await getApiTokenWithFallback(msalInstance);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Make the request
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle error responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed with status ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || errorMessage;
        } catch {
          // If not JSON, use the text or default message
          errorMessage = errorText || errorMessage;
        }
        
        const error = new Error(errorMessage) as Error & { status: number; response: Response };
        error.status = response.status;
        error.response = response;
        
        // Don't retry client errors (except 401)
        if (response.status >= 400 && response.status < 500 && response.status !== 401) {
          throw error;
        }
        
        throw error;
      }
      
      // Parse and return response
      const data = await response.json();
      return data as T;
      
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      
      // Don't retry client errors (except 401)
      const errorWithStatus = error as Error & { status?: number };
      if (errorWithStatus.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500 && errorWithStatus.status !== 401) {
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying with exponential backoff
      const delay = retryDelay * Math.pow(2, attempt);
      
      if (import.meta.env.DEV) {
        console.log(`API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`, error);
      }
      
      await sleep(delay);
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Request failed after all retries');
}

/**
 * Convenience wrapper for GET requests
 */
export async function get<T = unknown>(
  msalInstance: IPublicClientApplication,
  url: string,
  config?: ApiRequestConfig
): Promise<T> {
  return makeApiRequest<T>(msalInstance, url, { method: 'GET' }, config);
}

/**
 * Convenience wrapper for POST requests
 */
export async function post<T = unknown>(
  msalInstance: IPublicClientApplication,
  url: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<T> {
  return makeApiRequest<T>(
    msalInstance,
    url,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    config
  );
}

/**
 * Convenience wrapper for PUT requests
 */
export async function put<T = unknown>(
  msalInstance: IPublicClientApplication,
  url: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<T> {
  return makeApiRequest<T>(
    msalInstance,
    url,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    config
  );
}

/**
 * Convenience wrapper for DELETE requests
 */
export async function del<T = unknown>(
  msalInstance: IPublicClientApplication,
  url: string,
  config?: ApiRequestConfig
): Promise<T> {
  return makeApiRequest<T>(msalInstance, url, { method: 'DELETE' }, config);
}
