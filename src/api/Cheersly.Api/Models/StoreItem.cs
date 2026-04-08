using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models;

public class StoreItem
{
    public Guid Id { get; set; }
    
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
    public int? QuantityAvailable { get; set; } // null = unlimited
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
