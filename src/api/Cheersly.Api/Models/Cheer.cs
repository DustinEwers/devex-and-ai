using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models;

public class Cheer
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid SenderId { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [Range(1, int.MaxValue)]
    public int PointsPerRecipient { get; set; }

    [Required]
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public User Sender { get; set; } = null!;
    public ICollection<CheerRecipient> Recipients { get; set; } = new List<CheerRecipient>();
}
