using Cheersly.Api.Controllers;
using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Cheersly.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;

namespace Cheersly.Api.Tests.Controllers;

[TestClass]
public class AdminStoreControllerTests
{
    private Mock<IAdminStoreService> _mockAdminStoreService = null!;
    private Mock<IUserService> _mockUserService = null!;
    private Mock<ILogger<AdminStoreController>> _mockLogger = null!;
    private AdminStoreController _controller = null!;

    [TestInitialize]
    public void Setup()
    {
        _mockAdminStoreService = new Mock<IAdminStoreService>();
        _mockUserService = new Mock<IUserService>();
        _mockLogger = new Mock<ILogger<AdminStoreController>>();
        _controller = new AdminStoreController(_mockAdminStoreService.Object, _mockUserService.Object, _mockLogger.Object);
        
        // Setup controller context with claims
        var claims = new List<Claim>
        {
            new(ClaimTypes.Email, "admin@example.com"),
            new(ClaimTypes.Role, "Admin")
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var claimsPrincipal = new ClaimsPrincipal(identity);
        
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            }
        };
    }

    [TestMethod]
    public async Task UpdateOrderStatus_ValidRequest_ShouldReturnOkWithResponse()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin"
        };
        
        var updateDto = new UpdateOrderStatusDto
        {
            Status = "Fulfilled",
            Notes = "Order completed"
        };
        
        var expectedResponse = new OrderStatusUpdateResponseDto
        {
            OrderId = orderId,
            PreviousStatus = "Pending",
            NewStatus = "Fulfilled",
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = "admin@example.com"
        };

        _mockUserService.Setup(x => x.SyncUserFromClaimsAsync(It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(user);
        
        _mockAdminStoreService.Setup(x => x.UpdateOrderStatusWithResponseAsync(orderId, updateDto, user.Email))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.UpdateOrderStatus(orderId, updateDto);

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult);
        var response = okResult.Value as OrderStatusUpdateResponseDto;
        Assert.IsNotNull(response);
        Assert.AreEqual(expectedResponse.OrderId, response.OrderId);
        Assert.AreEqual(expectedResponse.NewStatus, response.NewStatus);
    }

    [TestMethod]
    public async Task UpdateOrderStatus_InvalidTransition_ShouldReturnBadRequest()
    {
        // Arrange
        var orderId = Guid.NewGuid();
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin"
        };
        
        var updateDto = new UpdateOrderStatusDto
        {
            Status = "Pending",
            Notes = "Invalid transition"
        };

        _mockUserService.Setup(x => x.SyncUserFromClaimsAsync(It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(user);
        
        _mockAdminStoreService.Setup(x => x.UpdateOrderStatusWithResponseAsync(orderId, updateDto, user.Email))
            .ThrowsAsync(new InvalidOperationException("Cannot transition from Fulfilled to Pending"));

        // Act
        var result = await _controller.UpdateOrderStatus(orderId, updateDto);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult);
        var errorResponse = badRequestResult.Value;
        Assert.IsNotNull(errorResponse);
    }

    [TestMethod]
    public async Task BulkUpdateOrderStatus_ValidRequest_ShouldReturnOkWithResponse()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin"
        };
        
        var bulkUpdateDto = new BulkUpdateOrderStatusDto
        {
            OrderIds = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() },
            Status = "Fulfilled",
            Notes = "Bulk fulfillment"
        };
        
        var expectedResponse = new BulkOrderUpdateResponseDto
        {
            TotalRequested = 2,
            SuccessfulUpdates = 2,
            FailedUpdates = 0,
            SuccessfulOrders = new List<OrderStatusUpdateResponseDto>
            {
                new() { OrderId = bulkUpdateDto.OrderIds[0], NewStatus = "Fulfilled" },
                new() { OrderId = bulkUpdateDto.OrderIds[1], NewStatus = "Fulfilled" }
            },
            Errors = new List<BulkUpdateError>()
        };

        _mockUserService.Setup(x => x.SyncUserFromClaimsAsync(It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(user);
        
        _mockAdminStoreService.Setup(x => x.BulkUpdateOrderStatusAsync(bulkUpdateDto, user.Email))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.BulkUpdateOrderStatus(bulkUpdateDto);

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult);
        var response = okResult.Value as BulkOrderUpdateResponseDto;
        Assert.IsNotNull(response);
        Assert.AreEqual(expectedResponse.TotalRequested, response.TotalRequested);
        Assert.AreEqual(expectedResponse.SuccessfulUpdates, response.SuccessfulUpdates);
    }

    [TestMethod]
    public async Task BulkUpdateOrderStatus_TooManyOrders_ShouldReturnBadRequest()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            Role = "Admin"
        };
        
        var bulkUpdateDto = new BulkUpdateOrderStatusDto
        {
            OrderIds = Enumerable.Range(0, 1001).Select(_ => Guid.NewGuid()).ToList(),
            Status = "Fulfilled",
            Notes = "Too many orders"
        };

        _mockUserService.Setup(x => x.SyncUserFromClaimsAsync(It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(user);

        // Act
        var result = await _controller.BulkUpdateOrderStatus(bulkUpdateDto);

        // Assert
        var badRequestResult = result.Result as BadRequestObjectResult;
        Assert.IsNotNull(badRequestResult);
        Assert.IsNotNull(badRequestResult.Value);
    }

    [TestMethod]
    public async Task GetAllOrders_WithFilters_ShouldReturnFilteredResults()
    {
        // Arrange
        var expectedResponse = new PaginatedAdminOrdersDto
        {
            Orders = new List<AdminOrderDto>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    UserEmail = "user@example.com",
                    Status = "Pending",
                    StoreItemName = "Test Item",
                    PointsSpent = 10,
                    OrderedAt = DateTime.UtcNow
                }
            },
            TotalCount = 1,
            PageNumber = 1,
            PageSize = 50
        };

        _mockAdminStoreService.Setup(x => x.GetAllOrdersAsync(
            "Pending", "user@example.com", null, null, 1, 50))
            .ReturnsAsync(expectedResponse);

        // Act
        var result = await _controller.GetAllOrders("Pending", "user@example.com", null, null, 1, 50);

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult);
        var response = okResult.Value as PaginatedAdminOrdersDto;
        Assert.IsNotNull(response);
        Assert.AreEqual(expectedResponse.TotalCount, response.TotalCount);
        Assert.AreEqual(1, response.Orders.Count);
    }

    [TestMethod]
    public void GetValidOrderStatuses_ShouldReturnStatusesAndTransitions()
    {
        // Act
        var result = _controller.GetValidOrderStatuses();

        // Assert
        var okResult = result.Result as OkObjectResult;
        Assert.IsNotNull(okResult);
        Assert.IsNotNull(okResult.Value);
    }
}