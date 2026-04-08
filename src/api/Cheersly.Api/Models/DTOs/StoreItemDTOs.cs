using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models.DTOs;

public class StoreItemDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointCost { get; set; }
    public string? ImageUrl { get; set; }
    public string Category { get; set; } = string.Empty;
    public int? QuantityAvailable { get; set; }
    public bool IsInStock { get; set; }
}

public class StoreItemDetailDto : StoreItemDto
{
    public int UserCurrentPoints { get; set; }
    public bool UserCanAfford { get; set; }
}

public class CreateStoreItemDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue)]
    public int PointCost { get; set; }
    
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "Other";
    
    [Range(0, int.MaxValue)]
    public int? QuantityAvailable { get; set; }
    
    public bool IsActive { get; set; } = true;
}

public class UpdateStoreItemDto
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue)]
    public int PointCost { get; set; }
    
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Category { get; set; } = "Other";
    
    [Range(0, int.MaxValue)]
    public int? QuantityAvailable { get; set; }
    
    public bool IsActive { get; set; }
}

public class UpdateInventoryDto
{
    [Range(0, int.MaxValue)]
    public int? QuantityAvailable { get; set; }
}
