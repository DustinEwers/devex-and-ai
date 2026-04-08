/**
 * API Client with Authentication
 * 
 * Provides a configured fetch wrapper that automatically attaches
 * Bearer tokens to API requests and handles authentication errors.
 */

import { IPublicClientApplication } from '@azure/msal-browser';
import { getApiTokenWithFallback, NoAccountError } from './msalApiClient';

/**
 * API client error
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Configuration for API client
 */
export interface ApiClientConfig {
  baseUrl: string;
  msalInstance: IPublicClientApplication;
}

/**
 * API Client class
 * 
 * Wraps fetch with automatic token attachment and error handling
 */
export class ApiClient {
  private baseUrl: string;
  private msalInstance: IPublicClientApplication;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.msalInstance = config.msalInstance;
  }

  /**
   * Get access token for API requests
   */
  private async getToken(): Promise<string> {
    try {
      return await getApiTokenWithFallback(this.msalInstance);
    } catch (error) {
      if (error instanceof NoAccountError) {
        throw new ApiError('Authentication required. Please sign in.', 401);
      }
      throw new ApiError('Failed to get access token', 401, error);
    }
  }

  /**
   * Make an authenticated API request
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();
    const url = `${this.baseUrl}${endpoint}`;

    const headers = new Headers(options.headers);
    headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle error responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: unknown;

      try {
        errorDetails = await response.json();
        if (errorDetails && typeof errorDetails === 'object' && 'message' in errorDetails) {
          errorMessage = (errorDetails as { message: string }).message;
        }
      } catch {
        // Response body is not JSON or empty
      }

      // Handle authentication/authorization errors
      if (response.status === 401) {
        throw new ApiError('Authentication failed. Please sign in again.', 401, errorDetails);
      }

      if (response.status === 403) {
        throw new ApiError('You do not have permission to access this resource.', 403, errorDetails);
      }

      throw new ApiError(errorMessage, response.status, errorDetails);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return undefined as T;
    }

    return await response.json();
  }

  /**
   * GET request
   */
  async get<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = unknown>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

/**
 * Create an API client instance
 */
export function createApiClient(msalInstance: IPublicClientApplication): ApiClient {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return new ApiClient({ baseUrl, msalInstance });
}
