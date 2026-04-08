/**
 * Tests for authConfig module
 */

import { describe, it, expect } from 'vitest';
import { msalConfig, loginRequest, apiRequest, validateAuthConfig } from '../authConfig';

describe('authConfig', () => {
  describe('msalConfig', () => {
    it('should have correct client ID from environment', () => {
      expect(msalConfig.auth.clientId).toBe('test-client-id');
    });

    it('should have correct authority from environment', () => {
      expect(msalConfig.auth.authority).toBe('https://login.microsoftonline.com/test-tenant/v2.0');
    });

    it('should use sessionStorage for cache', () => {
      expect(msalConfig.cache?.cacheLocation).toBe('sessionStorage');
    });

    it('should not store auth state in cookie', () => {
      expect(msalConfig.cache?.storeAuthStateInCookie).toBe(false);
    });
  });

  describe('loginRequest', () => {
    it('should include OpenID Connect scopes', () => {
      expect(loginRequest.scopes).toContain('openid');
      expect(loginRequest.scopes).toContain('profile');
      expect(loginRequest.scopes).toContain('offline_access');
    });
  });

  describe('apiRequest', () => {
    it('should include API scope from environment', () => {
      expect(apiRequest.scopes).toContain('api://test-api-id/user_impersonation');
    });
  });

  describe('validateAuthConfig', () => {
    it('should not throw when all required variables are set', () => {
      expect(() => validateAuthConfig()).not.toThrow();
    });
  });
});
