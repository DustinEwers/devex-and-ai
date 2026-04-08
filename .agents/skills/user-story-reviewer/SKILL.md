---
name: user-story-reviewer
description: 'Review a user story for completeness, ambiguity, missing acceptance criteria, risks, and implementation readiness. Use when a user drops in a story, epic, feature request, or backlog item and wants gaps identified before turning it into a full specification.'
argument-hint: 'Paste the user story or describe the backlog item to review.'
user-invocable: true
---

# User Story Reviewer

Review a user story before implementation or specification work begins. The goal is to determine whether the story is complete, testable, and implementation-ready, then either refine it or route it into the specification workflow.

This skill is designed to turn a rough backlog item into a higher-quality input for [Create Specification](../create-specification/SKILL.md).

## When to Use

- A user pastes a user story and wants a completeness review
- A backlog item needs validation before implementation starts
- A feature request needs acceptance criteria and boundary clarification
- A story must be converted into a formal specification in `/spec/`

## What Good Looks Like

A story is strong enough for specification work when it clearly identifies:

- the actor or user role
- the intended action or capability
- the business value or outcome
- the functional boundaries and out-of-scope assumptions
- success conditions and acceptance criteria
- constraints, dependencies, and risks that affect implementation
- key edge cases and failure modes
- enough precision that engineering and product teams will interpret it consistently

## Inputs To Collect

Collect or infer the following from the story and surrounding context:

- the story text or feature description
- the affected domain area or workflow
- any related specifications, design notes, or implementation constraints
- whether the goal is only review, or review plus conversion into a full spec

If the story is isolated and lacks context, proceed with the review and mark the missing context explicitly.

## Review Axes

Evaluate the story across these dimensions:

### 1. Structure

- Does it identify an actor, goal, and business value?
- Is the story one coherent unit of behavior rather than several unrelated requests?
- Is the scope small enough to estimate and implement?

### 2. Clarity

- Are key terms defined well enough to avoid multiple interpretations?
- Are there hidden assumptions about roles, permissions, states, or integrations?
- Are vague words such as "fast", "easy", "support", or "manage" replaced with concrete expectations?

### 3. Functional Completeness

- Are the main success path and major alternate paths described?
- Are validation rules, business rules, and system behaviors present?
- Are outputs, side effects, and state changes identifiable?

### 4. Acceptance Criteria

- Can the story be tested without guessing the intent?
- Are acceptance criteria observable and measurable?
- Are failure cases and boundary conditions addressed where needed?

### 5. Dependencies And Constraints

- Does the story rely on existing systems, roles, data, or external integrations?
- Are security, compliance, performance, or architectural constraints implied but unstated?
- Is sequencing with other stories or infrastructure work required?

### 6. Specification Readiness

- Is there enough information to write requirements and interfaces?
- Are there unresolved product questions that would block a credible spec?
- Can the story be translated into explicit acceptance criteria, data contracts, and validation rules?

## Procedure

1. Read the story literally first.
   Extract the actor, action, outcome, and visible business intent without inventing missing details.

2. Identify what is explicitly stated versus assumed.
   Separate concrete statements from implied requirements, hidden dependencies, and ambiguous terms.

3. Review against the six axes.
   Call out missing information, conflicting statements, and areas that are not testable.

4. Decide the story state.
   Classify it as one of:
   - ready for specification
   - needs clarification
   - too broad and should be split
   - conflicting or internally inconsistent

5. Produce the review output.
   Include:
   - a concise readiness assessment
   - concrete gaps and ambiguities
   - recommended follow-up questions
   - a normalized or tightened version of the story when useful

6. Handoff to specification work.
   If the story is ready, recommend moving to [Create Specification](../create-specification/SKILL.md) with a suggested spec purpose and scope.
   If the story is not ready, identify the minimum clarifications needed before using [Create Specification](../create-specification/SKILL.md).

## Decision Points

### If the story is complete enough

- State that it is ready for specification
- Summarize the implementation scope in plain language
- Suggest the likely spec category such as `process`, `design`, `schema`, or `infrastructure`
- Recommend the next step: [Create Specification](../create-specification/SKILL.md)

### If the story is missing key details

- List only the missing details that materially affect implementation or testing
- Ask focused clarification questions
- Do not manufacture requirements unless clearly marked as assumptions

### If the story is too broad

- Explain which behaviors should be split into separate stories or specs
- Suggest the split boundaries
- Identify which part should be specified first

### If the story contains conflicts

- Quote or restate the conflicting expectations clearly
- Explain why they cannot both be implemented as written
- Ask for a product decision before specification work proceeds

## Completion Checks

The review is complete only if all of the following are true:

- the actor, action, and intended outcome were identified or explicitly marked missing
- the story was assessed for ambiguity, completeness, and testability
- major business rules, edge cases, and dependencies were considered
- the story state was classified clearly
- the response includes either a spec handoff or the minimum blocking questions
- the next step toward [Create Specification](../create-specification/SKILL.md) is explicit

## Output Pattern

Use this structure when responding:

1. Readiness assessment
   State whether the story is ready for specification, needs clarification, should be split, or is internally inconsistent.

2. Gaps and ambiguities
   List the concrete issues that block confident implementation or testing.

3. Clarifying questions
   Ask only the minimum questions needed to unblock the next step.

4. Suggested refinement
   Provide a tighter version of the story or acceptance criteria when that helps.

5. Spec handoff
   Point to [Create Specification](../create-specification/SKILL.md) and suggest the likely spec type and scope.

## Quality Bar

- Prefer concrete, implementation-relevant observations over generic agile advice
- Distinguish missing information from optional polish
- Do not confuse specification writing with story review; validate the story first
- Keep the handoff to [Create Specification](../create-specification/SKILL.md) explicit and actionable
- Avoid inventing product decisions that belong to the user or product owner