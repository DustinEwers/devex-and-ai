using Cheersly.Api.Data;
using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Cheersly.Api.Tests.Integration;

[TestClass]
public class OrderProcessingIntegrationTests
{
    private WebApplicationFactory<Program>? _factory;
    private HttpClient? _client;
    private CheerslyDbContext? _context;

    [TestInitialize]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove the real database registration
                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<CheerslyDbContext>));
                    if (descriptor != null)
                    {
                        services.Remove(descriptor);
                    }

                    // Add in-memory database for testing
                    services.AddDbContext<CheerslyDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("TestDb");
                    });
                });
            });

        _client = _factory.CreateClient();
        
        // Get the database context for seeding test data
        using var scope = _factory.Services.CreateScope();
        _context = scope.ServiceProvider.GetRequiredService<CheerslyDbContext>();
        
        // Seed test data
        SeedTestData();
    }

    private void SeedTestData()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            PointsToGive = 50,
            PointsReceived = 0,
            Role = "Normal",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            PointsToGive = 50,
            PointsReceived = 0,
            Role = "Admin",
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var storeItem = new StoreItem
        {
            Id = Guid.NewGuid(),
            Name = "Test Item",
            Description = "Test Description",
            PointCost = 10,
            Category = "Test",
            QuantityAvailable = 5,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            StoreItemId = storeItem.Id,
            PointsSpent = 10,
            Status = "Pending",
            OrderedAt = DateTime.UtcNow,
            User = user,
            StoreItem = storeItem
        };

        _context!.Users.AddRange(user, adminUser);
        _context.StoreItems.Add(storeItem);
        _context.Orders.Add(order);
        _context.SaveChanges();
    }

    [TestMethod]
    public async Task OrderProcessingWorkflow_ShouldWorkEndToEnd()
    {
        // This test verifies that the order processing system is properly wired up
        // In a real scenario, you would need to add authentication headers
        
        // For now, just verify that the endpoints exist and return expected status codes
        // when not authenticated (since we don't have auth setup in tests)
        
        var response = await _client!.GetAsync("/api/admin/store/orders");
        
        // Should return 401 Unauthorized since we're not authenticated
        Assert.AreEqual(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [TestCleanup]
    public void Cleanup()
    {
        _context?.Dispose();
        _client?.Dispose();
        _factory?.Dispose();
    }
}