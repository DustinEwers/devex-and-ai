---
title: Frontend User Synchronization with Backend
version: 1.0
date_created: 2025-11-11
last_updated: 2025-11-11
owner: Frontend Team
tags: [infrastructure, frontend, api, authentication, user-management]
---

# Introduction

This specification defines the requirements for synchronizing authenticated users from the frontend React application with the backend API. It establishes how the frontend triggers user creation or updates in the backend database upon successful authentication with Microsoft Entra ID.

## 1. Purpose & Scope

**Purpose**: Define the frontend implementation for automatically synchronizing authenticated users with the backend API, ensuring user records are created or updated in the database upon login.

**Scope**: This specification covers:
- Frontend API client integration with user sync endpoint
- Authentication flow integration for automatic user sync
- Error handling for sync failures
- User context management in React
- Loading states during sync process

**Out of Scope**:
- Backend user sync implementation (covered in separate specification)
- Entra ID authentication configuration (covered in authentication specifications)
- User profile editing functionality
- Point management UI

**Intended Audience**: Frontend developers, React developers, AI code generators

**Assumptions**:
- Microsoft Entra ID authentication is configured and operational in the frontend
- MSAL (Microsoft Authentication Library) is already integrated
- Backend API has user sync endpoint available
- API client infrastructure exists (msalApiClient)

## 2. Definitions

- **User Sync**: Process of sending authenticated user information to backend API to create or update user record
- **MSAL**: Microsoft Authentication Library for JavaScript/React authentication
- **API Client**: HTTP client configured with MSAL interceptor for authenticated requests
- **User Context**: React context providing current user data throughout the application
- **Sync State**: Loading/success/error state of the user synchronization process
- **Silent Sync**: Background synchronization that doesn't block UI interaction

## 3. Requirements, Constraints & Guidelines

### User Sync Flow Requirements

- **REQ-001**: The system MUST trigger user synchronization immediately after successful Entra ID authentication

- **REQ-002**: User sync MUST be performed before the user accesses any protected routes or components

- **REQ-003**: The sync request MUST use the authenticated MSAL token for authorization

- **REQ-004**: The sync process MUST be automatic and require no user interaction

- **REQ-005**: The system MUST handle sync failures gracefully without blocking user login

- **REQ-006**: User sync MUST be idempotent (safe to call multiple times)

- **REQ-007**: The system MUST provide visual feedback during the sync process

- **REQ-008**: Sync failures MUST be logged for debugging purposes

### API Integration Requirements

- **REQ-009**: The frontend MUST make a GET request to `/api/users/me` to trigger sync and retrieve user data

- **REQ-010**: The request MUST include the MSAL Bearer token in the Authorization header

- **REQ-011**: The response MUST contain the complete user object from the backend

- **REQ-012**: The system MUST handle HTTP errors (401, 403, 500) appropriately

- **REQ-013**: Network timeouts MUST be configured (recommended 10 seconds)

- **REQ-014**: Failed sync attempts MUST support retry with exponential backoff

### User Context Requirements

- **REQ-015**: The application MUST maintain a UserContext with the synced user data

- **REQ-016**: User context MUST be populated after successful sync

- **REQ-017**: User context MUST be cleared on logout

- **REQ-018**: User context MUST be accessible to all authenticated components

- **REQ-019**: The system MUST provide loading states for components waiting on user data

### Error Handling Requirements

- **REQ-020**: Authentication failures (401) MUST trigger re-authentication

- **REQ-021**: Authorization failures (403) MUST display appropriate error message

- **REQ-022**: Server errors (500) MUST be logged and allow retry

- **REQ-023**: Network errors MUST display user-friendly messages

- **REQ-024**: Sync errors MUST NOT prevent access to the application if user is authenticated

### State Management Requirements

- **REQ-025**: The system MUST track sync state (idle, loading, success, error)

- **REQ-026**: Loading state MUST be displayed during initial sync

- **REQ-027**: Error state MUST display error message with retry option

- **REQ-028**: Success state MUST populate user context and allow app access

### Constraints

- **CON-001**: User sync MUST complete within 10 seconds or timeout

- **CON-002**: Maximum of 3 retry attempts for failed syncs

- **CON-003**: Retry backoff MUST be exponential (1s, 2s, 4s)

- **CON-004**: User data MUST NOT be cached in localStorage (security)

- **CON-005**: Sync MUST occur on every application load for authenticated users

### Guidelines

- **GUD-001**: Use React hooks for state management (useState, useEffect)

- **GUD-002**: Use React Context API for user data distribution

- **GUD-003**: Display subtle loading indicators during sync

- **GUD-004**: Log all sync events to console in development mode

- **GUD-005**: Use TypeScript for type safety on user data

- **GUD-006**: Implement optimistic UI where possible

