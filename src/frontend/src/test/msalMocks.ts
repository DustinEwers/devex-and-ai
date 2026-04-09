/**
 * MSAL Test Utilities and Mocks
 */

import { vi } from 'vitest';
import { AccountInfo, AuthenticationResult } from '@azure/msal-browser';

/**
 * Create a mock MSAL account
 */
export function createMockAccount(overrides?: Partial<AccountInfo>): AccountInfo {
  return {
    homeAccountId: 'test-home-account-id',
    environment: 'login.microsoftonline.com',
    tenantId: 'test-tenant-id',
    username: 'test@example.com',
    localAccountId: 'test-local-account-id',
    name: 'Test User',
    idTokenClaims: {
      aud: 'test-client-id',
      iss: 'https://login.microsoftonline.com/test-tenant-id/v2.0',
      iat: Date.now() / 1000,
      exp: Date.now() / 1000 + 3600,
      sub: 'test-sub',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      email: 'test@example.com',
      preferred_username: 'test@example.com',
      oid: 'test-oid',
      roles: ['User'],
      ...overrides?.idTokenClaims,
    },
    ...overrides,
  };
}

/**
 * Create a mock authentication result
 */
export function createMockAuthResult(
  overrides?: Partial<AuthenticationResult>
): AuthenticationResult {
  return {
    authority: 'https://login.microsoftonline.com/test-tenant-id/v2.0',
    uniqueId: 'test-unique-id',
    tenantId: 'test-tenant-id',
    scopes: ['openid', 'profile'],
    account: createMockAccount(),
    idToken: 'mock-id-token',
    idTokenClaims: {},
    accessToken: 'mock-access-token',
    fromCache: false,
    expiresOn: new Date(Date.now() + 3600000),
    tokenType: 'Bearer',
    correlationId: 'test-correlation-id',
    ...overrides,
  };
}

/**
 * Create a mock MSAL instance
 */
export function createMockMsalInstance() {
  const mockAccount = createMockAccount();
  const logger = {
    clone: vi.fn(() => logger),
    error: vi.fn(),
    info: vi.fn(),
    verbose: vi.fn(),
    warning: vi.fn(),
  };

  return {
    getAllAccounts: vi.fn(() => [mockAccount]),
    getActiveAccount: vi.fn(() => mockAccount),
    getLogger: vi.fn(() => logger),
    initialize: vi.fn(() => Promise.resolve()),
    setActiveAccount: vi.fn(),
    acquireTokenSilent: vi.fn(() => Promise.resolve(createMockAuthResult())),
    acquireTokenPopup: vi.fn(() => Promise.resolve(createMockAuthResult())),
    loginPopup: vi.fn(() => Promise.resolve(createMockAuthResult())),
    logoutPopup: vi.fn(() => Promise.resolve()),
    initializeWrapperLibrary: vi.fn(),
    addEventCallback: vi.fn(),
    removeEventCallback: vi.fn(),
    handleRedirectPromise: vi.fn(() => Promise.resolve(null)),
  };
}
