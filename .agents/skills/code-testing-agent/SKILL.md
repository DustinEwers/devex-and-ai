---
name: code-testing-agent
description: >-
  Generates and updates unit tests for the Cheersly codebase. Use when asked to
  generate tests, write unit tests, improve test coverage, add test coverage,
  or create test files for the .NET API or React frontend. Covers MSTest, Moq,
  EF Core InMemory, Vitest, React Testing Library, service tests, controller
  tests, user sync, points allocation, store flows, and admin authorization.
---

# Code Testing Generation Skill

This skill generates concise, workable unit tests for Cheersly's real test stack instead of relying on abstract multi-agent orchestration.

## When to Use This Skill

Use this skill when you need to:

- Generate or extend API tests under `src/api/Cheersly.Api.Tests`
- Generate or extend frontend tests under `src/frontend/src/__tests__`
- Improve coverage for services, controllers, hooks, components, or utilities
- Add tests for business rules around points, cheers, user sync, store, or admin access
- Produce tests that compile and match the repo's current conventions

## When Not to Use

- Running exploratory manual QA through Docker Compose
- Writing browser E2E tests or full-stack integration flows
- Debugging production code unrelated to the requested test scope
- Migrating the repo to a different test framework

## Repo-Specific Conventions

Cheersly already has strong testing conventions. Follow them unless the user asks otherwise.

- **API tests**: MSTest + Moq + EF Core InMemory in `src/api/Cheersly.Api.Tests`
- **Frontend tests**: Vitest + React Testing Library in `src/frontend/src/__tests__`
- **API naming**: `Method_Condition_ExpectedResult`
- **Frontend style**: `describe` blocks by subject, `it` statements for behavior, `vi.mock` for dependencies
- **Business rules**: 50-point monthly allocation resets, received points accumulate, over-allocation is rejected, admin access stays restricted

## Workflow

Use this direct workflow for every test-generation request.

## Step-by-Step Instructions

### Step 1: Determine the user request

Identify the scope first: API, frontend, or both.

When the user does not specify conventions, source them from [unit-test-generation.prompt.md](unit-test-generation.prompt.md) and the language-specific files in `extensions/`.

### Step 2: Read the existing tests before writing new ones

- For API work, inspect nearby files in `src/api/Cheersly.Api.Tests`
- For frontend work, inspect nearby files in `src/frontend/src/__tests__`
- Reuse the existing mocking style, setup pattern, and naming scheme

### Step 3: Read the production code and verify signatures

- Verify constructor parameters, method signatures, return types, and nullability
- Identify external dependencies that must be mocked
- Note business rules that deserve direct assertions

### Step 4: Write the smallest useful set of tests

- Cover happy paths, meaningful edge cases, and error handling
- Prefer parameterized tests when only inputs vary
- Avoid low-value tests that just restate framework behavior
- Keep tests local and deterministic

### Step 5: Validate with scoped commands

- API tests: build and test `src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj`
- Frontend tests: run the package scripts from `src/frontend/package.json`
- If a test fails, fix the assertion or test setup before considering production changes

### Step 6: Run a final repo-appropriate validation pass

- After targeted changes, run the broadest practical validation for the affected stack
- Prefer full solution validation for .NET and the relevant Vitest command for frontend changes

## Required Coverage Areas For This Repo

When applicable, prioritize these Cheersly behaviors:

- Monthly point resets return `PointsToGive` to 50 without reducing `PointsReceived`
- Giving cheers cannot exceed the sender's current point balance
- User sync from Entra claims creates or updates users correctly
- Admin-only endpoints and store admin flows reject unauthorized access
- Feed sorting, pagination, and filter query handling stay stable
- Frontend components handle loading, success, and error states explicitly

## Do Not Generate

- Tests that require live PostgreSQL, Docker Compose, or seeded SQL data
- Tests that call live Microsoft Entra or real MSAL browser flows
- Tests that depend on network ports, wall-clock timing, or external URLs
- Snapshot-heavy tests where explicit assertions are clearer

## Extension Files

Use the repo-specific extensions when relevant:

- [extensions/dotnet.md](extensions/dotnet.md) for API and MSTest guidance
- [extensions/vitest-react.md](extensions/vitest-react.md) for React, Vitest, and Testing Library guidance

## Examples

### API example

```
Add MSTest coverage for `UserService` point-reset edge cases and claim-sync validation.
```

### Frontend example

```
Add Vitest tests for the cheer feed service query options and error handling.
```

### Full-stack example

```
Add tests for the new store redemption flow in both the API service and the React client.
```

## Troubleshooting

### Tests don't compile or type-check

- Re-read the production signatures and existing test patterns
- Check the relevant file in `extensions/`
- Verify the test project or package already references what the tests need

### Tests fail

- Read the failure output
- Read the production code
- Fix the expected assertion or mock setup first
- Never skip tests just to make the suite green

### Framework choice is ambiguous

- API requests default to MSTest
- Frontend requests default to Vitest + Testing Library
- If the user wants a different framework, they need to ask explicitly

## Requirements

- .NET 10 SDK for API test work
- Node.js environment for frontend test work
- Existing repo dependencies restored before validation

This skill is intentionally repo-specific. If the codebase conventions change, update this file and the extension files together.
