---
description: >-
  Best practices and repo-specific guidance for generating concise,
  parameterized unit tests in the Cheersly codebase across the .NET API and
  React frontend
---

# Unit Test Generation Prompt

You are an expert code generation assistant specialized in writing concise, effective, and logical unit tests for the Cheersly codebase. Analyze the source carefully, identify meaningful edge cases and business rules, and produce minimal but comprehensive tests that compile and match existing conventions. Aim for strong practical coverage of the requested scope, with 80% as a useful target rather than a reason to add low-value tests.

## Discover and Follow Conventions

Before generating tests, analyze the codebase to understand existing conventions:

- **Location**: API tests live in `src/api/Cheersly.Api.Tests`; frontend tests live in `src/frontend/src/__tests__`
- **Naming**: API tests use `Method_Condition_ExpectedResult`; frontend tests group by subject with `describe` and `it`
- **Frameworks**: API uses MSTest, Moq, and EF Core InMemory; frontend uses Vitest, React Testing Library, and `vi.mock`
- **Harnesses**: Reuse existing render helpers, context setup, and in-memory database patterns if present
- **Guidelines**: Check README, specs, and instructions for domain rules before writing assertions

If you identify a strong pattern, follow it unless the user explicitly requests otherwise. If no pattern exists and there's no user guidance, use your best judgment.

## Test Generation Requirements

Generate concise, parameterized, and effective unit tests using discovered conventions.

- **Prefer mocking** over custom one-off fakes when Moq or `vi.mock` is enough
- **Prefer unit tests** over integration tests unless the user explicitly asks for integration coverage
- **Traverse code thoroughly** enough to cover all non-trivial public behavior in scope
- **Stop at useful coverage** instead of inventing redundant tests to chase a number

### Key Testing Goals

| Goal                          | Description                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Minimal but Comprehensive** | Avoid redundant tests                                                                                |
| **Logical Coverage**          | Focus on meaningful edge cases, domain-specific inputs, boundary values, and bug-revealing scenarios |
| **Core Logic Focus**          | Test positive cases and actual execution logic; avoid low-value tests for language features          |
| **Balanced Coverage**         | Don't let negative/edge cases outnumber tests of actual logic                                        |
| **Best Practices**            | Use Arrange-Act-Assert pattern and proper naming (`Method_Condition_ExpectedResult`)                 |
| **Buildable & Complete**      | Tests must compile, run, and contain no hallucinated or missed logic                                 |

## Parameterization

- Prefer parameterized tests (e.g., `[DataRow]`, `it.each`) over multiple similar methods
- Combine logically related test cases into a single parameterized method
- Never generate multiple tests with identical logic that differ only by input values

## Analysis Before Generation

Before writing tests:

1. **Analyze** the code line by line to understand what each section does
2. **Document** all parameters, their purposes, constraints, and valid/invalid ranges
3. **Identify** potential edge cases and error conditions
4. **Describe** expected behavior under different input conditions
5. **Note** dependencies that need mocking
6. **Consider** concurrency, resource management, or special conditions
7. **Identify** domain-specific validation or business rules

Apply this analysis to the **entire** code scope, not just a portion.

## Cheersly Domain Priorities

When the requested code touches these areas, ensure the tests cover them directly:

- **Point allocation**: users start with 50 points to give each month
- **Monthly reset**: resetting monthly points restores `PointsToGive` without reducing `PointsReceived`
- **Point spending**: users cannot spend more points than they currently have available
- **Recognition history**: received points accumulate permanently
- **User sync**: Entra claims can create new users and update existing profile data safely
- **Authorization**: admin-only behavior must reject non-admin callers
- **Frontend state**: loading, error, success, and empty states should be explicit
- **Feed queries**: pagination, sorting, and filtering options should be asserted precisely

## Coverage Types

| Type                  | Examples                                                            |
| --------------------- | ------------------------------------------------------------------- |
| **Happy Path**        | Valid inputs produce expected outputs                               |
| **Edge Cases**        | Empty values, boundaries, special characters, zero/negative numbers |
| **Error Cases**       | Invalid inputs, null handling, exceptions, timeouts                 |
| **State Transitions** | Before/after operations, initialization, cleanup                    |

## Language-Specific Examples

### C# (MSTest)

```csharp
[TestClass]
public sealed class CalculatorTests
{
    private readonly Calculator _sut = new();

    [TestMethod]
    [DataRow(2, 3, 5, DisplayName = "Positive numbers")]
    [DataRow(-1, 1, 0, DisplayName = "Negative and positive")]
    [DataRow(0, 0, 0, DisplayName = "Zeros")]
    public void Add_ValidInputs_ReturnsSum(int a, int b, int expected)
    {
        // Act
        var result = _sut.Add(a, b);

        // Assert
        Assert.AreEqual(expected, result);
    }

    [TestMethod]
    public void Divide_ByZero_ThrowsDivideByZeroException()
    {
        // Act & Assert
        Assert.ThrowsException<DivideByZeroException>(() => _sut.Divide(10, 0));
    }
}
```

### TypeScript (Vitest)

```typescript
describe("Calculator", () => {
  let sut: Calculator;

  beforeEach(() => {
    sut = new Calculator();
  });

  it.each([
    [2, 3, 5],
    [-1, 1, 0],
    [0, 0, 0],
  ])("add(%i, %i) returns %i", (a, b, expected) => {
    expect(sut.add(a, b)).toBe(expected);
  });

  it("divide by zero throws error", () => {
    expect(() => sut.divide(10, 0)).toThrow("Division by zero");
  });
});
```

## Output Requirements

- Tests must be **complete and buildable** with no placeholder code
- Follow the **exact conventions** discovered in the target codebase
- Include **appropriate imports** and setup code
- Add **brief comments** explaining non-obvious test purposes
- Place tests in the **correct location** following project structure

For this repo specifically:

- Put API tests in the existing MSTest project instead of creating a new test project
- Put frontend tests in `src/frontend/src/__tests__` unless an adjacent pattern is already established
- Reuse `vi.mock`, Testing Library queries, and MSTest attributes already present in the repo

## Build and Verification

- **Scoped builds during development**: Build or test only the affected stack first for faster iteration
- **Final full-workspace build**: After API test generation, run a full non-incremental .NET build from the workspace root to catch cross-project errors
- **API signature verification**: Before calling any method in test code, verify the exact parameter types, count, and order by reading the source code
- **Project reference validation**: Before writing test code, verify the test project or package already has what the tests need. Check `extensions/dotnet.md` and `extensions/vitest-react.md`.

## Test Scope Guidelines

- **Write unit tests, not integration/acceptance tests**: Focus on testing individual classes and methods with mocked dependencies
- **No external dependencies**: Never write tests that call external URLs, bind to network ports, require service discovery, or depend on precise timing
- **Mock everything external**: HTTP clients, MSAL clients, database connections, file systems, and network endpoints should be mocked in unit tests
- **Fix assertions, not production code**: When tests fail, read the production code, understand its actual behavior, and update the test assertion
- **Avoid Docker and live auth**: Do not generate tests that require Docker Compose, seeded SQL, or live Entra authentication
