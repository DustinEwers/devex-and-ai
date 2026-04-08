using Cheersly.Api.Models.DTOs;

namespace Cheersly.Api.Services;

public interface IStoreService
{
    Task<List<StoreItemDto>> GetActiveItemsAsync(string? category = null);
    Task<StoreItemDetailDto?> GetItemByIdAsync(Guid id, Guid userId);
    Task<RedeemResponseDto> RedeemItemAsync(Guid userId, Guid itemId);
    Task<PaginatedOrdersDto> GetUserOrdersAsync(Guid userId, int pageNumber = 1, int pageSize = 20);
}
