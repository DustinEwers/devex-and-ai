using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models.DTOs;

public class CreateCheerRequest
{
    [Required(ErrorMessage = "Message is required")]
    [MaxLength(2000, ErrorMessage = "Message cannot exceed 2000 characters")]
    public string Message { get; set; } = string.Empty;

    [Required(ErrorMessage = "Points per recipient is required")]
    [Range(1, int.MaxValue, ErrorMessage = "Points per recipient must be at least 1")]
    public int PointsPerRecipient { get; set; }

    [Required(ErrorMessage = "At least one recipient is required")]
    [MinLength(1, ErrorMessage = "At least one recipient is required")]
    [MaxLength(100, ErrorMessage = "Cannot send to more than 100 recipients")]
    public List<Guid> RecipientIds { get; set; } = new();
}
