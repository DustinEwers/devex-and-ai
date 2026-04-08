using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models;

public class Order
{
    public Guid Id { get; set; }
    
    [Required]
    public Guid UserId { get; set; }
    
    [Required]
    public Guid StoreItemId { get; set; }
    
    [Range(1, int.MaxValue)]
    public int PointsSpent { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";
    
    public DateTime OrderedAt { get; set; }
    public DateTime? FulfilledAt { get; set; }
    
    [MaxLength(1000)]
    public string? Notes { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
    public StoreItem StoreItem { get; set; } = null!;
}
