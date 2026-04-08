---
title: Microsoft Entra Frontend Authentication (SSO) for Cheersly
version: 1.0
date_created: 2025-11-10
last_updated: 2025-11-10
owner: Frontend/API Teams / Cheersly
tags: [infrastructure, authentication, frontend, sso, api]
---

# Introduction

This specification defines how to add Microsoft Entra ID (Azure AD) single sign-on (SSO) support to the Cheersly frontend (Vite + React + TypeScript) so that users are automatically authenticated to the web app and the frontend can securely obtain access tokens to call the Cheersly API.

The document is AI-friendly and self-contained and describes configuration, runtime contracts, required environment variables, code integration points, acceptance criteria, tests, and edge cases.

## 1. Purpose & Scope

Purpose: Provide concrete, testable guidance to implement SSO on the frontend using MSAL (Microsoft Authentication Library), enable automatic sign-in when a user has an Entra session, and ensure the frontend can obtain and attach an access token to API requests.

Scope:
- Applies to the `src/frontend` React application in this repository.
- Covers MSAL configuration, app wiring, token acquisition patterns (silent & interactive), sending the access token to the backend, and handling failure modes (401/403).
- Does not cover how to register the Entra app in the Azure portal step-by-step; it does include required registration outputs (client id, redirect URIs, scopes).

Intended audience: Frontend engineers, DevOps, security reviewers, and automated code generators.

Assumptions:
- Frontend is built with Vite + React + TypeScript.
- Backend API expects a Bearer token in the Authorization header and is configured to validate Entra issued tokens (see API spec).
- The organization has (or will create) an Entra app registration for the frontend and one for the API (or a single app exposing scopes).

## 2. Definitions

- MSAL: Microsoft Authentication Library for browser and React.
- SSO: Single Sign-On — user already signed into Entra in the browser session.
- Access Token: OAuth 2.0 token used to authorize API calls.
- ID Token: OIDC token representing the user identity (not used for API auth).
- Scope: Permission string used when requesting an access token (e.g., `api://<api-client-id>/user_impersonation`).

## 3. Requirements, Constraints & Guidelines

- **REQ-FRONT-001**: The frontend must perform automatic SSO (silent sign-in) when a user has an active Entra session and then redirect to the app UI.
- **REQ-FRONT-002**: The frontend must use MSAL (recommended packages: `@azure/msal-browser` and `@azure/msal-react`) for authentication flows.
- **REQ-FRONT-003**: The frontend must obtain an access token for the backend API scope and include it as `Authorization: Bearer <token>` on API requests.
- **REQ-FRONT-004**: The frontend must fall back to an interactive signin (redirect or popup) when silent SSO or token acquisition fails.
- **REQ-FRONT-005**: The frontend must store only ephemeral session state in browser memory or sessionStorage; long-term secrets must not be stored client-side.
- **REQ-FRONT-006**: The frontend must be configurable using Vite environment variables (prefixed `VITE_`) and not contain secrets in source control.
- **REQ-FRONT-007**: Auth UI (sign-in/out) must be accessible and display meaningful errors when sign-in fails.
- **GUD-FRONT-001**: Prefer redirect-based interactive flows for compatibility with third-party cookie blockers; use popup flows for developer convenience.
- **CON-FRONT-001**: Third-party cookie blocking may prevent silent authentication in some browsers. The UX must handle that gracefully and require interactive sign-in.

## 4. Interfaces & Data Contracts

Configuration environment variables (Vite):

- `VITE_ENTRA_CLIENT_ID` — frontend application (client) id registered in Entra.
- `VITE_ENTRA_AUTHORITY` — authority URL, e.g. `https://login.microsoftonline.com/<tenant-id>/v2.0` or `https://login.microsoftonline.com/common/v2.0`.
- `VITE_ENTRA_REDIRECT_URI` — redirect URI registered for the frontend (e.g., `http://localhost:5173/`).
- `VITE_ENTRA_API_SCOPE` — scope for the backend API, e.g. `api://<api-client-id>/user_impersonation` or `<api-client-id>/.default`.
- `VITE_ENTRA_SILENT_IFRAME` (optional) — boolean; whether to try an iframe-based silent SSO before interactive.

MSAL config contract (example - exported from `src/authConfig.ts`):

```ts
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: import.meta.env.VITE_ENTRA_AUTHORITY,
    redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access']
};

export const apiRequest = {
  scopes: [import.meta.env.VITE_ENTRA_API_SCOPE]
};
```

Token acquisition flow (high-level):

1. On app start, MSAL attempts silent SSO (accountFromCache or acquireTokenSilent).
2. If silent SSO succeeds and an access token for the API scope is obtained, set the authenticated state and proceed.
3. If silent SSO fails with an interaction_required or similar error, initiate interactive sign-in (redirect or popup). After success, acquire token and set authenticated state.
4. For each API call, call a token helper to `acquireTokenSilent` for `apiRequest.scopes`; if that fails, trigger interactive flow or surface an error.

HTTP contract between frontend and backend:

- Requests: Include `Authorization: Bearer <access_token>` header.
- Backend responses: 401 when token missing/invalid; 403 when token valid but lacks required role/claim.

## 5. Acceptance Criteria

