using Cheersly.Api.Data;
using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Cheersly.Api.Services;

public class AdminStoreService : IAdminStoreService
{
    private readonly CheerslyDbContext _context;
    private readonly ILogger<AdminStoreService> _logger;

    public AdminStoreService(CheerslyDbContext context, ILogger<AdminStoreService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<StoreItem>> GetAllStoreItemsAsync()
    {
        return await _context.StoreItems
            .OrderBy(i => i.Name)
            .ToListAsync();
    }

    public async Task<StoreItem> CreateStoreItemAsync(CreateStoreItemDto dto)
    {
        // Check for duplicate name
        var existingItem = await _context.StoreItems
            .FirstOrDefaultAsync(i => i.Name == dto.Name);
            
        if (existingItem != null)
        {
            throw new InvalidOperationException($"A store item with the name '{dto.Name}' already exists.");
        }

        var item = new StoreItem
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            PointCost = dto.PointCost,
            ImageUrl = dto.ImageUrl,
            Category = dto.Category,
            QuantityAvailable = dto.QuantityAvailable,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.StoreItems.Add(item);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created store item {ItemId} with name '{Name}'", item.Id, item.Name);

        return item;
    }

    public async Task<StoreItem?> UpdateStoreItemAsync(Guid id, UpdateStoreItemDto dto)
    {
        var item = await _context.StoreItems.FindAsync(id);
        if (item == null)
        {
            return null;
        }

        // Check for duplicate name (excluding current item)
        var duplicateName = await _context.StoreItems
            .AnyAsync(i => i.Name == dto.Name && i.Id != id);
            
        if (duplicateName)
        {
            throw new InvalidOperationException($"A store item with the name '{dto.Name}' already exists.");
        }

        item.Name = dto.Name;
        item.Description = dto.Description;
        item.PointCost = dto.PointCost;
        item.ImageUrl = dto.ImageUrl;
        item.Category = dto.Category;
        item.QuantityAvailable = dto.QuantityAvailable;
        item.IsActive = dto.IsActive;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated store item {ItemId}", id);

        return item;
    }

    public async Task<bool> UpdateInventoryAsync(Guid id, UpdateInventoryDto dto)
    {
        var item = await _context.StoreItems.FindAsync(id);
        if (item == null)
        {
            return false;
        }

        item.QuantityAvailable = dto.QuantityAvailable;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated inventory for item {ItemId} to {Quantity}", 
            id, dto.QuantityAvailable?.ToString() ?? "unlimited");

        return true;
    }

