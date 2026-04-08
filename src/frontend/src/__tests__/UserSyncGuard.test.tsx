import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSyncGuard } from '../components/UserSyncGuard';
import { UserContext } from '../contexts/UserContext';
import { UserContextValue } from '../types/user';

// Mock user context values
const createMockContext = (overrides: Partial<UserContextValue> = {}): UserContextValue => ({
  user: null,
  syncState: 'idle',
  error: null,
  syncUser: vi.fn(),
  clearUser: vi.fn(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  ...overrides,
});

describe('UserSyncGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('displays loading indicator when sync is in progress', () => {
      const mockContext = createMockContext({
        syncState: 'loading',
        isLoading: true,
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Syncing your profile...')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we load your data.')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('displays spinning animation during loading', () => {
      const mockContext = createMockContext({
        syncState: 'loading',
        isLoading: true,
      });

      const { container } = render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('displays error message when sync fails', () => {
      const mockContext = createMockContext({
        syncState: 'error',
        isError: true,
        error: new Error('Network connection failed'),
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Sync Failed')).toBeInTheDocument();
      expect(screen.getByText('Network connection failed')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('displays default error message when error has no message', () => {
      const mockContext = createMockContext({
        syncState: 'error',
        isError: true,
        error: new Error(),
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Unable to sync your profile. Please try again.')).toBeInTheDocument();
    });

    it('displays default error message when error is null', () => {
      const mockContext = createMockContext({
        syncState: 'error',
        isError: true,
        error: null,
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Unable to sync your profile. Please try again.')).toBeInTheDocument();
    });

    it('displays retry button on error', () => {
      const mockContext = createMockContext({
        syncState: 'error',
        isError: true,
        error: new Error('Sync failed'),
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls syncUser when retry button is clicked', async () => {
      const user = userEvent.setup();
      const syncUserMock = vi.fn();
      const mockContext = createMockContext({
        syncState: 'error',
        isError: true,
        error: new Error('Sync failed'),
        syncUser: syncUserMock,
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(syncUserMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('success state', () => {
    it('renders children when sync is successful', () => {
      const mockContext = createMockContext({
        syncState: 'success',
        isSuccess: true,
        user: {
          id: '123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          pointsToGive: 50,
          pointsReceived: 100,
          createdAt: '2025-01-01T00:00:00Z',
          lastLoginAt: '2025-11-11T10:00:00Z',
          lastPointsReset: '2025-11-01T00:00:00Z',
        },
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Syncing your profile...')).not.toBeInTheDocument();
      expect(screen.queryByText('Sync Failed')).not.toBeInTheDocument();
    });

    it('renders multiple children when sync is successful', () => {
      const mockContext = createMockContext({
        syncState: 'success',
        isSuccess: true,
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>First Child</div>
            <div>Second Child</div>
            <div>Third Child</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
      expect(screen.getByText('Third Child')).toBeInTheDocument();
    });
  });

  describe('idle state', () => {
    it('renders children when in idle state (not loading or error)', () => {
      const mockContext = createMockContext({
        syncState: 'idle',
        isLoading: false,
        isError: false,
      });

      render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('state transitions', () => {
    it('transitions from loading to success', async () => {
      const mockContext = createMockContext({
        syncState: 'loading',
        isLoading: true,
      });

      const { rerender } = render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Syncing your profile...')).toBeInTheDocument();

      // Update to success state
      const successContext = createMockContext({
        syncState: 'success',
        isSuccess: true,
      });

      rerender(
        <UserContext.Provider value={successContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
      expect(screen.queryByText('Syncing your profile...')).not.toBeInTheDocument();
    });

    it('transitions from loading to error', async () => {
      const mockContext = createMockContext({
        syncState: 'loading',
        isLoading: true,
      });

      const { rerender } = render(
        <UserContext.Provider value={mockContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      expect(screen.getByText('Syncing your profile...')).toBeInTheDocument();

      // Update to error state
      const errorContext = createMockContext({
        syncState: 'error',
        isError: true,
        error: new Error('Failed to load'),
      });

      rerender(
        <UserContext.Provider value={errorContext}>
          <UserSyncGuard>
            <div>Protected Content</div>
          </UserSyncGuard>
        </UserContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Sync Failed')).toBeInTheDocument();
      });
      expect(screen.queryByText('Syncing your profile...')).not.toBeInTheDocument();
    });
  });
});
