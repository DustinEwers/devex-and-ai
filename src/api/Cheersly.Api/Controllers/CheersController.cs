using Cheersly.Api.Models.DTOs;
using Cheersly.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cheersly.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CheersController : ControllerBase
{
    private readonly ICheerService _cheerService;
    private readonly IUserService _userService;
    private readonly ILogger<CheersController> _logger;

    public CheersController(ICheerService cheerService, IUserService userService, ILogger<CheersController> logger)
    {
        _cheerService = cheerService;
        _userService = userService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new cheer
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CheerDTO), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateCheer([FromBody] CreateCheerRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(new ErrorResponse 
                { 
                    Error = "Validation failed", 
                    Details = errors 
                });
            }

            // Get the current user from claims
            var user = await _userService.SyncUserFromClaimsAsync(User);
            if (user == null)
            {
                _logger.LogWarning("Cheer creation failed: Unable to sync user from claims");
                return Unauthorized();
            }

            var cheer = await _cheerService.CreateCheerAsync(user.Id, request);
            
            return CreatedAtAction(nameof(GetCheerById), new { id = cheer.Id }, cheer);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Cheer creation failed: Validation error");
            return BadRequest(new ErrorResponse 
            { 
                Error = ex.Message, 
                Details = new List<string>() 
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Cheer creation failed: Business rule violation");
            return BadRequest(new ErrorResponse 
            { 
                Error = ex.Message, 
                Details = new List<string>() 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Cheer creation failed: Unexpected error");
            return StatusCode(500, new ErrorResponse 
            { 
                Error = "An unexpected error occurred", 
                Details = new List<string>() 
            });
        }
    }

    /// <summary>
    /// Get the public feed of all cheers
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<CheerDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetFeed([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var cheers = await _cheerService.GetFeedAsync(skip, take);
        return Ok(cheers);
    }

    /// <summary>
    /// Get all cheers sent by the authenticated user
    /// </summary>
    [HttpGet("sent")]
    [ProducesResponseType(typeof(List<CheerDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCheersSent([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var user = await _userService.SyncUserFromClaimsAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var cheers = await _cheerService.GetCheersSentAsync(user.Id, skip, take);
        return Ok(cheers);
    }

    /// <summary>
    /// Get all cheers received by the authenticated user
    /// </summary>
    [HttpGet("received")]
    [ProducesResponseType(typeof(List<CheerDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCheersReceived([FromQuery] int skip = 0, [FromQuery] int take = 20)
    {
        var user = await _userService.SyncUserFromClaimsAsync(User);
        if (user == null)
        {
            return Unauthorized();
        }

        var cheers = await _cheerService.GetCheersReceivedAsync(user.Id, skip, take);
        return Ok(cheers);
    }

    /// <summary>
    /// Get a specific cheer by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(CheerDTO), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCheerById(Guid id)
    {
        var cheer = await _cheerService.GetCheerByIdAsync(id);
        
        if (cheer == null)
        {
            return NotFound();
        }

        return Ok(cheer);
    }
}