### Patterns

- **PAT-001**: Provider Pattern - Use UserProvider wrapping authenticated routes

- **PAT-002**: Hook Pattern - Create useUser() hook for accessing user context

- **PAT-003**: Error Boundary Pattern - Wrap sync logic in error boundary

- **PAT-004**: Retry Pattern - Implement exponential backoff for failed requests

## 4. Interfaces & Data Contracts

### User Sync API Endpoint

**Endpoint**: `GET /api/users/me`

**Headers**:
```typescript
{
  "Authorization": "Bearer {msal_access_token}",
  "Content-Type": "application/json"
}
```

**Response 200 Success**:
```typescript
{
  "id": "guid",
  "email": "user@company.com",
  "firstName": "John",
  "lastName": "Doe",
  "pointsToGive": 50,
  "pointsReceived": 120,
  "createdAt": "2025-11-11T12:00:00Z",
  "lastLoginAt": "2025-11-11T14:30:00Z",
  "lastPointsReset": "2025-11-01T00:00:00Z"
}
```

**Response 401 Unauthorized**:
```typescript
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**Response 500 Server Error**:
```typescript
{
  "error": "Internal Server Error",
  "message": "Failed to sync user"
}
```

### TypeScript Interfaces

```typescript
// User data model
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
}

// User sync state
export type SyncState = 'idle' | 'loading' | 'success' | 'error';

// User context value
export interface UserContextValue {
  user: User | null;
  syncState: SyncState;
  error: Error | null;
  syncUser: () => Promise<void>;
  clearUser: () => void;
  isLoading: boolean;
}

// User sync response
export interface UserSyncResponse {
  data: User;
  success: boolean;
  error?: string;
}
```

### React Context Structure

```typescript
import { createContext, useContext } from 'react';

export const UserContext = createContext<UserContextValue | undefined>(undefined);

export const useUser = (): UserContextValue => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
```

### User Provider Component

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { msalApiClient } from '../utils/msalApiClient';

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { accounts } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [error, setError] = useState<Error | null>(null);

  const syncUser = useCallback(async () => {
    if (!accounts || accounts.length === 0) {
      return;
    }

    setSyncState('loading');
    setError(null);

    try {
      const response = await msalApiClient.get<User>('/api/users/me');
      setUser(response.data);
      setSyncState('success');
    } catch (err) {
      const error = err as Error;
      setError(error);
      setSyncState('error');
      console.error('User sync failed:', error);
    }
  }, [accounts]);

  const clearUser = useCallback(() => {
    setUser(null);
    setSyncState('idle');
    setError(null);
  }, []);

  useEffect(() => {
    if (accounts && accounts.length > 0 && syncState === 'idle') {
      syncUser();
    }
  }, [accounts, syncState, syncUser]);

  const value: UserContextValue = {
    user,
    syncState,
    error,
    syncUser,
    clearUser,
    isLoading: syncState === 'loading',
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
```

### User Sync Hook

```typescript
import { useUser } from '../contexts/UserContext';

export const useUserSync = () => {
  const { user, syncState, error, syncUser, isLoading } = useUser();

  return {
    user,
    isLoading,
    isError: syncState === 'error',
    error,
    retry: syncUser,
    hasUser: user !== null,
  };
};
```

### Integration with App Component

```typescript
import { MsalProvider } from '@azure/msal-react';
import { UserProvider } from './contexts/UserContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </UserProvider>
    </MsalProvider>
  );
}
```

### Loading Component During Sync

