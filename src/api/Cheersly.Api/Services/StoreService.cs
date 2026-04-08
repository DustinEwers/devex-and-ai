using Cheersly.Api.Data;
using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Cheersly.Api.Services;

public class StoreService : IStoreService
{
    private readonly CheerslyDbContext _context;
    private readonly ILogger<StoreService> _logger;

    public StoreService(CheerslyDbContext context, ILogger<StoreService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<StoreItemDto>> GetActiveItemsAsync(string? category = null)
    {
        var query = _context.StoreItems
            .Where(item => item.IsActive);

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(item => item.Category == category);
        }

        var items = await query
            .OrderBy(item => item.QuantityAvailable == 0 ? 1 : 0) // In-stock items first
            .ThenBy(item => item.Name)
            .Select(item => new StoreItemDto
            {
                Id = item.Id,
                Name = item.Name,
                Description = item.Description,
                PointCost = item.PointCost,
                ImageUrl = item.ImageUrl,
                Category = item.Category,
                QuantityAvailable = item.QuantityAvailable,
                IsInStock = item.QuantityAvailable == null || item.QuantityAvailable > 0
            })
            .ToListAsync();

        return items;
    }

    public async Task<StoreItemDetailDto?> GetItemByIdAsync(Guid id, Guid userId)
    {
        var item = await _context.StoreItems
            .Where(i => i.Id == id)
            .FirstOrDefaultAsync();

        if (item == null)
        {
            return null;
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return null;
        }

        return new StoreItemDetailDto
        {
            Id = item.Id,
            Name = item.Name,
            Description = item.Description,
            PointCost = item.PointCost,
            ImageUrl = item.ImageUrl,
            Category = item.Category,
            QuantityAvailable = item.QuantityAvailable,
            IsInStock = item.QuantityAvailable == null || item.QuantityAvailable > 0,
            UserCurrentPoints = user.PointsReceived,
            UserCanAfford = user.PointsReceived >= item.PointCost
        };
    }

    public async Task<RedeemResponseDto> RedeemItemAsync(Guid userId, Guid itemId)
    {
        // Use execution strategy to handle transactions with retrying logic
        var strategy = _context.Database.CreateExecutionStrategy();
        
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                // Fetch user and item within transaction
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == userId);
                    
                if (user == null)
                {
                    throw new InvalidOperationException("User not found.");
                }

                var item = await _context.StoreItems
                    .FirstOrDefaultAsync(i => i.Id == itemId);
                    
                if (item == null)
                {
                    throw new InvalidOperationException("Store item not found.");
                }

                // Validation: Item must be active
                if (!item.IsActive)
                {
                    throw new InvalidOperationException("Item is not available for purchase.");
                }

                // Validation: Check stock availability
                if (item.QuantityAvailable.HasValue && item.QuantityAvailable <= 0)
                {
                    throw new InvalidOperationException("Item is out of stock.");
                }

                // Validation: User must have sufficient points
                if (user.PointsReceived < item.PointCost)
                {
                    throw new InvalidOperationException(
                        $"Insufficient points. You have {user.PointsReceived} points but need {item.PointCost}.");
                }

                // Deduct points from user
                user.PointsReceived -= item.PointCost;

                // Create order
                var order = new Order
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    StoreItemId = itemId,
                    PointsSpent = item.PointCost,
                    Status = "Pending",
                    OrderedAt = DateTime.UtcNow
                };
                _context.Orders.Add(order);

                // Decrement inventory (if not unlimited)
                if (item.QuantityAvailable.HasValue)
                {
                    item.QuantityAvailable--;
                }

                item.UpdatedAt = DateTime.UtcNow;

                // Save all changes
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation(
                    "User {UserId} redeemed item {ItemId} for {Points} points. Order {OrderId} created.",
                    userId, itemId, item.PointCost, order.Id);

                return new RedeemResponseDto
                {
                    OrderId = order.Id,
                    StoreItemName = item.Name,
                    PointsSpent = item.PointCost,
                    RemainingPoints = user.PointsReceived,
                    OrderedAt = order.OrderedAt,
                    Status = order.Status
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        });
    }

    public async Task<PaginatedOrdersDto> GetUserOrdersAsync(Guid userId, int pageNumber = 1, int pageSize = 20)
    {
        var query = _context.Orders
            .Include(o => o.StoreItem)
            .Where(o => o.UserId == userId);

        var totalCount = await query.CountAsync();

        var orders = await query
            .OrderByDescending(o => o.OrderedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                StoreItemName = o.StoreItem.Name,
                StoreItemImageUrl = o.StoreItem.ImageUrl,
                PointsSpent = o.PointsSpent,
                Status = o.Status,
                OrderedAt = o.OrderedAt,
                FulfilledAt = o.FulfilledAt
            })
            .ToListAsync();

        return new PaginatedOrdersDto
        {
            Orders = orders,
            TotalCount = totalCount,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
    }
}
