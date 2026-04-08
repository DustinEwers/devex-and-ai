using System.Security.Claims;

namespace Cheersly.Api.Middleware;

/// <summary>
/// Middleware to automatically synchronize authenticated users with the database.
/// </summary>
public class UserSyncMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<UserSyncMiddleware> _logger;

    public UserSyncMiddleware(RequestDelegate next, ILogger<UserSyncMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context, Services.IUserService userService)
    {
        // Only sync if user is authenticated
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            try
            {
                // Sync user from claims - this creates or updates the user record
                var user = await userService.SyncUserFromClaimsAsync(context.User);
                
                // Store user in HttpContext items for downstream access
                context.Items["CurrentUser"] = user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing user from claims");
                // Don't fail the request - just log the error
                // The auth system will still work, but user won't be in DB
            }
        }

        await _next(context);
    }
}

/// <summary>
/// Extension methods for registering UserSyncMiddleware.
/// </summary>
public static class UserSyncMiddlewareExtensions
{
    public static IApplicationBuilder UseUserSync(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<UserSyncMiddleware>();
    }
}
