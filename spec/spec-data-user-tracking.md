---
title: User Data Tracking and Management
version: 1.0
date_created: 2025-11-11
last_updated: 2025-11-11
owner: API Team
tags: [data, schema, infrastructure, api, entity-framework]
---

# Introduction

This specification defines the requirements for tracking and managing user data in the Cheersly API. It establishes how user identity information from Microsoft Entra ID authentication is synchronized with the application's user database, and how the point allocation and accumulation system is implemented using Entity Framework Core with PostgreSQL.

## 1. Purpose & Scope

**Purpose**: Define the data model, persistence layer, and business logic for tracking user profiles, point allocations, and point accumulation in the Cheersly application.

**Scope**: This specification covers:
- User entity data model and database schema
- Integration with Microsoft Entra ID authentication claims
- Point allocation and accumulation tracking
- Entity Framework Core configuration and migrations
- User creation and synchronization logic

**Out of Scope**:
- Role management and authorization logic (covered in authentication specifications)
- Cheers entity relationships (to be covered in separate specification)
- Point redemption in the Store (future specification)

**Intended Audience**: Backend developers, database administrators, AI code generators

**Assumptions**:
- Microsoft Entra ID authentication is configured and operational
- PostgreSQL database is available and accessible
- Entity Framework Core 10.0+ is used for data access
- Users authenticate via OAuth tokens containing email and name claims

## 2. Definitions

- **User**: An employee who can give and receive recognition (Cheers) in the system
- **Points to Give**: Monthly allocation of points a user can distribute to others (resets monthly)
- **Points Received**: Cumulative points a user has accumulated from receiving Cheers (persistent)
- **Entra Claims**: Identity information extracted from Microsoft Entra ID JWT tokens
- **User Synchronization**: Process of creating or updating user records based on authentication events
- **Monthly Reset**: Scheduled process that resets all users' "Points to Give" to the default allocation

## 3. Requirements, Constraints & Guidelines

### Data Model Requirements

- **REQ-001**: The User entity MUST contain the following properties:
  - `Id` (Guid) - Primary key, auto-generated
  - `Email` (string) - Unique identifier, sourced from Entra claim
  - `FirstName` (string) - User's first name from Entra claim
  - `LastName` (string) - User's last name from Entra claim
  - `PointsToGive` (int) - Current monthly allocation available to give
  - `PointsReceived` (int) - Cumulative points received from others
  - `LastLoginAt` (DateTime) - Timestamp of most recent authentication
  - `LastPointsReset` (DateTime) - Timestamp of last monthly reset

- **REQ-002**: Email MUST be used as the unique business identifier for users

- **REQ-003**: Email MUST be validated to ensure it's a properly formatted email address

- **REQ-004**: FirstName and LastName MUST be required fields with a minimum length of 1 character

- **REQ-005**: PointsToGive MUST default to 50 for new users

- **REQ-006**: PointsReceived MUST default to 0 for new users

- **REQ-007**: PointsToGive MUST NOT be negative

- **REQ-008**: PointsReceived MUST NOT be negative

### Synchronization Requirements

- **REQ-010**: The system MUST automatically create a user record when a user authenticates for the first time. A newly created user gets 50 points to give

- **REQ-011**: User email and name MUST be extracted from Entra ID token claims on each authentication

- **REQ-012**: User's FirstName and LastName MUST be updated from Entra claims if they have changed

- **REQ-013**: LastLoginAt MUST be updated on each successful authentication

- **REQ-014**: If a user record exists (matched by email), it MUST be updated rather than creating a duplicate

### Point Management Requirements

- **REQ-015**: The system MUST provide a method to deduct points from a user's PointsToGive balance

- **REQ-016**: Point deduction MUST fail if the user has insufficient PointsToGive

- **REQ-017**: The system MUST provide a method to add points to a user's PointsReceived balance

- **REQ-018**: The system MUST provide a monthly reset function that sets all users' PointsToGive to 50

- **REQ-019**: The monthly reset MUST update the LastPointsReset timestamp for all affected users

### Entity Framework Requirements

- **REQ-020**: User entity MUST be configured using Entity Framework Core Code First approach

