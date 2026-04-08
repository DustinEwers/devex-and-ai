using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Cheersly.Api.Data;
using Cheersly.Api.Models;

namespace Cheersly.Api.Services;

/// <summary>
/// Service for managing user data and synchronization with Entra ID.
/// </summary>
public class UserService : IUserService
{
    private readonly CheerslyDbContext _context;
    private readonly ILogger<UserService> _logger;
    private const int DefaultMonthlyPoints = 50;

    public UserService(CheerslyDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User> SyncUserFromClaimsAsync(ClaimsPrincipal principal, CancellationToken cancellationToken = default)
    {
        if (principal?.Identity?.IsAuthenticated != true)
        {
            throw new InvalidOperationException("User is not authenticated");
        }

        // Extract email from claims
    var email = principal.FindFirst("preferred_username")?.Value
            ?? principal.FindFirst("email")?.Value
            ?? principal.FindFirst("unique_name")?.Value
            ?? principal.FindFirst("upn")?.Value
            ?? principal.FindFirst(ClaimTypes.Upn)?.Value
            ?? principal.FindFirst(ClaimTypes.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            _logger.LogError("Unable to extract email from claims for user synchronization");
            throw new InvalidOperationException("Email claim not found in token");
        }

        // Extract name from claims
        var givenName = principal.FindFirst("given_name")?.Value;
        var familyName = principal.FindFirst("family_name")?.Value;
        
        // Fallback: try to parse from "name" claim if given_name/family_name not available
        if (string.IsNullOrEmpty(givenName) || string.IsNullOrEmpty(familyName))
        {
            var fullName = principal.FindFirst("name")?.Value ?? principal.FindFirst(ClaimTypes.Name)?.Value;
            if (!string.IsNullOrEmpty(fullName))
            {
                var nameParts = fullName.Split(' ', 2);
                givenName = nameParts.Length > 0 ? nameParts[0] : fullName;
                familyName = nameParts.Length > 1 ? nameParts[1] : string.Empty;
            }
        }

        // If still no name, use email prefix as fallback
        if (string.IsNullOrEmpty(givenName))
        {
            givenName = email.Split('@')[0];
            familyName = string.Empty;
            _logger.LogWarning("Using email prefix as name fallback for {Email}", email);
        }

        givenName ??= email.Split('@')[0];
        familyName ??= string.Empty;

        // Extract role from claims
        var role = principal.FindFirst(ClaimTypes.Role)?.Value 
                  ?? principal.FindFirst("roles")?.Value
                  ?? "Normal"; // Default role

        // Debug logging for role extraction
        var allClaims = principal.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
        _logger.LogInformation("User {Email} claims: {Claims}", email, string.Join(", ", allClaims));
        _logger.LogInformation("Extracted role for {Email}: {Role}", email, role);

        // Check if user exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (existingUser != null)
        {
            // Update existing user
            var nameChanged = existingUser.FirstName != givenName || existingUser.LastName != familyName;
            var roleChanged = existingUser.Role != role;
            
            existingUser.FirstName = givenName;
            existingUser.LastName = familyName;
            existingUser.Role = role;
            existingUser.LastLoginAt = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            if (nameChanged || roleChanged)
            {
                _logger.LogInformation("Updated user {Email}: name changed to {FirstName} {LastName}, role: {Role}", 
                    email, givenName, familyName, role);
            }
            else
            {
                _logger.LogDebug("User {Email} logged in with role {Role}", email, role);
            }

            return existingUser;
        }
        else
        {
            // Create new user
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                FirstName = givenName,
                LastName = familyName,
                Role = role,
                PointsToGive = DefaultMonthlyPoints,
                PointsReceived = 0,
                CreatedAt = DateTime.UtcNow,
                LastLoginAt = DateTime.UtcNow,
                LastPointsReset = DateTime.UtcNow
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Created new user {Email}: {FirstName} {LastName} with role {Role}", 
                email, givenName, familyName, role);

            return newUser;
        }
    }

    public async Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<List<User>> GetAllUsersAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> DeductPointsAsync(Guid userId, int points, CancellationToken cancellationToken = default)
    {
        if (points < 0)
        {
            throw new ArgumentException("Points to deduct must be non-negative", nameof(points));
        }

        var user = await GetUserByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("Attempted to deduct points from non-existent user {UserId}", userId);
            return false;
        }

        if (user.PointsToGive < points)
        {
            _logger.LogWarning("User {UserId} has insufficient points: has {Available}, needs {Required}", 
                userId, user.PointsToGive, points);
            return false;
        }

        user.PointsToGive -= points;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Deducted {Points} points from user {UserId}, remaining: {Remaining}", 
            points, userId, user.PointsToGive);

        return true;
    }

    public async Task AddReceivedPointsAsync(Guid userId, int points, CancellationToken cancellationToken = default)
    {
        if (points < 0)
        {
            throw new ArgumentException("Points to add must be non-negative", nameof(points));
        }

        var user = await GetUserByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            _logger.LogWarning("Attempted to add points to non-existent user {UserId}", userId);
            throw new InvalidOperationException($"User {userId} not found");
        }

        user.PointsReceived += points;
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Added {Points} received points to user {UserId}, total: {Total}", 
            points, userId, user.PointsReceived);
    }

    public async Task ResetMonthlyPointsAsync(CancellationToken cancellationToken = default)
    {
        var users = await _context.Users.ToListAsync(cancellationToken);
        var resetTime = DateTime.UtcNow;

        foreach (var user in users)
        {
            user.PointsToGive = DefaultMonthlyPoints;
            user.LastPointsReset = resetTime;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Reset monthly points for {UserCount} users to {Points} points", 
            users.Count, DefaultMonthlyPoints);
    }
}
