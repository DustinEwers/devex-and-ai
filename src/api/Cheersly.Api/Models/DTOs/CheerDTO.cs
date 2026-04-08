namespace Cheersly.Api.Models.DTOs;

public class CheerDTO
{
    public Guid Id { get; set; }
    public Guid SenderId { get; set; }
    public string SenderFirstName { get; set; } = string.Empty;
    public string SenderLastName { get; set; } = string.Empty;
    public string SenderEmail { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int PointsPerRecipient { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<CheerRecipientDTO> Recipients { get; set; } = new();
}