- **AC-001**: Given a user with an active Entra sign-in in the browser, When they open the Cheersly app, Then the app performs silent SSO (no UX interaction) and displays the authenticated UI.
- **AC-002**: Given a successful authentication, When the frontend calls the backend API, Then the call includes a valid access token in the Authorization header and receives a 2xx response.
- **AC-003**: Given silent SSO failure due to no session or browser restrictions, When the app proceeds, Then the app initiates an interactive sign-in flow and successfully signs in the user.
- **AC-004**: Given an expired or revoked token, When the app attempts `acquireTokenSilent`, Then it triggers an interactive flow and handles errors gracefully.
- **AC-005**: Given no token and attempt to access protected resource, When the backend responds 401, Then the frontend re-tries token acquisition and presents sign-in UI if necessary.

## 6. Test Automation Strategy

- Unit tests:
  - Test MSAL wrapper utilities (account lookup, request object creation).
  - Mock `@azure/msal-browser` to assert correct calls to `acquireTokenSilent` and the fallback to interactive flows.
- Integration tests:
  - Use `msal-browser` with a local test OAuth server or mock the network calls (OIDC discovery and JWKS) to verify token acquisition flows and that the app attaches Authorization headers.
  - Use `@testing-library/react` to assert login state transitions and UI behavior when tokens succeed/fail.
- End-to-end tests:
  - Use Playwright or Cypress and a test Entra tenant or a local OpenID Connect test provider to simulate SSO and interactive flows.
  - Validate that opening the app with an existing Entra session results in no-interaction sign-in.
- CI integration:
  - Run unit and integration tests in CI.
  - Optionally run an E2E job against a staging tenant (requires secrets/config in pipeline).

Test data management:
- For unit tests, mock tokens and MSAL behaviors.
- For integration/E2E, use short-lived test accounts and a dedicated test tenant or test OIDC server.

## 7. Rationale & Context

- MSAL is maintained by Microsoft; using the official client reduces risk and handles complex cases like key rollover, caching, and silent token renewal.
- Redirect-based interactive flows are more robust in restrictive browsers; popups are convenient for dev environments.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Microsoft Entra ID — issues tokens and manages user sessions.

### Third-Party Libraries
- **SVC-001**: `@azure/msal-browser` — MSAL core for browser.
- **SVC-002**: `@azure/msal-react` — React bindings.

### Infrastructure & Platform
- **INF-001**: TLS for served frontend assets and backend API.
- **INF-002**: CORS configuration allowing frontend origin to call the API and accept Authorization headers.

### Data Dependencies
- **DAT-001**: The backend expects access token claims as defined in the API spec (audience, scopes/roles).

## 9. Examples & Edge Cases

Example `src/authConfig.ts` (Vite + TS):

```ts
// src/authConfig.ts
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_ENTRA_CLIENT_ID,
    authority: import.meta.env.VITE_ENTRA_AUTHORITY,
    redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  }
};

export const loginRequest = { scopes: ['openid', 'profile', 'offline_access'] };
export const apiRequest = { scopes: [import.meta.env.VITE_ENTRA_API_SCOPE] };
```

Example `src/msalApiClient.ts` helper (conceptual):

```ts
import { PublicClientApplication, AuthenticationResult } from '@azure/msal-browser';
import { apiRequest } from './authConfig';

export async function getApiToken(pca: PublicClientApplication): Promise<string> {
  const accounts = pca.getAllAccounts();
  const account = accounts[0];
  if (!account) throw new Error('no-account');

  const silentRequest = { ...apiRequest, account };
  try {
    const result: AuthenticationResult = await pca.acquireTokenSilent(silentRequest);
    return result.accessToken;
  } catch (err) {
    // If silent fails due to interaction required, rethrow a well-known error so caller can trigger interactive flow
    throw err;
  }
}
```

Example integration in `main.tsx` (conceptual): create `PublicClientApplication` and wrap with `MsalProvider`.

Edge cases and mitigation:
- Browser third-party cookie blocking prevents silent iframe SSO. Mitigation: fall back to interactive redirect flow and clearly explain to users in UI.
- Multiple accounts in same browser session — select the correct account (or prompt) when `getAllAccounts()` returns multiple entries.
- Pop-up blocked by browser — fall back to redirect flow.
- Long-lived sessions revoked — handle 401 responses from backend by clearing cached accounts and forcing interactive sign-in.

## 10. Validation Criteria

- Code exists that reads `VITE_` environment variables and constructs `msalConfig`, `loginRequest`, and `apiRequest`.
- App attempts silent SSO on initial load and falls back to interactive sign-in if required.
- Access tokens are attached to API requests (Authorization header) and the API accepts them (integration test).
- Unit and integration tests cover acceptance criteria AC-001 through AC-005.

## 11. Related Specifications / Further Reading

- `spec/spec-infrastructure-microsoft-entra-auth.md` — API-side Entra authentication (this repo).
- MSAL React docs: https://learn.microsoft.com/azure/active-directory/develop/msal-react
- MSAL Browser docs: https://learn.microsoft.com/azure/active-directory/develop/msal-browser

---

Next steps (suggested implementations):
- Add `@azure/msal-browser` and `@azure/msal-react` to `src/frontend/package.json` dependencies.
- Create `src/authConfig.ts`, `src/msalApiClient.ts`, update `src/main.tsx` to wrap the app with `MsalProvider`, and add sign-in/out controls to `src/App.tsx`.
- Add CI integration tests or a staging E2E run that uses a test Entra tenant.
