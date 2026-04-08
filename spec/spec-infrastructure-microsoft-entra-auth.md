---
title: Microsoft Entra Authentication for Cheersly API
version: 1.0
date_created: 2025-11-10
last_updated: 2025-11-10
owner: API Team / Cheersly
tags: [infrastructure, authentication, security, api]
---

# Introduction

This specification defines how to integrate Microsoft Entra ID (formerly Azure Active Directory) authentication into the Cheersly API (.NET 10.0). The goal is to provide clear, testable, and unambiguous requirements for secure token-based authentication and role-based authorization for API endpoints.

## 1. Purpose & Scope

Purpose: Enable the Cheersly API to authenticate and authorize callers using Microsoft Entra ID, providing a secure mechanism for single- or multi-tenant OAuth 2.0/OpenID Connect tokens, role-based access control (RBAC) for Admin vs Normal users, and token validation.

Scope:
- Applies to the `Cheersly.Api` project in the repository.
- Covers configuration, validation, claims mapping, required roles/permissions, and testable acceptance criteria.
- Does not prescribe UI flows for login (frontend) but defines the API-side requirements to accept and validate access tokens issued by Entra.

Intended audience: API engineers, DevOps, security reviewers, and automated agents generating code/config for the API.

Assumptions:
- The API runs on .NET 10.0 (as in the project) and is hosted in environments that can reach Microsoft Entra endpoints.
- The organization uses Microsoft Entra ID as the identity provider; tenants and app registrations can be created as needed.

## 2. Definitions

- Microsoft Entra ID: Microsoft's identity and access management service (formerly Azure AD).
- OAuth 2.0: Authorization framework used to issue access tokens.
- OpenID Connect (OIDC): Identity layer on top of OAuth 2.0; issues ID tokens.
- Access token: JWT or other token used to authorize API calls.
- Id token: JWT used to represent the authenticated user (not typically sent to API for authorization).
- Tenant: Entra tenant (organization). Can be single-tenant or multi-tenant.
- RBAC: Role-Based Access Control.

## 3. Requirements, Constraints & Guidelines

- **REQ-AUTH-001**: The API must accept and validate OAuth 2.0 Bearer tokens issued by Microsoft Entra ID using standard JWT validation (issuer, audience, signature, expiry).
- **REQ-AUTH-002**: The API must support configuration for both single-tenant and multi-tenant Entra scenarios. Default for development: single-tenant.
- **REQ-AUTH-003**: The API must map Entra roles/claims to application roles: at minimum `Admin` and `Normal`. Mapping must be configurable.
- **REQ-AUTH-004**: Requests to protected endpoints must fail with HTTP 401 for missing/invalid tokens and HTTP 403 for authenticated users without the required role/permission.
- **REQ-AUTH-005**: Token validation must reject tokens that are expired, have invalid signatures, wrong audience, or incorrect issuer.
- **REQ-AUTH-006**: The API must use secure TLS (HTTPS) in all deployment environments.
- **REQ-AUTH-007**: Secrets (client secrets) must never be stored in source control. Use environment variables or secret stores (Key Vault) in production.
- **REQ-AUTH-008**: The API should include middleware logging for auth failures with no PII in logs; logs must include correlation id and failure reason (signature/expiry/audience) when safe.
- **GUD-AUTH-001**: Prefer use of Microsoft.Identity.Web or Microsoft.AspNetCore.Authentication.JwtBearer for token validation to reduce implementation errors.
- **CON-AUTH-001**: Avoid in-app token generation or custom signature validation unless necessary; rely on proven libraries.

## 4. Interfaces & Data Contracts

Configuration (example keys - implementation must be environment-specific):

- `Entra:TenantId` - Tenant identifier (GUID) or `common` for multi-tenant.
- `Entra:ClientId` - API/Application (resource) client id (application ID) registered in Entra.
- `Entra:Audience` - Expected audience for tokens (can be same as ClientId).
- `Entra:Authority` - Authority URL, e.g., `https://login.microsoftonline.com/{TenantId}/v2.0`.

Example appsettings.json snippet (illustrative only):

```json
{
  "Entra": {
    "TenantId": "<tenant-id-or-common>",
    "ClientId": "<api-client-id>",
    "Authority": "https://login.microsoftonline.com/<tenant-id>/v2.0",
    "Audience": "api://<api-client-id>"
  }
}
```

Program.cs / Startup integration (conceptual):

- Add authentication and JWT bearer validation middleware configured to validate issuer, audience, lifetime, and signature using Microsoft-provided metadata (jwks endpoints).
- Map incoming claims (like `roles` or `roles` in `roles` claim, or `groups`) to application roles.

Authorization policy examples:

- `RequireRole("Admin")` — restrict admin-only controllers/actions.
- `RequireAuthenticatedUser()` — for general authenticated endpoints.