    public async Task<PaginatedAdminOrdersDto> GetAllOrdersAsync(string? status = null, int pageNumber = 1, int pageSize = 50)
    {
        var query = _context.Orders
            .Include(o => o.User)
            .Include(o => o.StoreItem)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status == status);
        }

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new AdminOrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserEmail = o.User.Email,
                UserName = $"{o.User.FirstName} {o.User.LastName}",
                StoreItemName = o.StoreItem.Name,
                StoreItemImageUrl = o.StoreItem.ImageUrl,
                PointsSpent = o.PointsSpent,
                Status = o.Status,
                OrderedAt = o.OrderedAt,
                FulfilledAt = o.FulfilledAt,
                Notes = o.Notes
            })
            .ToListAsync();

        return new PaginatedAdminOrdersDto
        {
            Orders = orders,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

    public async Task<bool> UpdateOrderStatusAsync(Guid orderId, UpdateOrderStatusDto dto)
    {
        var response = await UpdateOrderStatusWithResponseAsync(orderId, dto, "System");
        return response != null;
    }

    public async Task<OrderStatusUpdateResponseDto> UpdateOrderStatusWithResponseAsync(Guid orderId, UpdateOrderStatusDto dto, string updatedBy)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        
        try
        {
            var order = await _context.Orders
                .Include(o => o.StoreItem)
                .FirstOrDefaultAsync(o => o.Id == orderId);
                
            if (order == null)
            {
                throw new InvalidOperationException("Order not found.");
            }

            // Validate status transition
            var currentStatus = OrderStatusExtensions.FromString(order.Status);
            var newStatus = OrderStatusExtensions.FromString(dto.Status);
            
            if (!currentStatus.CanTransitionTo(newStatus))
            {
                throw new InvalidOperationException($"Cannot transition from {currentStatus} to {newStatus}. Valid transitions are: {string.Join(", ", currentStatus.GetValidNextStates())}");
            }

            var previousStatus = order.Status;
            order.Status = dto.Status;
            order.Notes = dto.Notes;
            var updatedAt = DateTime.UtcNow;

            // Set FulfilledAt when status changes to Fulfilled
            if (newStatus == OrderStatus.Fulfilled && order.FulfilledAt == null)
            {
                order.FulfilledAt = updatedAt;
            }

            // Handle inventory adjustment for cancelled orders
            if (newStatus == OrderStatus.Cancelled && order.StoreItem.QuantityAvailable.HasValue)
            {
                order.StoreItem.QuantityAvailable++;
                order.StoreItem.UpdatedAt = updatedAt;
                _logger.LogInformation("Incremented inventory for item {ItemId} due to order cancellation", order.StoreItem.Id);
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Updated order {OrderId} status from {PreviousStatus} to {NewStatus} by {UpdatedBy}", 
                orderId, previousStatus, dto.Status, updatedBy);

            return new OrderStatusUpdateResponseDto
            {
                OrderId = orderId,
                PreviousStatus = previousStatus,
                NewStatus = dto.Status,
                UpdatedAt = updatedAt,
                UpdatedBy = updatedBy
            };
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<BulkOrderUpdateResponseDto> BulkUpdateOrderStatusAsync(BulkUpdateOrderStatusDto dto, string updatedBy)
    {
        var response = new BulkOrderUpdateResponseDto
        {
            TotalRequested = dto.OrderIds.Count
        };

        // Process orders in batches to prevent overwhelming the database
        const int batchSize = 50;
        var batches = dto.OrderIds.Chunk(batchSize);

        foreach (var batch in batches)
        {
            await ProcessOrderBatch(batch.ToList(), dto.Status, dto.Notes, updatedBy, response);
        }

        response.SuccessfulUpdates = response.SuccessfulOrders.Count;
        response.FailedUpdates = response.Errors.Count;

        _logger.LogInformation("Bulk update completed: {Successful} successful, {Failed} failed out of {Total} requested", 
            response.SuccessfulUpdates, response.FailedUpdates, response.TotalRequested);

        return response;
    }

    private async Task ProcessOrderBatch(List<Guid> orderIds, string status, string? notes, string updatedBy, BulkOrderUpdateResponseDto response)
    {
        foreach (var orderId in orderIds)
        {
            try
            {
                var updateDto = new UpdateOrderStatusDto
                {
                    Status = status,
                    Notes = notes
                };

                var result = await UpdateOrderStatusWithResponseAsync(orderId, updateDto, updatedBy);
                response.SuccessfulOrders.Add(result);
            }
            catch (Exception ex)
            {
                response.Errors.Add(new BulkUpdateError
                {
                    OrderId = orderId,
                    ErrorMessage = ex.Message,
                    ErrorCode = ex.GetType().Name
                });
                
                _logger.LogWarning(ex, "Failed to update order {OrderId} during bulk operation", orderId);
            }
        }
    }

    public async Task<PaginatedAdminOrdersDto> GetAllOrdersAsync(string? status = null, string? userEmail = null, DateTime? fromDate = null, DateTime? toDate = null, int pageNumber = 1, int pageSize = 50)
    {
        var query = _context.Orders
            .Include(o => o.User)
            .Include(o => o.StoreItem)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrEmpty(userEmail))
        {
            query = query.Where(o => o.User.Email.Contains(userEmail));
        }

        if (fromDate.HasValue)
        {
            query = query.Where(o => o.OrderedAt >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(o => o.OrderedAt <= toDate.Value);
        }

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new AdminOrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserEmail = o.User.Email,
                UserName = $"{o.User.FirstName} {o.User.LastName}",
                StoreItemName = o.StoreItem.Name,
                StoreItemImageUrl = o.StoreItem.ImageUrl,
                PointsSpent = o.PointsSpent,
                Status = o.Status,
                OrderedAt = o.OrderedAt,
                FulfilledAt = o.FulfilledAt,
                Notes = o.Notes
            })
            .ToListAsync();

        return new PaginatedAdminOrdersDto
        {
            Orders = orders,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }

}
