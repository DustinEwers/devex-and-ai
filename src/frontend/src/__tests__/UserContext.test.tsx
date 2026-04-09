import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { MsalProvider } from '@azure/msal-react';
import { UserProvider, useUser } from '../contexts/UserContext';
import * as msalApiClient from '../utils/msalApiClient';
import { User } from '../types/user';

const { mockMsalInstance, msalState } = vi.hoisted(() => ({
  mockMsalInstance: {
    getAllAccounts: vi.fn(),
    setActiveAccount: vi.fn(),
    acquireTokenSilent: vi.fn(),
    acquireTokenPopup: vi.fn(),
    addEventCallback: vi.fn(),
    removeEventCallback: vi.fn(),
    initialize: vi.fn(() => Promise.resolve()),
    initializeWrapperLibrary: vi.fn(),
    getLogger: vi.fn(() => ({
      clone: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      verbose: vi.fn(),
      warning: vi.fn(),
    })),
  },
  msalState: {
    accounts: [] as Array<{ username: string }>,
  },
}));

vi.mock('@azure/msal-react', () => ({
  MsalProvider: ({ children }: any) => children,
  useMsal: () => ({
    instance: mockMsalInstance,
    accounts: msalState.accounts,
  }),
}));

// Mock the msalApiClient
vi.mock('../utils/msalApiClient', () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  makeApiRequest: vi.fn(),
}));

// Mock user data
const mockUser: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  pointsToGive: 50,
  pointsReceived: 120,
  createdAt: '2025-01-01T00:00:00Z',
  lastLoginAt: '2025-11-11T10:00:00Z',
  lastPointsReset: '2025-11-01T00:00:00Z',
};

// Wrapper component for tests
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={mockMsalInstance}>
      <UserProvider>{children}</UserProvider>
    </MsalProvider>
  );
}

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    msalState.accounts = [];
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useUser hook', () => {
    it('throws error when used outside UserProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser must be used within UserProvider');

      console.error = originalError;
    });

    it('returns context value when used inside UserProvider', () => {
      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      expect(result.current).toMatchObject({
        user: null,
        syncState: 'idle',
        error: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
      });
      expect(typeof result.current.syncUser).toBe('function');
      expect(typeof result.current.clearUser).toBe('function');
    });
  });

  describe('syncUser', () => {
    it('successfully syncs user data', async () => {
      msalState.accounts = [
        { username: 'test@example.com' },
      ];
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Wait for auto-sync to complete
      await waitFor(() => {
        expect(result.current.syncState).toBe('success');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuccess).toBe(true);
    });

    it('handles sync failure', async () => {
      const error = new Error('Network error');
      msalState.accounts = [
        { username: 'test@example.com' },
      ];
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Wait for auto-sync to fail
      await waitFor(() => {
        expect(result.current.syncState).toBe('error');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toEqual(error);
      expect(result.current.isError).toBe(true);
    });

    it('sets loading state during sync', async () => {
      msalState.accounts = [
        { username: 'test@example.com' },
      ];

      let resolveSync: (value: User) => void;
      const syncPromise = new Promise<User>((resolve) => {
        resolveSync = resolve;
      });
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockReturnValue(syncPromise);

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Should be loading initially
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      expect(result.current.syncState).toBe('loading');

      // Resolve the sync
      act(() => {
        resolveSync!(mockUser);
      });

      await waitFor(() => {
        expect(result.current.syncState).toBe('success');
      });
    });

    it('prevents concurrent sync requests', async () => {
      msalState.accounts = [
        { username: 'test@example.com' },
      ];

      let resolveSync: (value: User) => void;
      const syncPromise = new Promise<User>((resolve) => {
        resolveSync = resolve;
      });
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockReturnValue(syncPromise);

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Wait for first sync to start
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Try to sync again while first is in progress
      act(() => {
        result.current.syncUser();
      });

      // Should only call the API once
      expect(msalApiClient.get).toHaveBeenCalledTimes(1);

      // Complete the sync
      act(() => {
        resolveSync!(mockUser);
      });

      await waitFor(() => {
        expect(result.current.syncState).toBe('success');
      });
    });

    it('does not sync when no accounts are available', async () => {
      msalState.accounts = [];

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      act(() => {
        result.current.syncUser();
      });

      // Should not call API
      expect(msalApiClient.get).not.toHaveBeenCalled();
      expect(result.current.syncState).toBe('idle');
    });
  });

  describe('clearUser', () => {
    it('clears user data and resets state', async () => {
      msalState.accounts = [
        { username: 'test@example.com' },
      ];
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Wait for sync to complete
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Clear user
      act(() => {
        result.current.clearUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.syncState).toBe('loading');
      expect(result.current.error).toBeNull();
    });
  });

  describe('automatic sync on authentication', () => {
    it('automatically syncs when account is detected', async () => {
      msalState.accounts = [
        { username: 'test@example.com' },
      ];
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      renderHook(() => useUser(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(msalApiClient.get).toHaveBeenCalledWith(
          mockMsalInstance,
          expect.stringContaining('/api/users/me')
        );
      });
    });

    it('does not auto-sync when no accounts are present', () => {
      msalState.accounts = [];

      renderHook(() => useUser(), { wrapper: TestWrapper });

      expect(msalApiClient.get).not.toHaveBeenCalled();
    });

    it('clears user data when accounts are removed', async () => {
      // Start with account
      msalState.accounts = [{ username: 'test@example.com' }];
      (msalApiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockUser);

      const { result, rerender } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Wait for sync
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      // Simulate logout (no accounts)
      msalState.accounts = [];
      
      // Force re-render to trigger useEffect
      rerender();

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });

      expect(result.current.syncState).toBe('idle');
    });
  });

  describe('manual retry after failure', () => {
    it('allows retry after failed sync', async () => {
      const error = new Error('Network error');
      msalState.accounts = [
        { username: 'test@example.com' },
      ];
      (msalApiClient.get as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(mockUser);

      const { result } = renderHook(() => useUser(), { wrapper: TestWrapper });

      // Wait for first sync to fail
      await waitFor(() => {
        expect(result.current.syncState).toBe('error');
      });

      // Retry
      act(() => {
        result.current.syncUser();
      });

      // Should succeed on retry
      await waitFor(() => {
        expect(result.current.syncState).toBe('success');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(msalApiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