```typescript
export const UserSyncGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading, isError, error, retry } = useUserSync();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Syncing your profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Sync Failed</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || 'Unable to sync your profile. Please try again.'}
          </p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

## 5. Acceptance Criteria

- **AC-001**: Given a user successfully authenticates with Entra ID, When the authentication completes, Then a GET request to `/api/users/me` is automatically triggered

- **AC-002**: Given the user sync request succeeds, When the response is received, Then the user data is stored in UserContext and accessible throughout the app

- **AC-003**: Given the user sync is in progress, When the app is loading, Then a loading indicator is displayed to the user

- **AC-004**: Given the user sync fails with a 401 error, When the error occurs, Then the user is redirected to re-authenticate

- **AC-005**: Given the user sync fails with a 500 error, When the error occurs, Then an error message is displayed with a retry button

- **AC-006**: Given a user logs out, When the logout completes, Then the user context is cleared and no user data remains

- **AC-007**: Given the user sync request times out, When 10 seconds elapse, Then the request is cancelled and an error is shown

- **AC-008**: Given a sync retry is attempted, When the retry button is clicked, Then a new sync request is made with exponential backoff

- **AC-009**: Given the user data is successfully synced, When components use the useUser hook, Then they have access to current user data including points

- **AC-010**: Given the user accesses the app on subsequent visits, When they are already authenticated, Then the sync process triggers automatically

## 6. Test Automation Strategy

### Test Levels

- **Unit Tests**: Test individual hooks, components, and utilities
- **Integration Tests**: Test interaction between authentication, sync, and context
- **End-to-End Tests**: Test complete user login and sync flow with real backend

### Frameworks

- **Vitest**: Primary testing framework for React components and hooks
- **React Testing Library**: For testing React component behavior
- **MSW (Mock Service Worker)**: For mocking API requests in tests

### Test Data Management

- Use mock MSAL accounts for authentication tests
- Mock API responses for sync testing
- Create test fixtures for user data
- Reset all mocks between tests

### CI/CD Integration

- Run tests on all pull requests
- Require tests to pass before merge
- Generate coverage reports (target >80%)
- Run E2E tests against staging environment

### Coverage Requirements

- Minimum 80% code coverage for context and hooks
- 100% coverage for error handling paths
- All acceptance criteria must have corresponding tests

### Performance Testing

- Measure sync completion time (target < 2 seconds)
- Test behavior under slow network conditions
- Verify proper cleanup on unmount

## 7. Rationale & Context

### Why Sync on Every Login?

Syncing on every login ensures:
- User data is always current (name changes, point balances)
- LastLoginAt tracking for analytics
- No separate onboarding flow needed
- Backend can update user records from Entra changes

### Why Use a Dedicated Endpoint?

Using `/api/users/me` provides:
- RESTful convention for current user data
- Server-side control over sync logic
- Easy to implement and understand
- Consistent with common API patterns

### Why React Context for User Data?

React Context provides:
- Global access to user data without prop drilling
- Clean separation of concerns
- Easy to test and mock
- Built-in React solution (no extra dependencies)

### Why Automatic Sync Instead of Manual?

Automatic synchronization:
- Reduces user friction
- Ensures data consistency
- Eliminates onboarding steps
- Provides better user experience

### Why Allow App Access on Sync Failure?

Allowing access on sync failure:
- Prevents authentication from blocking user
- Enables graceful degradation
- User can still logout and try again
- Some features may still work

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: Microsoft Entra ID - OAuth authentication provider
  - Required for user authentication tokens
  - Integration type: MSAL library

- **EXT-002**: Cheersly Backend API - User management service
  - Required endpoint: GET /api/users/me
  - Integration type: HTTP REST API

### Third-Party Libraries

- **LIB-001**: @azure/msal-react - Microsoft Authentication Library for React
  - Required capabilities: Authentication, token acquisition
  - Version: Compatible with React 18+

- **LIB-002**: @azure/msal-browser - MSAL browser package
  - Required capabilities: Browser-based authentication flows
  - Version: Compatible with msal-react

- **LIB-003**: axios or fetch - HTTP client for API requests
  - Required capabilities: HTTP requests with interceptors
  - Version: Latest stable

### Infrastructure Dependencies

- **INF-001**: React Application
  - Version: React 18+
  - Required features: Context API, Hooks

- **INF-002**: TypeScript
  - Version: 5.0+
  - Required for type safety

- **INF-003**: React Router
  - Version: 6+
  - Required for protected route handling

### Data Dependencies

- **DAT-001**: MSAL Access Token
  - Format: JWT Bearer token
  - Frequency: On each authenticated request
  - Access requirements: Valid Entra app registration

- **DAT-002**: User Profile from Backend
  - Format: JSON response from /api/users/me
  - Frequency: On each login/app load
  - Access requirements: Valid authentication

## 9. Examples & Edge Cases

### Example: First Time User Login

```typescript
// User logs in for the first time
// 1. MSAL authenticates successfully
// 2. UserProvider detects authenticated account
// 3. syncUser() is called automatically

const response = await msalApiClient.get('/api/users/me');
// Response:
// {
//   "id": "new-guid",
//   "email": "alice@company.com",
//   "firstName": "Alice",
//   "lastName": "Smith",
//   "pointsToGive": 50,
//   "pointsReceived": 0,
//   "createdAt": "2025-11-11T15:00:00Z",
//   "lastLoginAt": "2025-11-11T15:00:00Z"
// }

// User context is populated and app becomes accessible
```

### Example: Returning User Login

```typescript
// Existing user logs in
// Backend updates LastLoginAt and returns current data

const response = await msalApiClient.get('/api/users/me');
// Response:
// {
//   "id": "existing-guid",
//   "email": "bob@company.com",
//   "firstName": "Bob",
//   "lastName": "Jones",
//   "pointsToGive": 35,  // Already gave away 15 points
//   "pointsReceived": 120,  // Accumulated points
//   "createdAt": "2025-10-01T10:00:00Z",
//   "lastLoginAt": "2025-11-11T15:05:00Z"  // Just updated
// }
```

### Example: Using User Data in Component

```typescript
import { useUser } from '../contexts/UserContext';

