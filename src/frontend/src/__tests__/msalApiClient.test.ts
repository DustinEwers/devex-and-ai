/**
 * Tests for msalApiClient utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import {
  getApiToken,
  getApiTokenInteractive,
  NoAccountError,
  TokenAcquisitionError,
} from '../utils/msalApiClient';
import { createMockMsalInstance, createMockAuthResult } from '../test/msalMocks';

describe('msalApiClient', () => {
  let mockMsalInstance: ReturnType<typeof createMockMsalInstance>;

  beforeEach(() => {
    mockMsalInstance = createMockMsalInstance();
  });

  describe('getApiToken', () => {
    it('should return access token on successful silent acquisition', async () => {
      const token = await getApiToken(mockMsalInstance as any);
      expect(token).toBe('mock-access-token');
      expect(mockMsalInstance.acquireTokenSilent).toHaveBeenCalled();
    });

    it('should throw NoAccountError when no accounts available', async () => {
      mockMsalInstance.getAllAccounts.mockReturnValue([]);
      await expect(getApiToken(mockMsalInstance as any)).rejects.toThrow(NoAccountError);
    });

    it('should throw InteractionRequiredAuthError when interaction is needed', async () => {
      const error = new InteractionRequiredAuthError('interaction_required');
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(error);

      await expect(getApiToken(mockMsalInstance as any)).rejects.toThrow(
        InteractionRequiredAuthError
      );
    });

    it('should throw TokenAcquisitionError for other errors', async () => {
      mockMsalInstance.acquireTokenSilent.mockRejectedValue(new Error('Network error'));

      await expect(getApiToken(mockMsalInstance as any)).rejects.toThrow(TokenAcquisitionError);
    });
  });

  describe('getApiTokenInteractive', () => {
    it('should return access token on successful interactive acquisition', async () => {
      const token = await getApiTokenInteractive(mockMsalInstance as any);
      expect(token).toBe('mock-access-token');
      expect(mockMsalInstance.acquireTokenPopup).toHaveBeenCalled();
    });

    it('should throw TokenAcquisitionError on failure', async () => {
      mockMsalInstance.acquireTokenPopup.mockRejectedValue(new Error('User cancelled'));

      await expect(getApiTokenInteractive(mockMsalInstance as any)).rejects.toThrow(
        TokenAcquisitionError
      );
    });
  });
});
