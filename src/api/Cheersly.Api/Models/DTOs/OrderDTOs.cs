using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models.DTOs;

public class OrderDto
{
    public Guid Id { get; set; }
    public string StoreItemName { get; set; } = string.Empty;
    public string? StoreItemImageUrl { get; set; }
    public int PointsSpent { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime OrderedAt { get; set; }
    public DateTime? FulfilledAt { get; set; }
}

public class AdminOrderDto : OrderDto
{
    public Guid UserId { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class RedeemRequestDto
{
    [Required]
    public Guid StoreItemId { get; set; }
}

public class RedeemResponseDto
{
    public Guid OrderId { get; set; }
    public string StoreItemName { get; set; } = string.Empty;
    public int PointsSpent { get; set; }
    public int RemainingPoints { get; set; }
    public DateTime OrderedAt { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class UpdateOrderStatusDto
{
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class PaginatedOrdersDto
{
    public List<OrderDto> Orders { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class PaginatedAdminOrdersDto
{
    public List<AdminOrderDto> Orders { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
}

public class OrderStatusUpdateResponseDto
{
    public Guid OrderId { get; set; }
    public string PreviousStatus { get; set; } = string.Empty;
    public string NewStatus { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }
    public string UpdatedBy { get; set; } = string.Empty;
}

public class BulkUpdateOrderStatusDto
{
    [Required]
    [MinLength(1)]
    public List<Guid> OrderIds { get; set; } = new();
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = string.Empty;
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class BulkOrderUpdateResponseDto
{
    public int TotalRequested { get; set; }
    public int SuccessfulUpdates { get; set; }
    public int FailedUpdates { get; set; }
    public List<OrderStatusUpdateResponseDto> SuccessfulOrders { get; set; } = new();
    public List<BulkUpdateError> Errors { get; set; } = new();
}

public class BulkUpdateError
{
    public Guid OrderId { get; set; }
    public string ErrorMessage { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
}