export const UserProfile: React.FC = () => {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="user-profile">
      <h2>{user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      <p>Points to Give: {user.pointsToGive}</p>
      <p>Points Received: {user.pointsReceived}</p>
    </div>
  );
};
```

### Example: Protected Route with Sync Guard

```typescript
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <UserSyncGuard>
        <Dashboard />
      </UserSyncGuard>
    </ProtectedRoute>
  }
/>
```

### Edge Case: Sync During Page Refresh

```typescript
// User refreshes page while authenticated
useEffect(() => {
  // MSAL will maintain session
  // UserProvider will detect account
  // Sync will trigger automatically
  if (accounts && accounts.length > 0 && syncState === 'idle') {
    syncUser();
  }
}, [accounts, syncState, syncUser]);
```

### Edge Case: Network Timeout

```typescript
// Sync request times out after 10 seconds
try {
  const response = await msalApiClient.get('/api/users/me', {
    timeout: 10000
  });
} catch (err) {
  if (err.code === 'ECONNABORTED') {
    setError(new Error('Request timed out. Please check your connection.'));
    setSyncState('error');
  }
}
```

### Edge Case: Token Expired During Sync

```typescript
// Token expires while making sync request
try {
  const response = await msalApiClient.get('/api/users/me');
} catch (err) {
  if (err.response?.status === 401) {
    // MSAL interceptor will handle token refresh
    // Retry the request automatically
    console.log('Token refreshed, retrying sync');
  }
}
```

### Edge Case: Concurrent Sync Requests

```typescript
// Prevent multiple simultaneous sync requests
const [isSyncing, setIsSyncing] = useState(false);

const syncUser = useCallback(async () => {
  if (isSyncing) {
    console.log('Sync already in progress, skipping');
    return;
  }

  setIsSyncing(true);
  setSyncState('loading');

  try {
    const response = await msalApiClient.get('/api/users/me');
    setUser(response.data);
    setSyncState('success');
  } finally {
    setIsSyncing(false);
  }
}, [isSyncing]);
```

### Edge Case: User Data Changed in Backend

```typescript
// User's name was updated in Entra ID
// On next login, backend syncs from Entra and returns updated data

// Previous user data:
// { firstName: "Robert", lastName: "Smith" }

// After sync:
// { firstName: "Bob", lastName: "Smith" }  // Name updated
```

## 10. Validation Criteria

### Code Review Checklist

- [ ] UserContext is properly typed with TypeScript interfaces
- [ ] User sync triggers automatically on authentication
- [ ] Loading states are displayed during sync
- [ ] Error handling covers all HTTP error codes (401, 403, 500)
- [ ] Network timeouts are configured appropriately
- [ ] User context is cleared on logout
- [ ] Components use useUser hook for accessing user data
- [ ] Retry logic implements exponential backoff
- [ ] All async operations use proper error boundaries
- [ ] Console logs are only in development mode

### Testing Checklist

- [ ] All acceptance criteria have automated tests
- [ ] Unit tests cover UserContext, useUser hook, and UserProvider
- [ ] Integration tests verify sync flow with mocked API
- [ ] Tests verify error handling for all failure scenarios
- [ ] Tests verify loading states are shown appropriately
- [ ] Tests verify user context is cleared on logout
- [ ] E2E tests verify complete login-to-sync flow
- [ ] Tests verify retry logic with exponential backoff
- [ ] Tests verify timeout behavior
- [ ] Performance tests verify sync completes within acceptable time

### User Experience Checklist

- [ ] Loading indicator provides clear feedback
- [ ] Error messages are user-friendly and actionable
- [ ] Retry button is easily accessible on errors
- [ ] No flash of unauthenticated content (FOUC)
- [ ] Sync completes quickly (< 2 seconds typically)
- [ ] App remains responsive during sync
- [ ] User can navigate away if sync is taking too long
- [ ] Visual feedback for all sync states (loading, success, error)

## 11. Related Specifications / Further Reading

- [Cheersly Authentication with Microsoft Entra ID](/workspaces/cheersly/docs/auth-entra.md)
- [Frontend Microsoft Entra Authentication Specification](/workspaces/cheersly/spec/spec-infrastructure-frontend-microsoft-entra-auth.md)
- [Backend User Data Tracking Specification](/workspaces/cheersly/spec/spec-data-user-tracking.md)
- [Application Functions Specification](/workspaces/cheersly/spec/app-functions.md)
- [React Context API Documentation](https://react.dev/reference/react/useContext)
- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- Future: Point Management UI Specification
- Future: User Profile Editing Specification