- **REQ-021**: Email field MUST have a unique index in the database

- **REQ-022**: Email field MUST be configured with a maximum length of 256 characters

- **REQ-023**: FirstName and LastName MUST be configured with a maximum length of 100 characters each

- **REQ-024**: Database migrations MUST be generated for all schema changes

- **REQ-025**: The DbContext MUST be registered in the dependency injection container

### Constraints

- **CON-001**: PostgreSQL database compatibility MUST be maintained

- **CON-002**: All database operations MUST be asynchronous

- **CON-003**: User entity MUST NOT contain password or authentication credentials (handled by Entra)

- **CON-004**: Role claim processing is deferred; Role field may be manually set initially

- **CON-005**: Concurrent updates to the same user MUST be handled with appropriate locking or optimistic concurrency

### Guidelines

- **GUD-001**: Use descriptive migration names following the pattern: `YYYYMMDDHHMMSS_DescriptiveActionName`

- **GUD-002**: Implement user synchronization logic as middleware or a service invoked early in the request pipeline

- **GUD-003**: Log user creation and significant updates for auditing purposes

- **GUD-004**: Consider implementing soft delete rather than hard delete for users

- **GUD-005**: Use value objects or validation attributes for data integrity

### Patterns

- **PAT-001**: Repository Pattern - Implement a UserRepository for data access abstraction

- **PAT-002**: Unit of Work Pattern - Use DbContext as the unit of work for transactional operations

- **PAT-003**: Service Layer Pattern - Create a UserService to encapsulate business logic

## 4. Interfaces & Data Contracts

### User Entity

```csharp
namespace Cheersly.Api.Models;

public class User
{
    public Guid Id { get; set; }
    
    public required string Email { get; set; }
    
    public required string FirstName { get; set; }
    
    public required string LastName { get; set; }
    
    public int PointsToGive { get; set; } = 50;
    
    public int PointsReceived { get; set; } = 0;
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime LastLoginAt { get; set; }
    
    public DateTime LastPointsReset { get; set; }
    
    // Navigation properties (future)
    // public ICollection<Cheer> CheersGiven { get; set; }
    // public ICollection<CheerRecipient> CheersReceived { get; set; }
}

```

### DbContext Configuration

```csharp
namespace Cheersly.Api.Data;

public class CheerslyDbContext : DbContext
{
    public CheerslyDbContext(DbContextOptions<CheerslyDbContext> options)
        : base(options)
    {
    }
    
    public DbSet<User> Users { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(256);
            
            entity.HasIndex(e => e.Email)
                .IsUnique();
            
            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(100);
            
            entity.Property(e => e.PointsToGive)
                .HasDefaultValue(50);
            
            entity.Property(e => e.PointsReceived)
                .HasDefaultValue(0);
  
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()");
            
            entity.Property(e => e.LastLoginAt)
                .HasDefaultValueSql("NOW()");
            
            entity.Property(e => e.LastPointsReset)
                .HasDefaultValueSql("NOW()");
        });
    }
}
```

### User Service Interface

```csharp
namespace Cheersly.Api.Services;

public interface IUserService
{
    /// <summary>
    /// Synchronizes user from Entra claims. Creates if new, updates if exists.
    /// </summary>
    Task<User> SyncUserFromClaimsAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets a user by their email address.
    /// </summary>
    Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets a user by their ID.
    /// </summary>
    Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Deducts points from a user's PointsToGive balance.
    /// </summary>
    /// <returns>True if successful, false if insufficient points</returns>
    Task<bool> DeductPointsAsync(Guid userId, int points, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Adds points to a user's PointsReceived balance.
    /// </summary>
    Task AddReceivedPointsAsync(Guid userId, int points, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Resets all users' PointsToGive to the default monthly allocation.
    /// </summary>
    Task ResetMonthlyPointsAsync(CancellationToken cancellationToken = default);
}
```

### Entra Claims Mapping

| Entra Claim Type | User Property | Example Value |
|------------------|---------------|---------------|
| `preferred_username` or `email` | Email | `john.doe@company.com` |
| `given_name` | FirstName | `John` |
| `family_name` | LastName | `Doe` |
| `name` (fallback) | FirstName + LastName | `John Doe` (split on space) |

