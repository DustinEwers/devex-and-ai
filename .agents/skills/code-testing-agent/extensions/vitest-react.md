# Vitest + React Testing Library Extension

Language-specific guidance for Cheersly frontend test generation.

## Scope

Use this file for React components, hooks, context providers, frontend services, and utility modules under `src/frontend/src`.

## File Placement

- Prefer `src/frontend/src/__tests__/*.test.ts` for service and utility tests
- Prefer `src/frontend/src/__tests__/*.test.tsx` for components, hooks, and context-related tests
- If an existing test sits next to the feature under test, follow that established pattern instead of moving files

## Framework Conventions

- Use `vitest` imports: `describe`, `it`, `expect`, `beforeEach`, `vi`
- Use React Testing Library for DOM rendering and user interaction
- Use `userEvent` when behavior depends on actual interaction semantics
- Use `vi.mock(...)` for API clients, auth wrappers, and browser-dependent modules
- Clear mocks in `beforeEach` when tests share mocked modules

## Test Commands

| Scope | Command |
|-------|---------|
| All frontend tests | `npm test -- --run` |
| Coverage pass | `npm run test:coverage -- --run` |
| Single file | `npx vitest run src/__tests__/SomeFile.test.ts` |
| Type-check | `npm run type-check` |

Run these commands from `src/frontend`.

## Preferred Assertions

- Prefer user-visible assertions with Testing Library queries for component tests
- Prefer explicit argument assertions for service tests that build API URLs or request payloads
- Assert loading, success, empty, and error states when the component exposes them
- Use `waitFor` only when state changes asynchronously

## Mocking Guidance

- Mock `msal` and API helper modules instead of triggering live auth behavior
- Mock browser APIs only when the code path requires them
- Do not hit the real API base URL or depend on Docker Compose services
- Keep mocked return values close to the actual domain types used in the app

## Cheersly Frontend Priorities

- Query string construction for feed, store, and user-related services
- Rendering behavior for loading, empty, success, and error states
- Role-based UI behavior for admin-only surfaces
- Context providers and hooks that coordinate user sync or auth state
- Formatting or mapping logic that affects points, names, timestamps, or labels

## Avoid

- Snapshot-first tests where direct assertions are clearer
- Tests that depend on CSS implementation details unless the class is itself the behavior under test
- Tests that rely on timers, network latency, or a running backend

## Example

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiClient from '../utils/msalApiClient';
import * as cheerService from '../services/cheerService';

vi.mock('../utils/msalApiClient', () => ({
  get: vi.fn(),
}));

describe('cheerService.getFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiClient.get).mockResolvedValue([]);
  });

  it('uses default paging and sorting values', async () => {
    await cheerService.getFeed({} as never);

    expect(apiClient.get).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('sortBy=createdAt')
    );
  });
});
```