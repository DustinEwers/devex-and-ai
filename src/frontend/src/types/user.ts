/**
 * User data model matching the backend User entity
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  pointsToGive: number;
  pointsReceived: number;
  createdAt: string;
  lastLoginAt: string;
  lastPointsReset: string;
  role?: string;
}

/**
 * User synchronization state
 */
export type SyncState = 'idle' | 'loading' | 'success' | 'error';

/**
 * User context value provided to consumers
 */
export interface UserContextValue {
  user: User | null;
  syncState: SyncState;
  error: Error | null;
  syncUser: () => Promise<void>;
  clearUser: () => void;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}
