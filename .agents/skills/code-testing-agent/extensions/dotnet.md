# .NET Extension

Language-specific guidance for Cheersly API test generation with MSTest.

## Scope

Use this file for controllers, services, data-access logic, and domain model behavior in `src/api/Cheersly.Api`.

Prefer adding tests to the existing project at `src/api/Cheersly.Api.Tests`.

## Build Commands

| Scope | Command |
|-------|---------|
| Specific test project | `dotnet build src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj` |
| Specific API test run | `dotnet test src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj` |
| Full solution (final validation) | `dotnet build cheersly.sln --no-incremental` |
| From repo root (fallback) | `dotnet build --no-incremental` |

- Use `--no-restore` if dependencies are already restored
- Use `-v:q` (quiet) to reduce output noise
- Always use `--no-incremental` for the final validation build — incremental builds hide errors like CS7036

## Test Commands

| Scope | Command |
|-------|---------|
| API test project | `dotnet test src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj` |
| Filtered | `dotnet test src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj --filter "FullyQualifiedName~ClassName"` |
| After build | `dotnet test src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj --no-build` |

- Use `--no-build` if already built
- Use `-v:q` for quieter output

## Lint Command

```bash
dotnet format --include path/to/file.cs
dotnet format MySolution.sln         # full solution
```

## Project Reference Validation

Before writing test code, read the test project's `.csproj` to verify it has `<ProjectReference>` entries for the assemblies your tests will use. If a reference is missing, add it:

```xml
<ItemGroup>
    <ProjectReference Include="../SourceProject/SourceProject.csproj" />
</ItemGroup>
```

This prevents CS0234 ("namespace not found") and CS0246 ("type not found") errors.

For Cheersly, start by checking `src/api/Cheersly.Api.Tests/Cheersly.Api.Tests.csproj`.

## Repo Conventions

- Use MSTest attributes: `[TestClass]`, `[TestMethod]`, and `[DataRow]` where input variation is the only change
- Use `Moq` for logging and external service abstractions
- Use `Microsoft.EntityFrameworkCore.InMemory` for persistence-heavy service tests when mocking the full DbContext would be noisy
- Keep Arrange-Act-Assert structure explicit
- Match the namespace pattern already used in `Cheersly.Api.Tests`

## Cheersly API Priorities

- User sync behavior from claims
- Monthly point resets and point deduction rules
- Permanent accumulation of received points
- Admin authorization boundaries in controllers
- Store and cheer flows that validate balances, targets, and payload shape

## Common CS Error Codes

| Error | Meaning | Fix |
|-------|---------|-----|
| CS0234 | Namespace not found | Add `<ProjectReference>` to the source project in the test `.csproj` |
| CS0246 | Type not found | Add `using Namespace;` or add missing `<ProjectReference>` |
| CS0103 | Name not found | Check spelling, add `using` statement |
| CS1061 | Missing member | Verify method/property name matches the source code exactly |
| CS0029 | Type mismatch | Cast or change the type to match the expected signature |
| CS7036 | Missing required parameter | Read the constructor/method signature and pass all required arguments |

## `.csproj` / `.sln` Handling

- During phase implementation, build only the specific test `.csproj` for speed
- For the final validation, build the full `.sln` with `--no-incremental`
- Full-solution builds catch cross-project reference errors invisible in scoped builds

## MSTest Template

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace ProjectName.Tests;

[TestClass]
public sealed class ClassNameTests
{
    [TestMethod]
    public void MethodName_Scenario_ExpectedResult()
    {
        // Arrange
        var sut = new ClassName();

        // Act
        var result = sut.MethodName(input);

        // Assert
        Assert.AreEqual(expected, result);
    }

    [TestMethod]
    [DataRow(2, 3, 5, DisplayName = "Positive numbers")]
    [DataRow(-1, 1, 0, DisplayName = "Negative and positive")]
    public void Add_ValidInputs_ReturnsSum(int a, int b, int expected)
    {
        // Act
        var result = _sut.Add(a, b);

        // Assert
        Assert.AreEqual(expected, result);
    }
}
```

## Avoid

- Tests that depend on PostgreSQL, Docker Compose, or HTTP calls to a running API
- Broad controller tests that duplicate ASP.NET framework behavior without asserting application logic
- New helper abstractions when `Moq` or EF Core InMemory is sufficient
