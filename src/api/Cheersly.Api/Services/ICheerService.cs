using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;

namespace Cheersly.Api.Services;

public interface ICheerService
{
    /// <summary>
    /// Creates a new cheer with atomic point transfers.
    /// </summary>
    /// <param name="senderId">The ID of the user sending the cheer</param>
    /// <param name="request">The cheer creation request</param>
    /// <returns>The created cheer DTO</returns>
    Task<CheerDTO> CreateCheerAsync(Guid senderId, CreateCheerRequest request);

    /// <summary>
    /// Gets the public feed of all cheers.
    /// </summary>
    /// <param name="skip">Number of cheers to skip for pagination</param>
    /// <param name="take">Number of cheers to take for pagination</param>
    /// <param name="sortBy">Sort field</param>
    /// <param name="sortDirection">Sort direction</param>
    /// <param name="filterMode">Feed filter mode</param>
    /// <param name="currentUserId">Current authenticated user ID (required for DirectedAtMe filter)</param>
    /// <returns>List of cheer DTOs</returns>
    Task<List<CheerDTO>> GetFeedAsync(
        int skip = 0,
        int take = 20,
        FeedSortBy sortBy = FeedSortBy.CreatedAt,
        FeedSortDirection sortDirection = FeedSortDirection.Desc,
        FeedFilterMode filterMode = FeedFilterMode.All,
        Guid? currentUserId = null);

    /// <summary>
    /// Gets all cheers sent by a specific user.
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="skip">Number of cheers to skip for pagination</param>
    /// <param name="take">Number of cheers to take for pagination</param>
    /// <returns>List of cheer DTOs</returns>
    Task<List<CheerDTO>> GetCheersSentAsync(Guid userId, int skip = 0, int take = 20);

    /// <summary>
    /// Gets all cheers received by a specific user.
    /// </summary>
    /// <param name="userId">The ID of the user</param>
    /// <param name="skip">Number of cheers to skip for pagination</param>
    /// <param name="take">Number of cheers to take for pagination</param>
    /// <returns>List of cheer DTOs</returns>
    Task<List<CheerDTO>> GetCheersReceivedAsync(Guid userId, int skip = 0, int take = 20);

    /// <summary>
    /// Gets a specific cheer by ID.
    /// </summary>
    /// <param name="cheerID">The ID of the cheer</param>
    /// <returns>The cheer DTO, or null if not found</returns>
    Task<CheerDTO?> GetCheerByIdAsync(Guid cheerID);
}