### Database Schema

**Table Name**: `Users`

| Column Name | Data Type | Nullable | Default | Constraints |
|-------------|-----------|----------|---------|-------------|
| Id | uuid | NO | gen_random_uuid() | PRIMARY KEY |
| Email | varchar(256) | NO | - | UNIQUE |
| FirstName | varchar(100) | NO | - | - |
| LastName | varchar(100) | NO | - | - |
| PointsToGive | integer | NO | 50 | CHECK (PointsToGive >= 0) |
| PointsReceived | integer | NO | 0 | CHECK (PointsReceived >= 0) |
| Role | varchar(50) | NO | 'Normal' | - |
| CreatedAt | timestamp | NO | NOW() | - |
| LastLoginAt | timestamp | NO | NOW() | - |
| LastPointsReset | timestamp | NO | NOW() | - |

**Indexes**:
- PRIMARY KEY on `Id`
- UNIQUE INDEX on `Email`

## 5. Acceptance Criteria

- **AC-001**: Given a new user authenticates with valid Entra credentials, When the authentication completes successfully, Then a new User record is created in the database with Email, FirstName, and LastName populated from claims

- **AC-002**: Given an existing user authenticates, When the authentication completes successfully, Then the user's LastLoginAt timestamp is updated to the current time

- **AC-003**: Given an existing user's name has changed in Entra, When they authenticate, Then their FirstName and LastName in the database are updated to match the new values

- **AC-004**: Given a new user is created, When the record is persisted, Then PointsToGive is set to 50 and PointsReceived is set to 0

- **AC-005**: Given a user attempts to deduct points, When the deduction amount is less than or equal to their current PointsToGive, Then the deduction succeeds and their PointsToGive is reduced by that amount

- **AC-006**: Given a user attempts to deduct points, When the deduction amount exceeds their current PointsToGive, Then the operation fails and their PointsToGive remains unchanged

- **AC-007**: Given points are added to a user's PointsReceived, When the addition completes, Then their PointsReceived balance increases by the specified amount

- **AC-008**: Given the monthly reset function is executed, When it completes, Then all users have their PointsToGive set to 50 and LastPointsReset updated to the current timestamp

- **AC-009**: Given two users have the same email address, When a second user record is created with that email, Then the database constraint prevents the duplicate and returns an appropriate error

- **AC-010**: Given a user's email is invalid (e.g., not a proper email format), When the user record is validated, Then validation fails with a clear error message

## 6. Test Automation Strategy

### Test Levels

- **Unit Tests**: Test individual components (User entity validation, UserService methods)
- **Integration Tests**: Test database operations with a test PostgreSQL instance
- **End-to-End Tests**: Test complete user synchronization flow from authentication to database persistence

### Frameworks

- **MSTest**: Primary testing framework for .NET
- **FluentAssertions**: For readable assertions
- **Moq**: For mocking dependencies in unit tests
- **Testcontainers**: For integration tests with PostgreSQL containers

### Test Data Management

- Use in-memory database for fast unit tests
- Use Testcontainers for integration tests requiring actual PostgreSQL
- Implement test data builders for consistent User entity creation
- Clean up test data after each test run

### CI/CD Integration

- Run all tests on pull requests before merge
- Generate code coverage reports
- Fail builds if coverage drops below threshold
- Run integration tests in separate pipeline stage with containerized database

### Coverage Requirements

- Minimum 80% code coverage for service layer
- 100% coverage for critical business logic (point deduction, synchronization)
- All acceptance criteria must have corresponding automated tests

### Performance Testing

- Measure user synchronization performance (target < 100ms)
- Test monthly reset performance with 10,000+ users (target < 5 seconds)
- Verify database query performance with indexes

## 7. Rationale & Context

### Why Track Points Separately?

The system maintains two distinct point balances:
- **PointsToGive**: Represents a monthly budget that resets. This prevents point inflation and ensures ongoing engagement.
- **PointsReceived**: Represents accumulated recognition. This provides a persistent measure of value and enables future reward redemption.

### Why Use Email as Primary Identifier?

