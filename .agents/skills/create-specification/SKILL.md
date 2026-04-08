---
name: create-specification
description: 'Create or update AI-ready specification files in /spec/. Use for writing new schema, tool, data, infrastructure, process, architecture, or design specs with explicit requirements, constraints, interfaces, acceptance criteria, test strategy, and validation rules.'
argument-hint: 'Describe the specification purpose and the solution area it covers.'
user-invocable: true
---

# Create Specification

Create a new Markdown specification file for a clearly defined product, architecture, data, process, tool, infrastructure, or schema concern.

This skill is for repo-scoped specifications stored in `/spec/` and written for effective use by Generative AI systems and engineers. The output must be self-contained, explicit, and structured so it can drive implementation work without relying on hidden context.

## When to Use

- Create a new specification in `/spec/`
- Expand a rough idea into formal requirements and interfaces
- Standardize an ad hoc design note into the repo's spec format
- Draft a first version of a spec, then identify ambiguities that need user confirmation

## Inputs To Collect

Collect or infer the following before drafting:

- The spec purpose in one sentence
- The high-level category: `schema`, `tool`, `data`, `infrastructure`, `process`, `architecture`, or `design`
- The intended audience and affected solution components
- Required interfaces, APIs, data contracts, or workflow boundaries
- Known constraints, security rules, compliance requirements, and external dependencies
- Acceptance criteria and testing expectations

If any of these are unclear, ask only focused questions that unblock the draft.

## Procedure

1. Review nearby context.
   Read relevant existing files before writing:
   - `AGENTS.md`
   - related files in `/spec/`
   - any currently open design or implementation doc tied to the requested topic

2. Choose the filename.
   The file must be saved in `/spec/` as `spec-[a-z0-9-]+.md`.
   The slug must start with one of the approved high-level purposes:
   - `spec-schema-...`
   - `spec-tool-...`
   - `spec-data-...`
   - `spec-infrastructure-...`
   - `spec-process-...`
   - `spec-architecture-...`
   - `spec-design-...`

3. Draft the document using the template.
   Use [the template](./assets/spec-template.md) as the starting structure.
   Fill every section with concrete, repo-relevant content.

4. Write for AI consumption.
   Apply these standards throughout the draft:
   - Use precise, explicit, unambiguous language
   - Separate requirements, constraints, guidelines, and patterns
   - Define every acronym and domain-specific term in the document
   - Keep the spec self-contained instead of referring to tribal knowledge
   - Include examples and edge cases where they materially affect implementation
   - Prefer tables and enumerated IDs when they improve parseability

5. Encode normative statements explicitly.
   Use stable identifiers where possible:
   - `REQ-###` for functional requirements
   - `SEC-###` for security requirements
   - `CON-###` for constraints
   - `GUD-###` for guidelines
   - `PAT-###` for patterns
   Add other prefixes only when they improve clarity.

6. Make the document implementation-ready.
   Ensure the draft covers:
   - Purpose and scope
   - Definitions
   - Requirements, constraints, and guidelines
   - Interfaces and data contracts
   - Acceptance criteria using testable language
   - Test automation strategy
   - Rationale and context
   - Dependencies and external integrations
   - Examples and edge cases
   - Validation criteria
   - Related specifications or further reading

7. Save the file in `/spec/`.
   Preserve well-formed Markdown and YAML frontmatter.

8. Review for weak spots.
   After drafting, identify the most ambiguous, assumption-heavy, or under-specified areas.
   Ask concise follow-up questions only about those weak spots if they materially affect implementation quality.

## Completion Checks

The draft is complete only if all of the following are true:

- The file is in `/spec/`
- The filename matches `spec-[a-z0-9-]+.md`
- The filename begins with an approved high-level purpose
- The frontmatter is valid YAML
- Every template section is present and populated
- Requirements are explicit and testable
- Interfaces and contracts include concrete structures, fields, or behavioral rules
- Acceptance criteria can be validated without guessing intent
- Dependencies describe architectural needs rather than package trivia
- The document can be understood without external conversation history

## Quality Bar

- Prefer direct statements like `MUST`, `MUST NOT`, `SHOULD`, and `MAY` where appropriate
- Avoid placeholders unless the user explicitly wants a scaffold instead of a draft
- Do not leave key sections empty with `TBD` unless blocked by missing information
- Reuse repository terminology consistently with existing specs
- Keep examples realistic and aligned with the Cheersly domain when applicable

## Output Pattern

When using this skill interactively:

1. Draft and save the spec.
2. Summarize what the specification covers.
3. List the most important ambiguities or assumptions.
4. Suggest follow-up prompts if additional refinement is needed.
