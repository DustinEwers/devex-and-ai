namespace Cheersly.Api.Models.DTOs;

public class ErrorResponse
{
    public string Error { get; set; } = string.Empty;
    public List<string> Details { get; set; } = new();
}