Email is the natural unique identifier from Entra ID and is stable across user profile changes. Using email as the business key (separate from the database Id) allows for easier lookups and integration with external systems.

### Why Sync on Every Authentication?

Synchronizing user data on each authentication ensures:
- Profile information stays current (name changes, etc.)
- LastLoginAt provides activity tracking for analytics
- No separate user onboarding flow is needed
- System remains resilient to out-of-band user updates in Entra

### Why PostgreSQL Check Constraints?

Database-level constraints provide a last line of defense against data integrity issues, protecting against bugs in application logic or direct database modifications.

### Why Entity Framework Code First?

Code First approach provides:
- Version-controlled schema via migrations
- Strongly-typed entity models
- Simplified development workflow
- Better alignment with domain-driven design

## 8. Dependencies & External Integrations

### External Systems

- **EXT-001**: Microsoft Entra ID - OAuth authentication provider for user identity
  - Required claims: email/preferred_username, given_name, family_name
  - Integration type: JWT token validation

### Third-Party Services

- **SVC-001**: PostgreSQL Database Service
  - Required capabilities: ACID transactions, unique constraints, concurrent access
  - Version: PostgreSQL 14+
  - SLA requirements: 99.9% uptime for production

### Infrastructure Dependencies

- **INF-001**: Docker/Container Runtime
  - Required for running PostgreSQL in development environment
  - Version: Docker 20.10+

- **INF-002**: Entity Framework Core Tools
  - Required for generating and applying migrations
  - Version: Must match .NET SDK version (10.0+)

### Data Dependencies

- **DAT-001**: Microsoft Entra ID User Profile Data
  - Format: JWT claims in authentication token
  - Frequency: On each user authentication
  - Access requirements: Valid Entra app registration with User.Read permissions

### Technology Platform Dependencies

- **PLT-001**: .NET Runtime
  - Version: .NET 10.0 or later
  - Rationale: Required for Entity Framework Core 10.0 features

- **PLT-002**: Entity Framework Core
  - Version: 10.0 or later
  - Rationale: ORM for PostgreSQL with Code First support

- **PLT-003**: Npgsql Entity Framework Provider
  - Required capabilities: PostgreSQL-specific features, migrations support
  - Rationale: PostgreSQL provider for Entity Framework Core

### Compliance Dependencies

- **COM-001**: GDPR Compliance
  - Impact: User data must support export and deletion
  - Implementation: Ensure user records can be anonymized or purged on request

- **COM-002**: Data Retention Policies
  - Impact: May need to archive or delete inactive users after specified period
  - Implementation: Track LastLoginAt for compliance reporting

## 9. Examples & Edge Cases

### Example: New User First Login

```csharp
// Entra claims from JWT token
var claims = new[]
{
    new Claim("preferred_username", "alice@company.com"),
    new Claim("given_name", "Alice"),
    new Claim("family_name", "Smith")
};

var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));

// Service synchronization
var user = await userService.SyncUserFromClaimsAsync(principal);

// Result:
// user.Email = "alice@company.com"
// user.FirstName = "Alice"
// user.LastName = "Smith"
// user.PointsToGive = 50
// user.PointsReceived = 0
// user.Role = UserRole.Normal
// user.CreatedAt = [current timestamp]
// user.LastLoginAt = [current timestamp]
```

### Example: Existing User Subsequent Login

```csharp
// User exists in database with:
// Email: "bob@company.com"
// FirstName: "Robert"
// LastName: "Jones"
// PointsToGive: 30 (already gave away 20)
// PointsReceived: 75

// Entra claims (name changed)
var claims = new[]
{
    new Claim("preferred_username", "bob@company.com"),
    new Claim("given_name", "Bob"),  // Changed from Robert
    new Claim("family_name", "Jones")
};

var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "Bearer"));
var user = await userService.SyncUserFromClaimsAsync(principal);

// Result:
// user.FirstName = "Bob" (updated)
// user.PointsToGive = 30 (unchanged)
// user.PointsReceived = 75 (unchanged)
// user.LastLoginAt = [updated to current timestamp]
```

### Example: Point Deduction Success

