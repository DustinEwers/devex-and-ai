---
title: Cheer Feed Visual Refresh and Discovery Controls
version: 1.0
date_created: 2026-04-08
last_updated: 2026-04-08
owner: Product and Frontend Team
tags: [design, app, feed, ui, ux]
---

# Introduction

This specification defines the Cheer feed user experience refresh focused on visual simplification, denser presentation, and better discovery through sorting and filtering.

## 1. Purpose & Scope

**Purpose**: Define implementation-ready UI, interaction, and API query behavior for updating the main Cheer feed to be more compact, visually consistent, and easier to navigate.

**Scope**:
- Main feed layout and visual styling changes
- Feed hero area replacement for the page title region
- Sorting and filtering controls, including "Cheers directed at me"
- Top-corner account menu placement for user name and role
- Accessibility, validation, and acceptance criteria for these changes

**Out of Scope**:
- Cheer creation flow
- Point transfer logic and backend transaction behavior
- New authentication and authorization models
- Full design system replacement outside the feed surfaces

**Intended Audience**: Frontend engineers, API engineers, product designers, QA engineers, AI code generators.

**Assumptions**:
- Existing feed endpoints already return sender, recipients, message, and created timestamp data.
- Authenticated user identity is available in frontend state for "directed at me" filtering.
- Existing role-based authorization remains unchanged.

## 2. Definitions

- **Cheer Feed**: Chronological list of recognition posts shown on the main page.
- **Compact Card**: Feed card variant that reduces vertical spacing and decorative effects while preserving readability.
- **Hero Area**: The top feed section replacing a plain text title with image-backed header content.
- **Directed at Me**: A Cheer where the authenticated user appears in recipients.
- **Filter State**: Active set of filter parameters applied to the feed query.
- **Sort State**: Selected ordering rule and direction for feed results.
- **Account Menu**: Top-right menu displaying authenticated user metadata and account actions.

## 3. Requirements, Constraints & Guidelines

### Functional Requirements

- **REQ-001**: The feed MUST remove yellow accent bars and yellow glow effects from Cheer cards.
- **REQ-002**: The feed MUST use a simplified blue-led palette aligned with existing dark mode tokens and MUST NOT use yellow highlight gradients in feed cards.
- **REQ-003**: The feed MUST provide sort controls with these options:
  - `Newest first` (default)
  - `Oldest first`
  - `Highest points first`
  - `Lowest points first`
- **REQ-004**: The feed MUST provide filter controls including:
  - `All cheers` (default)
  - `Directed at me`
- **REQ-005**: The `Directed at me` filter MUST include only Cheers where authenticated user ID exists in recipient IDs.
- **REQ-006**: Sort and filter controls MUST be combinable and applied together in feed queries.
- **REQ-007**: The feed MUST provide a visible `Reset` action that restores default sort and filter values.
- **REQ-008**: User name and role MUST be displayed in the top-right account menu on feed pages and MUST NOT appear as duplicated standalone feed header metadata.
- **REQ-009**: The feed title region MUST be replaced with a hero area that supports image, heading text, and short supporting copy.
- **REQ-010**: Hero area MUST support fallback behavior when image is unavailable (gradient-free solid background with the same heading and copy).
- **REQ-011**: Feed cards MUST use compact spacing tokens so the viewport shows more items than the current baseline layout at identical viewport height.

### Security Requirements

- **SEC-001**: Filtering by `Directed at me` MUST use the authenticated user identity from trusted auth context; clients MUST NOT be able to spoof user ID in this mode.
- **SEC-002**: Feed query handling MUST continue enforcing existing authorization rules; role visibility MUST NOT broaden because of sorting/filtering.
- **SEC-003**: User role text displayed in the account menu MUST be sourced from authenticated claims/profile data and MUST NOT be client-hardcoded.

### Constraints

