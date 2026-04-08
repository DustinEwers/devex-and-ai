using Cheersly.Api.Models.DTOs;
using Cheersly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cheersly.Api.Controllers;

[ApiController]
[Route("api/store")]
[Authorize]
public class StoreController : ControllerBase
{
    private readonly IStoreService _storeService;
    private readonly IUserService _userService;
    private readonly ILogger<StoreController> _logger;

    public StoreController(IStoreService storeService, IUserService userService, ILogger<StoreController> logger)
    {
        _storeService = storeService;
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("items")]
    public async Task<ActionResult<List<StoreItemDto>>> GetItems([FromQuery] string? category = null)
    {
        try
        {
            var items = await _storeService.GetActiveItemsAsync(category);
            return Ok(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving store items");
            return StatusCode(500, new { error = "An error occurred while retrieving store items" });
        }
    }

    [HttpGet("items/{id}")]
    public async Task<ActionResult<StoreItemDetailDto>> GetItemById(Guid id)
    {
        try
        {
            var user = await _userService.SyncUserFromClaimsAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User not found" });
            }

            var item = await _storeService.GetItemByIdAsync(id, user.Id);
            
            if (item == null)
            {
                return NotFound(new { error = "Store item not found." });
            }

            return Ok(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving store item {ItemId}", id);
            return StatusCode(500, new { error = "An error occurred while retrieving the store item" });
        }
    }

    [HttpPost("redeem")]
    public async Task<ActionResult<RedeemResponseDto>> RedeemItem([FromBody] RedeemRequestDto request)
    {
        try
        {
            var user = await _userService.SyncUserFromClaimsAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User not found" });
            }

            var response = await _storeService.RedeemItemAsync(user.Id, request.StoreItemId);
            return Created($"/api/store/orders/{response.OrderId}", response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error redeeming item");
            return StatusCode(500, new { error = "An error occurred while processing your redemption" });
        }
    }

    [HttpGet("orders")]
    public async Task<ActionResult<PaginatedOrdersDto>> GetOrders(
        [FromQuery] int pageNumber = 1, 
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var user = await _userService.SyncUserFromClaimsAsync(User);
            if (user == null)
            {
                return Unauthorized(new { error = "User not found" });
            }

            var orders = await _storeService.GetUserOrdersAsync(user.Id, pageNumber, pageSize);
            return Ok(orders);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving orders");
            return StatusCode(500, new { error = "An error occurred while retrieving your orders" });
        }
    }
}
