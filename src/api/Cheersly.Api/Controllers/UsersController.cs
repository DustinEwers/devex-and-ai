using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cheersly.Api.Services;

namespace Cheersly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Get all users in the system.
    /// </summary>
    /// <returns>List of all users</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all users");
            return Problem(
                title: "Error Retrieving Users",
                detail: "An error occurred while retrieving users",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }

    /// <summary>
    /// Get the current authenticated user's data, creating or updating the user record as needed.
    /// This endpoint triggers user synchronization from Entra ID claims.
    /// </summary>
    /// <returns>The current user's data</returns>
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var user = await _userService.SyncUserFromClaimsAsync(User);
            
            if (user == null)
            {
                _logger.LogWarning("User sync returned null for authenticated user");
                return Problem(
                    title: "User Sync Failed",
                    detail: "Unable to sync user data from authentication claims",
                    statusCode: StatusCodes.Status500InternalServerError
                );
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error syncing current user");
            return Problem(
                title: "User Sync Error",
                detail: "An error occurred while syncing user data",
                statusCode: StatusCodes.Status500InternalServerError
            );
        }
    }
}
