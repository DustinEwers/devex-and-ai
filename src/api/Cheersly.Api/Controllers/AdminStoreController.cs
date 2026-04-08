using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Cheersly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cheersly.Api.Controllers;

[ApiController]
[Route("api/admin/store")]
[Authorize] // Temporarily remove role requirement for development
public class AdminStoreController : ControllerBase
{
    private readonly IAdminStoreService _adminStoreService;
    private readonly IUserService _userService;
    private readonly ILogger<AdminStoreController> _logger;

    public AdminStoreController(IAdminStoreService adminStoreService, IUserService userService, ILogger<AdminStoreController> logger)
    {
        _adminStoreService = adminStoreService;
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("items")]
    public async Task<ActionResult<IEnumerable<StoreItem>>> GetAllItems()
    {
        try
        {
            var items = await _adminStoreService.GetAllStoreItemsAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving store items");
            return StatusCode(500, new { error = "An error occurred while retrieving store items" });
        }
    }

    [HttpPost("items")]
    public async Task<ActionResult<StoreItem>> CreateItem([FromBody] CreateStoreItemDto dto)
    {
        try
        {
            var item = await _adminStoreService.CreateStoreItemAsync(dto);
            return Created($"/api/admin/store/items/{item.Id}", item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating store item");
            return StatusCode(500, new { error = "An error occurred while creating the store item" });
        }
    }

    [HttpPut("items/{id}")]
    public async Task<ActionResult<StoreItem>> UpdateItem(Guid id, [FromBody] UpdateStoreItemDto dto)
    {
        try
        {
            var item = await _adminStoreService.UpdateStoreItemAsync(id, dto);
            if (item == null)
            {
                return NotFound(new { error = "Store item not found." });
            }
            return Ok(item);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating store item {ItemId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the store item" });
        }
    }

    [HttpPatch("items/{id}/inventory")]
    public async Task<ActionResult> UpdateInventory(Guid id, [FromBody] UpdateInventoryDto dto)
    {
        try
        {
            var success = await _adminStoreService.UpdateInventoryAsync(id, dto);
            if (!success)
            {
                return NotFound(new { error = "Store item not found." });
            }
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating inventory for item {ItemId}", id);
            return StatusCode(500, new { error = "An error occurred while updating inventory" });
        }
    }

    [HttpGet("orders")]
    public async Task<ActionResult<PaginatedAdminOrdersDto>> GetAllOrders(
        [FromQuery] string? status = null,
        [FromQuery] string? userEmail = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            var orders = await _adminStoreService.GetAllOrdersAsync(status, userEmail, fromDate, toDate, pageNumber, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders");
            return StatusCode(500, new { error = "An error occurred while retrieving orders" });
        }
    }

    [HttpPut("orders/{id}/status")]
    public async Task<ActionResult<OrderStatusUpdateResponseDto>> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        try
        {
            var user = await _userService.SyncUserFromClaimsAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User not found" });
            }

            var result = await _adminStoreService.UpdateOrderStatusWithResponseAsync(id, dto, user.Email);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating order status for {OrderId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the order status" });
        }
    }

    [HttpPatch("orders/bulk-update")]
    public async Task<ActionResult<BulkOrderUpdateResponseDto>> BulkUpdateOrderStatus([FromBody] BulkUpdateOrderStatusDto dto)
    {
        try
        {
            var user = await _userService.SyncUserFromClaimsAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User not found" });
            }

            if (dto.OrderIds.Count > 1000)
            {
                return BadRequest(new { error = "Cannot process more than 1000 orders in a single bulk operation" });
            }

            var result = await _adminStoreService.BulkUpdateOrderStatusAsync(dto, user.Email);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during bulk order status update");
            return StatusCode(500, new { error = "An error occurred while processing the bulk update" });
        }
    }

    [HttpGet("orders/statuses")]
    public ActionResult<object> GetValidOrderStatuses()
    {
        return Ok(new
        {
            statuses = new[] { "Pending", "Fulfilled", "Cancelled" },
            transitions = new
            {
                Pending = new[] { "Fulfilled", "Cancelled" },
                Fulfilled = Array.Empty<string>(),
                Cancelled = Array.Empty<string>()
            }
        });
    }
}
