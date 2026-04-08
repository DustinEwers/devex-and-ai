using System.Security.Claims;
using Cheersly.Api.Models;

namespace Cheersly.Api.Services;

/// <summary>
/// Service for managing user data and synchronization.
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Synchronizes user from Entra claims. Creates if new, updates if exists.
    /// </summary>
    /// <param name="principal">The claims principal from authentication.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The synchronized user.</returns>
    Task<User> SyncUserFromClaimsAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets a user by their email address.
    /// </summary>
    /// <param name="email">The user's email address.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user if found, null otherwise.</returns>
    Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets a user by their ID.
    /// </summary>
    /// <param name="id">The user's ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The user if found, null otherwise.</returns>
    Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Gets all users in the system.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of all users.</returns>
    Task<List<User>> GetAllUsersAsync(CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Deducts points from a user's PointsToGive balance.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="points">The number of points to deduct.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if successful, false if insufficient points.</returns>
    Task<bool> DeductPointsAsync(Guid userId, int points, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Adds points to a user's PointsReceived balance.
    /// </summary>
    /// <param name="userId">The user's ID.</param>
    /// <param name="points">The number of points to add.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task AddReceivedPointsAsync(Guid userId, int points, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Resets all users' PointsToGive to the default monthly allocation (50 points).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task ResetMonthlyPointsAsync(CancellationToken cancellationToken = default);
}