- **CON-001**: The implementation MUST remain compatible with the existing React + TypeScript + Tailwind frontend stack.
- **CON-002**: The implementation MUST preserve existing main feed route and basic feed loading behavior.
- **CON-003**: Backend changes MUST be limited to query parameter support and ordering/filter evaluation if current endpoint capabilities are insufficient.
- **CON-004**: Hero image assets MUST be served through existing static asset handling; no new media service dependency is introduced in this scope.

### Guidelines

- **GUD-001**: Compact card spacing SHOULD reduce non-essential vertical whitespace before reducing content typography size.
- **GUD-002**: Visual emphasis SHOULD come from hierarchy, contrast, and spacing rather than glow effects.
- **GUD-003**: Sorting/filter controls SHOULD be keyboard-navigable and screen-reader labeled.
- **GUD-004**: Filter/sort state SHOULD be reflected in URL query parameters for shareability and refresh persistence.

### Patterns

- **PAT-001**: Use a single source-of-truth state object for feed query params (`sortBy`, `sortDir`, `filterMode`) synchronized with URL search params.
- **PAT-002**: Use composable query builder logic so each filter/sort concern adds deterministic criteria without side effects.

## 4. Interfaces & Data Contracts

### Frontend Route Query Contract

Feed route query parameters:

| Field | Type | Allowed Values | Default | Notes |
|---|---|---|---|---|
| `sortBy` | string | `createdAt`, `points` | `createdAt` | |
| `sortDir` | string | `desc`, `asc` | `desc` | `createdAt desc` = newest first |
| `filterMode` | string | `all`, `directedAtMe` | `all` | |

Example URL:

```text
/feed?sortBy=points&sortDir=desc&filterMode=directedAtMe
```

### API Query Contract

GET `/api/cheers` query additions (or equivalent feed endpoint):

| Field | Type | Required | Allowed Values | Behavior |
|---|---|---|---|---|
| `sortBy` | string | No | `createdAt`, `points` | Select ordering field |
| `sortDir` | string | No | `asc`, `desc` | Select direction |
| `filterMode` | string | No | `all`, `directedAtMe` | Applies recipient-based filter |

Behavioral rules:
- If omitted, backend MUST apply defaults: `sortBy=createdAt`, `sortDir=desc`, `filterMode=all`.
- If `filterMode=directedAtMe`, backend MUST derive user identity from auth context and filter by recipient membership.
- Invalid values MUST return HTTP 400 with a field-level error payload.

Example request:

```http
GET /api/cheers?sortBy=createdAt&sortDir=desc&filterMode=directedAtMe
Authorization: Bearer <token>
```

### UI Component Contract (Feed Header Controls)

```ts
type FeedQueryState = {
  sortBy: "createdAt" | "points";
  sortDir: "asc" | "desc";
  filterMode: "all" | "directedAtMe";
};
```

Control behavior:
- Any control change triggers a single feed reload with updated state.
- Reset sets `sortBy=createdAt`, `sortDir=desc`, `filterMode=all`.

## 5. Acceptance Criteria

- **AC-001**: Given the feed is rendered, when a user views any Cheer card, then no yellow left bar or yellow glow effect is present.
- **AC-002**: Given the feed is rendered, when visual styles load, then card palette uses approved blue-led neutral styling and excludes yellow highlight gradients.
- **AC-003**: Given a user opens sort controls, when options are listed, then all four required sort options are available and `Newest first` is selected by default.
- **AC-004**: Given feed default state, when the user applies `Directed at me`, then only Cheers where the current user is a recipient are returned.
- **AC-005**: Given non-default sort/filter selections, when the user clicks `Reset`, then defaults are restored and matching feed results are shown.
- **AC-006**: Given the feed page header is visible, when the page loads, then a hero area (image + heading + supporting copy) is shown instead of a plain title block.
- **AC-007**: Given hero image retrieval fails, when the feed page renders, then the hero fallback background and text still render with no broken-image UI.
- **AC-008**: Given the authenticated user has name and role data, when the top-right account menu opens, then both values are visible there and not duplicated in a separate feed header metadata strip.
- **AC-009**: Given identical viewport size before and after refresh, when comparing rendered cards, then refreshed compact layout shows higher feed item density.
- **AC-010**: Given keyboard-only navigation, when traversing sort/filter controls and account menu, then all controls are reachable and operable via keyboard and announced with accessible names.

