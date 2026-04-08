---
name: code-review
description: 'Review code changes for bugs, risks, regressions, and missing tests. Use when asked to review a diff, PR, commit, feature branch, controller, service, UI change, or implementation plan. Prioritize findings by severity and keep summaries secondary.'
argument-hint: 'Describe what to review: diff, PR, files, feature area, or branch.'
user-invocable: true
---

# Code Review

Review code with a defect-finding mindset. The primary goal is to identify correctness issues, behavioral regressions, security risks, performance concerns, and missing test coverage. Style feedback is secondary and should only be raised when it materially affects reliability, maintainability, or future defects. Don't block a change because it isn't exactly how you would have written it. If it improves the codebase and follows the project's conventions, approve it.

## When to Use

- Review a pull request, diff, commit, or changed file set
- Audit a feature implementation before merge
- Check a controller, service, migration, API contract, or frontend workflow for regressions
- When another agent or model produced code you need to evaluate
- After any bug fix (review both the fix and the regression test)
- After refactoring existing code


## Review Standard

Apply these principles throughout the review:

- Findings come first
- Order findings by severity and user impact
- Focus on bugs, risks, behavioral regressions, and missing tests
- Keep summaries brief and place them after findings
- If no findings are discovered, state that explicitly
- When no findings are discovered, still mention residual risks or testing gaps

## The Five-Axis Review

Every review evaluates code across these dimensions:

### 1. Correctness

Does the code do what it claims to do?

- Does it match the spec or task requirements?
- Are edge cases handled (null, empty, boundary values)?
- Are error paths handled (not just the happy path)?
- Does it pass all tests? Are the tests actually testing the right things?
- Are there off-by-one errors, race conditions, or state inconsistencies?

### 2. Readability & Simplicity

Can another engineer (or agent) understand this code without the author explaining it?

- Are names descriptive and consistent with project conventions? (No `temp`, `data`, `result` without context)
- Is the control flow straightforward (avoid nested ternaries, deep callbacks)?
- Is the code organized logically (related code grouped, clear module boundaries)?
- Are there any "clever" tricks that should be simplified?
- **Could this be done in fewer lines?** (1000 lines where 100 suffice is a failure)
- **Are abstractions earning their complexity?** (Don't generalize until the third use case)
- Would comments help clarify non-obvious intent? (But don't comment obvious code.)
- Are there dead code artifacts: no-op variables (`_unused`), backwards-compat shims, or `// removed` comments?

### 3. Architecture

Does the change fit the system's design?

- Does it follow existing patterns or introduce a new one? If new, is it justified?
- Does it maintain clean module boundaries?
- Is there code duplication that should be shared?
- Are dependencies flowing in the right direction (no circular dependencies)?
- Is the abstraction level appropriate (not over-engineered, not too coupled)?

### 4. Security

For detailed security guidance, see `security-and-hardening`. Does the change introduce vulnerabilities?

- Is user input validated and sanitized?
- Are secrets kept out of code, logs, and version control?
- Is authentication/authorization checked where needed?
- Are SQL queries parameterized (no string concatenation)?
- Are outputs encoded to prevent XSS?
- Are dependencies from trusted sources with no known vulnerabilities?
- Is data from external sources (APIs, logs, user content, config files) treated as untrusted?
- Are external data flows validated at system boundaries before use in logic or rendering?

### 5. Performance

For detailed profiling and optimization, see `performance-optimization`. Does the change introduce performance problems?

- Any N+1 query patterns?
- Any unbounded loops or unconstrained data fetching?
- Any synchronous operations that should be async?
- Any unnecessary re-renders in UI components?
- Any missing pagination on list endpoints?
- Any large objects created in hot paths?

## Inputs To Collect

Collect or infer the smallest complete review scope possible:

- The diff, changed files, target branch, commit, or feature area under review
- Any related specification, issue, or acceptance criteria
- Whether the request is for code review, design review, or both
- Available test evidence: unit tests, integration tests, manual verification notes, CI status

If the scope is unclear, ask a focused question only when the review cannot proceed safely.

## Procedure

1. Determine the review target.
   Prefer changed code over the entire repository.
   If a diff or changed file list exists, review that first.
   Otherwise compare the current branch to main. Fetch a fresh copy of main if needed to ensure the review is accurate.
   If the user only names a feature, locate the relevant implementation files before evaluating them.

2. Establish the expected behavior.
   Read the nearest source of truth before judging the code:
   - specs in `/spec/`
   - related controllers, services, types, and tests
   - user-facing flows described in `AGENTS.md`
   - existing behavior in adjacent code paths

3. Inspect high-risk areas first.
   Prioritize:
   - data integrity and transactional logic
   - authorization and authentication boundaries
   - API contract changes and serialization behavior
   - null handling, edge cases, and error paths
   - concurrency, race conditions, and state synchronization
   - migrations and backward compatibility
   - frontend/backend mismatch
   - test coverage for changed behavior

4. Validate evidence, not intent.
   For each suspected issue, confirm it against code, tests, or data flow.
   Avoid speculative findings that cannot be tied to a concrete failure mode, regression path, or missing safeguard.

5. Write findings in a review-ready format.
   Each finding should include:
   - severity level
   - affected file and precise location when available
   - the defect or risk
   - why it matters
   - the triggering scenario or failure mode

6. Check for missing tests.
   If the implementation changes behavior without corresponding automated coverage, call that out explicitly.
   Missing tests are findings when the behavior is risky, complex, or regression-prone.

7. Close with the minimum necessary summary.
   After findings, include:
   - open questions or assumptions
   - a short change summary only if it adds value
   - residual risks or testing gaps, especially when no defects were found

## Decision Points

### If reviewing a diff or PR

- Start with changed files and surrounding call sites
- Use tests and related contracts to verify intended behavior
- Prefer findings tied to the actual delta over broad codebase commentary

### If reviewing a single file

- Inspect direct dependencies, callers, and tests as needed
- Do not expand scope further than required to validate behavior

### If reviewing a design or plan instead of code

- Focus on missing requirements, unsafe assumptions, interface ambiguity, and likely implementation failure modes
- Frame findings as design risks rather than code defects

### If evidence is insufficient

- State the limitation clearly
- Ask for the missing diff, file list, test output, or acceptance criteria only if that gap blocks a credible review

## Finding Criteria

Raise a finding when at least one of these is true:

- The code can produce incorrect results
- The change can regress existing behavior
- The implementation violates the apparent contract or specification
- The code introduces security, authorization, or data exposure risk
- The change lacks tests for important new or modified behavior
- The logic is fragile under realistic edge cases or concurrency conditions

Do not raise a finding solely because you would have implemented it differently.

## Completion Checks

The review is complete only if all of the following are true:

- The actual review target was identified
- The highest-risk changed behavior was inspected
- Findings are ordered by severity
- Each finding is concrete and supported by code or missing coverage evidence
- Missing tests were evaluated explicitly
- The response puts findings before summaries
- If no findings were found, that is stated explicitly along with residual risks or testing gaps

## Output Pattern

Use this structure when responding:

1. Findings
   Present each finding as a concise standalone item ordered by severity.

2. Open questions or assumptions
   Include only unresolved items that materially affect confidence in the review.

3. Brief summary
   Include only when useful, and keep it secondary.

## Quality Bar

- Be direct and technical, not rhetorical
- Prefer fewer high-confidence findings over many weak ones
- Avoid style-only commentary unless it affects correctness or maintainability in a concrete way
- Distinguish confirmed defects from unverified concerns
- Keep the review scoped to the requested change unless broader context is necessary to prove impact