```csharp
var userId = Guid.Parse("123e4567-e89b-12d3-a456-426614174000");
var pointsToDeduct = 15;

// User has PointsToGive = 30
var success = await userService.DeductPointsAsync(userId, pointsToDeduct);

// Result:
// success = true
// User's PointsToGive = 15
```

### Example: Point Deduction Failure (Insufficient Points)

```csharp
var userId = Guid.Parse("123e4567-e89b-12d3-a456-426614174000");
var pointsToDeduct = 60;

// User has PointsToGive = 30
var success = await userService.DeductPointsAsync(userId, pointsToDeduct);

// Result:
// success = false
// User's PointsToGive = 30 (unchanged)
```

### Example: Monthly Reset

```csharp
await userService.ResetMonthlyPointsAsync();

// All users in database:
// User A: PointsToGive = 50, LastPointsReset = [current timestamp]
// User B: PointsToGive = 50, LastPointsReset = [current timestamp]
// User C: PointsToGive = 50, LastPointsReset = [current timestamp]
// PointsReceived values remain unchanged for all users
```

### Edge Case: Missing Name Claims

```csharp
// Only email claim provided
var claims = new[]
{
    new Claim("preferred_username", "charlie@company.com")
};

// Implementation should handle gracefully:
// - Use email prefix as fallback name, OR
// - Require given_name and family_name claims and throw validation error
```

### Edge Case: Name Claim Format Variation

```csharp
// "name" claim instead of separated given_name/family_name
var claims = new[]
{
    new Claim("preferred_username", "diana@company.com"),
    new Claim("name", "Diana Prince")
};

// Implementation should split on first space:
// FirstName = "Diana"
// LastName = "Prince"
```

### Edge Case: Concurrent Point Deduction

```csharp
// User has 50 points
// Two simultaneous operations try to deduct 40 points each

Task.WaitAll(
    userService.DeductPointsAsync(userId, 40),
    userService.DeductPointsAsync(userId, 40)
);

// Expected behavior:
// - One operation succeeds (PointsToGive = 10)
// - One operation fails (insufficient points)
// - Database consistency maintained via transaction isolation
```

## 10. Validation Criteria

### Code Review Checklist

- [ ] User entity includes all required properties with correct types
- [ ] Entity Framework configuration matches database schema specification
- [ ] Email uniqueness is enforced at database level
- [ ] Check constraints prevent negative point values
- [ ] UserService implements all required interface methods
- [ ] User synchronization logic handles all claim variations
- [ ] Point deduction validates sufficient balance before updating
- [ ] All database operations use async/await pattern
- [ ] Appropriate indexes are defined for query performance
- [ ] Migration files are generated and tested

### Testing Checklist

- [ ] All acceptance criteria have automated tests
- [ ] Unit tests cover User entity validation logic
- [ ] Integration tests verify database constraints
- [ ] Tests verify user synchronization from Entra claims
- [ ] Tests verify point deduction with sufficient/insufficient balance
- [ ] Tests verify point addition to PointsReceived
- [ ] Tests verify monthly reset functionality
- [ ] Tests verify duplicate email prevention
- [ ] Concurrent access scenarios are tested
- [ ] Edge cases (missing claims, name format variations) are tested

### Deployment Checklist

- [ ] Database migrations are reviewed and approved
- [ ] Migration scripts tested against non-production database
- [ ] Rollback plan documented for migrations
- [ ] Connection strings configured for all environments
- [ ] Database user permissions verified
- [ ] Monitoring and logging configured for UserService
- [ ] Performance baselines established for key operations

## 11. Related Specifications / Further Reading

- [Cheersly Authentication with Microsoft Entra ID](/workspaces/cheersly/docs/auth-entra.md)
- [Application Functions Specification](/workspaces/cheersly/spec/app-functions.md)
- [Architecture Overview](/workspaces/cheersly/spec/architecture.md)
- [Entity Framework Core Code First Documentation](https://learn.microsoft.com/ef/core/modeling/)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [Npgsql Entity Framework Provider](https://www.npgsql.org/efcore/)
- Future: Cheers Entity and Relationship Specification
- Future: Monthly Point Reset Scheduled Job Specification
- Future: Point Redemption and Store Specification
