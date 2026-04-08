using System.ComponentModel.DataAnnotations;

namespace Cheersly.Api.Models;

/// <summary>
/// Represents a user in the Cheersly system.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user.
    /// </summary>
    public Guid Id { get; set; }
    
    /// <summary>
    /// User's email address (from Entra ID). Used as unique business identifier.
    /// </summary>
    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public required string Email { get; set; }
    
    /// <summary>
    /// User's first name (from Entra ID).
    /// </summary>
    [Required]
    [MaxLength(100)]
    public required string FirstName { get; set; }
    
    /// <summary>
    /// User's last name (from Entra ID).
    /// </summary>
    [Required]
    [MaxLength(100)]
    public required string LastName { get; set; }
    
    /// <summary>
    /// Current monthly allocation of points available to give to others.
    /// Resets to 50 at the beginning of each month.
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Points to give cannot be negative")]
    public int PointsToGive { get; set; } = 50;
    
    /// <summary>
    /// Cumulative points received from others. Persists across monthly resets.
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Points received cannot be negative")]
    public int PointsReceived { get; set; } = 0;
    
    /// <summary>
    /// Timestamp when the user record was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// Timestamp of the user's most recent authentication.
    /// </summary>
    public DateTime LastLoginAt { get; set; }
    
    /// <summary>
    /// Timestamp of the last monthly points reset for this user.
    /// </summary>
    public DateTime LastPointsReset { get; set; }
    
    /// <summary>
    /// User's role in the system. Determines access to admin features.
    /// </summary>
    [MaxLength(50)]
    public string Role { get; set; } = "Normal";
    
    // Navigation properties for future Cheers relationships
    // public ICollection<Cheer> CheersGiven { get; set; } = new List<Cheer>();
    // public ICollection<CheerRecipient> CheersReceived { get; set; } = new List<CheerRecipient>();
}