## 6. Test Automation Strategy

- **Test Levels**:
  - Frontend unit/component tests for control rendering, query-state transitions, and reset behavior.
  - API integration tests for query validation, sorting, and `directedAtMe` behavior.
  - End-to-end feed interaction tests for user-visible behavior.
- **Frameworks**:
  - Frontend: existing Vitest + Testing Library setup.
  - API: existing .NET test project with MSTest.
  - E2E: use repository-standard browser automation if already configured; otherwise keep acceptance validated by integration + component tests for this scope.
- **Test Data Management**:
  - Seed users and cheers so at least one authenticated user has both matching and non-matching recipient records.
  - Include mixed point totals and timestamps to validate all sort orders.
- **CI/CD Integration**:
  - Run existing frontend and API test commands in CI for changed modules.
- **Coverage Focus**:
  - Query state reducer/hooks
  - API validation paths for invalid query parameters
  - `directedAtMe` auth-derived recipient filtering path

## 7. Rationale & Context

The current feed visual language overuses decorative yellow accents and glow effects, creating inconsistency with the preferred blue-led palette and reducing perceived polish. Users also need faster discovery in active feeds; explicit sorting and recipient-focused filtering reduce scan time. Moving user identity metadata into the account menu declutters the content area and aligns feed hierarchy with modern application shells. A hero area upgrades visual entry without altering recognition data semantics.

## 8. Dependencies & External Integrations

### External Systems
- **EXT-001**: Microsoft Entra ID identity tokens - provides authenticated user identity for `Directed at me` filter semantics.

### Third-Party Services
- **SVC-001**: None newly introduced in this scope.

### Infrastructure Dependencies
- **INF-001**: Existing frontend static asset hosting path for hero image delivery.
- **INF-002**: Existing API feed endpoint and database query pipeline.

### Data Dependencies
- **DAT-001**: Cheer recipient relationship data MUST remain queryable for recipient-based filtering.
- **DAT-002**: Cheer point totals and creation timestamps MUST be available for sort operations.

### Technology Platform Dependencies
- **PLT-001**: React + TypeScript + Tailwind CSS frontend.
- **PLT-002**: .NET 10 API with Entity Framework Core and PostgreSQL.

### Compliance Dependencies
- **COM-001**: Existing organizational auth and role handling practices continue unchanged.

## 9. Examples & Edge Cases

```text
Scenario A: Directed-at-me + highest points
- User selects filterMode=directedAtMe, sortBy=points, sortDir=desc
- Feed returns only records where current user is in recipients
- Results ordered by points descending

Scenario B: Invalid query
- Request uses sortBy=senderName
- API returns 400 with validation detail for sortBy allowed values

Scenario C: Hero image missing
- Configured hero image URL returns 404
- UI renders fallback solid background hero with heading/copy and no broken image icon

Scenario D: Zero directed results
- User enables directedAtMe but no records match
- Empty state message appears with action to reset filters
```

## 10. Validation Criteria

- All REQ, SEC, and CON statements are mapped to at least one automated test case.
- Feed controls and route query serialization produce deterministic API requests.
- Invalid query values are rejected with explicit 400 responses.
- `Directed at me` filtering is validated against auth-derived user identity in API tests.
- Visual regression or snapshot checks confirm removal of yellow bar/glow and presence of hero region.

## 11. Related Specifications / Further Reading

- `spec/spec-schema-cheer-message.md`
- `spec/spec-design-theme.md`
- `spec/spec-infrastructure-microsoft-entra-auth.md`
- `spec/story-update-cheer-feed.md`
