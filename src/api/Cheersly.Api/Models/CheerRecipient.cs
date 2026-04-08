using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models;

public class CheerRecipient
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    public Guid CheerId { get; set; }

    [Required]
    public Guid RecipientId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int PointsAwarded { get; set; }

    // Navigation properties
    public Cheer Cheer { get; set; } = null!;
    public User Recipient { get; set; } = null!;
}