Claims mapping rules (examples):

- If token contains `roles` claim with value `admin` or `Admin`, map to application role `Admin`.
- If token contains `email` or `preferred_username`, map to `UserName` in API logs/claims principal.

Security contract:

- The API will accept Authorization: Bearer <token> header.
- The API will validate token signature using the JWKs endpoint discovered from the authority's well-known configuration.

## 5. Acceptance Criteria

- **AC-001**: Given a valid Entra-issued access token for the API audience, When the token is sent in the Authorization header, Then the API accepts the request and treats the caller as authenticated.
- **AC-002**: Given a token with `roles` claim containing `Admin`, When the token is sent to an Admin-only endpoint, Then the API returns success (200/2xx) for authorized actions.
- **AC-003**: Given a token that is expired or forged, When the token is sent, Then the API returns HTTP 401 and logs the reason (expiry/signature) without PII.
- **AC-004**: Given a valid token lacking required role, When requesting an Admin-only endpoint, Then the API returns HTTP 403.
- **AC-005**: Given no token, When requesting a protected endpoint, Then the API returns HTTP 401.

## 6. Test Automation Strategy

- Test Levels: Unit tests for claims mapping and policy evaluation; Integration tests using the ASP.NET Core TestServer or WebApplicationFactory to exercise middleware with mocked tokens.
- Frameworks: xUnit (project already contains tests), FluentAssertions, Moq, and Microsoft.IdentityModel.Tokens for creating test tokens.
- Test Data Management: Generate short-lived test tokens signed with a test RSA key (not production keys). Use a local JWKS endpoint during tests or mock the configuration manager.
- CI/CD Integration: Run unit and integration tests in GitHub Actions; add a job step that runs tests and fails the build on auth-related regressions.
- Coverage Requirements: Security-critical areas (token validation and role enforcement) must be covered by tests. A practical target: tests for all acceptance criteria above.
- Performance Testing: Ensure token validation does not add significant latency; cache metadata (discovery/JWKS) and use built-in configuration managers which cache keys.

## 7. Rationale & Context

- Using Microsoft Entra ID provides enterprise-grade identity, single sign-on, and managed key rollover for JWT validation.
- Using standard libraries (Microsoft.Identity.Web or JwtBearer) reduces attack surface and maintenance.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Microsoft Entra ID - Issues OAuth 2.0 / OIDC tokens used to authenticate API calls.

### Third-Party Services
- **SVC-001**: Optional: Azure Key Vault - secure storage for client secrets in production.

### Infrastructure Dependencies
- **INF-001**: TLS termination (load balancer or host) with valid certificates for all production endpoints.

### Data Dependencies
- **DAT-001**: Token claims delivered by Entra (roles, preferred_username, email) are relied upon for RBAC mapping.

### Technology Platform Dependencies
- **PLT-001**: .NET 10.0 runtime.
- **PLT-002**: Recommended libraries: Microsoft.Identity.Web, Microsoft.AspNetCore.Authentication.JwtBearer, Microsoft.IdentityModel.Tokens.

### Compliance Dependencies
- **COM-001**: Ensure logging and telemetry meet data protection policies (no storage of full tokens or PII in logs).

## 9. Examples & Edge Cases

Example: Protecting a controller endpoint in .NET 9.0 (conceptual):

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = configuration["Entra:Authority"];
        options.Audience = configuration["Entra:Audience"];
        // additional token validation parameters as needed
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy =>
        policy.RequireRole("Admin"));
});

[Authorize(Policy = "RequireAdmin")]
public class AdminController : ControllerBase { }
```

Edge cases:
- Multi-tenant tokens where issuer varies per tenant — ensure issuer validation allows configured patterns or uses the OIDC metadata for each tenant.
- Tokens using `scp` (scopes) vs `roles` — if clients call via delegated permissions, evaluate scopes as well as roles when appropriate.
- Groups claim can be large — prefer role claims for RBAC; if groups are used, use group id checks rather than full group lists when possible.

## 10. Validation Criteria

- Unit tests exist for claims mapping and policy enforcement.
- Integration tests validate rejected tokens (expired, wrong audience) produce 401 and missing permissions produce 403.
- CI pipeline runs tests on PRs and fails on regressions.

## 11. Related Specifications / Further Reading

- Microsoft Identity platform documentation: https://learn.microsoft.com/azure/active-directory
- Microsoft.Identity.Web GitHub: https://github.com/AzureAD/microsoft-identity-web
- OAuth 2.0 and OpenID Connect specs: https://openid.net/specs/

---

Notes and assumptions:
- This spec intentionally avoids pinned package versions. Implementation should pick stable, supported versions compatible with .NET 10.0.
- If the org requires multi-tenant default behavior, update `REQ-AUTH-002` to require multi-tenant tests and tenant discovery logic.
