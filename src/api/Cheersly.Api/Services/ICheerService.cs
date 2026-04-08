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
    /// Gets the public feed of all cheers, ordered by creation date descending.
    /// </summary>
    /// <param name="skip">Number of cheers to skip for pagination</param>
    /// <param name="take">Number of cheers to take for pagination</param>
    /// <returns>List of cheer DTOs</returns>
    Task<List<CheerDTO>> GetFeedAsync(int skip = 0, int take = 20);

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
