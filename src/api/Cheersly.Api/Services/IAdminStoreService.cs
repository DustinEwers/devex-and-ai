using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;

namespace Cheersly.Api.Services;

public interface IAdminStoreService
{
    Task<IEnumerable<StoreItem>> GetAllStoreItemsAsync();
    Task<StoreItem> CreateStoreItemAsync(CreateStoreItemDto dto);
    Task<StoreItem?> UpdateStoreItemAsync(Guid id, UpdateStoreItemDto dto);
    Task<bool> UpdateInventoryAsync(Guid id, UpdateInventoryDto dto);
    Task<PaginatedAdminOrdersDto> GetAllOrdersAsync(string? status = null, string? userEmail = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 50);
    Task<bool> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusDto dto);
    Task<OrderStatusUpdateResponseDto> UpdateOrderStatusWithResponseAsync(Guid orderId, UpdateOrderStatusDto dto, string updatedBy);
    Task<BulkOrderUpdateResponseDto> BulkUpdateOrderStatusAsync(BulkUpdateOrderStatusDto dto, string updatedBy);
}
