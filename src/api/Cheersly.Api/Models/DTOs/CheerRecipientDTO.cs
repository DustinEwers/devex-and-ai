namespace Cheersly.Api.Models.DTOs;

public class CheerRecipientDTO
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public string RecipientFirstName { get; set; } = string.Empty;
    public string RecipientLastName { get; set; } = string.Empty;
    public string RecipientEmail { get; set; } = string.Empty;
    public int PointsAwarded { get; set; }
}
