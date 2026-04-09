using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using Cheersly.Api.Data;
using Cheersly.Api.Models;
using Cheersly.Api.Services;

namespace Cheersly.Api.Tests;

[TestClass]
public class UserServiceTests
{
    private static async Task<TException> AssertThrowsAsync<TException>(Func<Task> action)
        where TException : Exception
    {
        try
        {
            await action();
        }
        catch (TException exception)
        {
            return exception;
        }

        Assert.Fail($"Expected exception of type {typeof(TException).Name}.");
        throw new InvalidOperationException("Unreachable");
    }

    private CheerslyDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<CheerslyDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new CheerslyDbContext(options);
    }

    [TestMethod]
    public async Task SyncUserFromClaimsAsync_CreatesNewUser_WhenUserDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var claims = new[]
        {
            new Claim("preferred_username", "test@example.com"),
            new Claim("given_name", "Test"),
            new Claim("family_name", "User")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        // Act
        var user = await service.SyncUserFromClaimsAsync(principal);

        // Assert
        Assert.IsNotNull(user);
        Assert.AreEqual("test@example.com", user.Email);
        Assert.AreEqual("Test", user.FirstName);
        Assert.AreEqual("User", user.LastName);
        Assert.AreEqual(50, user.PointsToGive);
        Assert.AreEqual(0, user.PointsReceived);
        
        var dbUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "test@example.com");
        Assert.IsNotNull(dbUser);
    }

    [TestMethod]
    public async Task SyncUserFromClaimsAsync_UpdatesExistingUser_WhenNameChanges()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var existingUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "OldFirst",
            LastName = "OldLast",
            Role = "Normal",
            PointsToGive = 30,
            PointsReceived = 25,
            CreatedAt = DateTime.UtcNow.AddDays(-10),
            LastLoginAt = DateTime.UtcNow.AddDays(-1),
            LastPointsReset = DateTime.UtcNow.AddDays(-1)
        };
        context.Users.Add(existingUser);
        await context.SaveChangesAsync();

        var claims = new[]
        {
            new Claim("preferred_username", "test@example.com"),
            new Claim("given_name", "NewFirst"),
            new Claim("family_name", "NewLast")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        // Act
        var user = await service.SyncUserFromClaimsAsync(principal);

        // Assert
        Assert.IsNotNull(user);
        Assert.AreEqual("NewFirst", user.FirstName);
        Assert.AreEqual("NewLast", user.LastName);
        Assert.AreEqual(30, user.PointsToGive); // Should not reset
        Assert.AreEqual(25, user.PointsReceived); // Should not change
    }

    [TestMethod]
    public async Task DeductPointsAsync_ValidDeduction_DeductsPointsSuccessfully()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeductPointsAsync(user.Id, 20);

        // Assert
        Assert.IsTrue(result);
        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.AreEqual(30, updatedUser!.PointsToGive);
    }

    [TestMethod]
    public async Task DeductPointsAsync_ReturnsFalse_WhenInsufficientPoints()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 10,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeductPointsAsync(user.Id, 20);

        // Assert
        Assert.IsFalse(result);
        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.AreEqual(10, updatedUser!.PointsToGive); // Should not change
    }

    [TestMethod]
    public async Task AddReceivedPointsAsync_IncreasesPointsReceived()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 10,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        await service.AddReceivedPointsAsync(user.Id, 15);

        // Assert
        var updatedUser = await context.Users.FindAsync(user.Id);
        Assert.AreEqual(25, updatedUser!.PointsReceived);
    }

    [TestMethod]
    public async Task ResetMonthlyPointsAsync_ResetsAllUsersPoints()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var users = new[]
        {
            new User
            {
                Id = Guid.NewGuid(),
                Email = "user1@example.com",
                FirstName = "User",
                LastName = "One",
                Role = "Normal",
                PointsToGive = 10,
                PointsReceived = 25,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                LastPointsReset = DateTime.UtcNow.AddMonths(-1)
            },
            new User
            {
                Id = Guid.NewGuid(),
                Email = "user2@example.com",
                FirstName = "User",
                LastName = "Two",
                Role = "Normal",
                PointsToGive = 0,
                PointsReceived = 100,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                LastPointsReset = DateTime.UtcNow.AddMonths(-1)
            }
        };
        context.Users.AddRange(users);
        await context.SaveChangesAsync();

        // Act
        await service.ResetMonthlyPointsAsync();

        // Assert
        var allUsers = await context.Users.ToListAsync();
        foreach (var user in allUsers)
        {
            Assert.AreEqual(50, user.PointsToGive);
            // PointsReceived should not change
        }
        Assert.AreEqual(25, allUsers[0].PointsReceived);
        Assert.AreEqual(100, allUsers[1].PointsReceived);
    }

    [TestMethod]
    public async Task GetUserByEmailAsync_ReturnsUser_WhenExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetUserByEmailAsync("test@example.com");

        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual("test@example.com", result.Email);
    }

    [TestMethod]
    public async Task GetUserByEmailAsync_ReturnsNull_WhenNotExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        // Act
        var result = await service.GetUserByEmailAsync("nonexistent@example.com");

        // Assert
        Assert.IsNull(result);
    }

    [TestMethod]
    public async Task SyncUserFromClaimsAsync_Throws_WhenPrincipalIsNotAuthenticated()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);
        var principal = new ClaimsPrincipal(new ClaimsIdentity());

        // Act & Assert
    await AssertThrowsAsync<InvalidOperationException>(
            () => service.SyncUserFromClaimsAsync(principal));
    }

    [TestMethod]
    public async Task SyncUserFromClaimsAsync_UsesNameClaimFallback_WhenGivenAndFamilyNameMissing()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var claims = new[]
        {
            new Claim("preferred_username", "fallback@example.com"),
            new Claim("name", "Pat Smith")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        // Act
        var user = await service.SyncUserFromClaimsAsync(principal);

        // Assert
        Assert.AreEqual("Pat", user.FirstName);
        Assert.AreEqual("Smith", user.LastName);
    }

    [TestMethod]
    public async Task SyncUserFromClaimsAsync_UsesEmailPrefixFallback_WhenNameClaimsAreMissing()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var claims = new[]
        {
            new Claim("preferred_username", "fallback.user@example.com")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        // Act
        var user = await service.SyncUserFromClaimsAsync(principal);

        // Assert
        Assert.AreEqual("fallback.user", user.FirstName);
        Assert.AreEqual(string.Empty, user.LastName);
    }

    [TestMethod]
    public async Task SyncUserFromClaimsAsync_UsesRolesClaim_WhenStandardRoleClaimIsMissing()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        var claims = new[]
        {
            new Claim("preferred_username", "admin@example.com"),
            new Claim("given_name", "Admin"),
            new Claim("family_name", "User"),
            new Claim("roles", "Admin")
        };
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, "TestAuth"));

        // Act
        var user = await service.SyncUserFromClaimsAsync(principal);

        // Assert
        Assert.AreEqual("Admin", user.Role);
    }

    [TestMethod]
    public async Task DeductPointsAsync_Throws_WhenPointsAreNegative()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        // Act & Assert
    await AssertThrowsAsync<ArgumentException>(
            () => service.DeductPointsAsync(Guid.NewGuid(), -1));
    }

    [TestMethod]
    public async Task AddReceivedPointsAsync_Throws_WhenUserDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        // Act & Assert
    await AssertThrowsAsync<InvalidOperationException>(
            () => service.AddReceivedPointsAsync(Guid.NewGuid(), 5));
    }

    [TestMethod]
    public async Task AddReceivedPointsAsync_Throws_WhenPointsAreNegative()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var logger = new Mock<ILogger<UserService>>();
        var service = new UserService(context, logger.Object);

        // Act & Assert
        await AssertThrowsAsync<ArgumentException>(
            () => service.AddReceivedPointsAsync(Guid.NewGuid(), -5));
    }
}
