using Cheersly.Api.Data;
using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace Cheersly.Api.Services;

public class CheerService : ICheerService
{
    private readonly CheerslyDbContext _context;
    private readonly ILogger<CheerService> _logger;

    public CheerService(CheerslyDbContext context, ILogger<CheerService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<CheerDTO> CreateCheerAsync(Guid senderId, CreateCheerRequest request)
    {
        // Validation: Message length
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            _logger.LogWarning("Cheer creation failed: Message is empty for sender {SenderId}", senderId);
            throw new ArgumentException("Message cannot be empty");
        }

        if (request.Message.Length > 2000)
        {
            _logger.LogWarning("Cheer creation failed: Message exceeds 2000 characters for sender {SenderId}", senderId);
            throw new ArgumentException("Message cannot exceed 2000 characters");
        }

        // Validation: At least one recipient, max 100
        if (request.RecipientIds == null || !request.RecipientIds.Any())
        {
            _logger.LogWarning("Cheer creation failed: No recipients specified for sender {SenderId}", senderId);
            throw new ArgumentException("At least one recipient is required");
        }

        if (request.RecipientIds.Count > 100)
        {
            _logger.LogWarning("Cheer creation failed: Too many recipients ({Count}) for sender {SenderId}", 
                request.RecipientIds.Count, senderId);
            throw new ArgumentException("Cannot send to more than 100 recipients");
        }

        // Validation: No self-send
        if (request.RecipientIds.Contains(senderId))
        {
            _logger.LogWarning("Cheer creation failed: Sender {SenderId} attempted to send to themselves", senderId);
            throw new ArgumentException("Cannot send a cheer to yourself");
        }

        // Validation: No duplicate recipients
        var distinctRecipients = request.RecipientIds.Distinct().ToList();
        if (distinctRecipients.Count != request.RecipientIds.Count)
        {
            _logger.LogWarning("Cheer creation failed: Duplicate recipients detected for sender {SenderId}", senderId);
            throw new ArgumentException("Cannot send to duplicate recipients");
        }

        // Validation: Points per recipient must be positive
        if (request.PointsPerRecipient <= 0)
        {
            _logger.LogWarning("Cheer creation failed: Invalid points per recipient ({Points}) for sender {SenderId}", 
                request.PointsPerRecipient, senderId);
            throw new ArgumentException("Points per recipient must be at least 1");
        }

        // Use a transaction for atomic point transfers
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // Get sender
            var sender = await _context.Users.FindAsync(senderId);
            if (sender == null)
            {
                _logger.LogWarning("Cheer creation failed: Sender {SenderId} not found", senderId);
                throw new ArgumentException("Sender not found");
            }

            // Calculate total points needed
            var totalPointsNeeded = request.PointsPerRecipient * distinctRecipients.Count;

            // Validation: Sender has sufficient points
            if (sender.PointsToGive < totalPointsNeeded)
            {
                _logger.LogWarning("Cheer creation failed: Insufficient points for sender {SenderId}. Has {Available}, needs {Needed}", 
                    senderId, sender.PointsToGive, totalPointsNeeded);
                throw new InvalidOperationException($"Insufficient points. You have {sender.PointsToGive} points but need {totalPointsNeeded}");
            }

            // Get all recipients
            var recipients = await _context.Users
                .Where(u => distinctRecipients.Contains(u.Id))
                .ToListAsync();

            // Validation: All recipients exist
            if (recipients.Count != distinctRecipients.Count)
            {
                var foundIds = recipients.Select(r => r.Id).ToHashSet();
                var missingIds = distinctRecipients.Where(id => !foundIds.Contains(id)).ToList();
                _logger.LogWarning("Cheer creation failed: Recipients not found for sender {SenderId}: {MissingIds}", 
                    senderId, string.Join(", ", missingIds));
                throw new ArgumentException("One or more recipients not found");
            }

            // Deduct points from sender
            sender.PointsToGive -= totalPointsNeeded;

            // Add points to all recipients
            foreach (var recipient in recipients)
            {
                recipient.PointsReceived += request.PointsPerRecipient;
            }

            // Create the Cheer entity
            var cheer = new Cheer
            {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                Message = request.Message,
                PointsPerRecipient = request.PointsPerRecipient,
                CreatedAt = DateTime.UtcNow
            };

            _context.Cheers.Add(cheer);

            // Create CheerRecipient records
            foreach (var recipient in recipients)
            {
                var cheerRecipient = new CheerRecipient
                {
                    Id = Guid.NewGuid(),
                    CheerId = cheer.Id,
                    RecipientId = recipient.Id,
                    PointsAwarded = request.PointsPerRecipient
                };

                _context.CheerRecipients.Add(cheerRecipient);
            }

            // Save all changes
            await _context.SaveChangesAsync();

            // Commit transaction
            await transaction.CommitAsync();

            _logger.LogInformation("Cheer created successfully: {CheerId} from {SenderId} to {RecipientCount} recipients, {Points} points each", 
                cheer.Id, senderId, recipients.Count, request.PointsPerRecipient);

            // Return DTO
            return await GetCheerByIdAsync(cheer.Id) 
                ?? throw new InvalidOperationException("Failed to retrieve created cheer");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<CheerDTO>> GetFeedAsync(
        int skip = 0,
        int take = 20,
        FeedSortBy sortBy = FeedSortBy.CreatedAt,
        FeedSortDirection sortDirection = FeedSortDirection.Desc,
        FeedFilterMode filterMode = FeedFilterMode.All,
        Guid? currentUserId = null)
    {
        var query = _context.Cheers
            .Include(c => c.Sender)
            .Include(c => c.Recipients)
                .ThenInclude(r => r.Recipient)
            .AsQueryable();

        if (filterMode == FeedFilterMode.DirectedAtMe)
        {
            if (!currentUserId.HasValue)
            {
                throw new ArgumentException("Current user ID is required for directedAtMe filter");
            }

            query = query.Where(c => c.Recipients.Any(r => r.RecipientId == currentUserId.Value));
        }

        query = (sortBy, sortDirection) switch
        {
            (FeedSortBy.CreatedAt, FeedSortDirection.Asc) => query.OrderBy(c => c.CreatedAt),
            (FeedSortBy.CreatedAt, FeedSortDirection.Desc) => query.OrderByDescending(c => c.CreatedAt),
            (FeedSortBy.Points, FeedSortDirection.Asc) => query.OrderBy(c => c.PointsPerRecipient * c.Recipients.Count),
            (FeedSortBy.Points, FeedSortDirection.Desc) => query.OrderByDescending(c => c.PointsPerRecipient * c.Recipients.Count),
            _ => query.OrderByDescending(c => c.CreatedAt)
        };

        var cheers = await query
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return cheers.Select(MapToDTO).ToList();
    }

    public async Task<List<CheerDTO>> GetCheersSentAsync(Guid userId, int skip = 0, int take = 20)
    {
        var cheers = await _context.Cheers
            .Include(c => c.Sender)
            .Include(c => c.Recipients)
                .ThenInclude(r => r.Recipient)
            .Where(c => c.SenderId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return cheers.Select(MapToDTO).ToList();
    }

    public async Task<List<CheerDTO>> GetCheersReceivedAsync(Guid userId, int skip = 0, int take = 20)
    {
        var cheers = await _context.Cheers
            .Include(c => c.Sender)
            .Include(c => c.Recipients)
                .ThenInclude(r => r.Recipient)
            .Where(c => c.Recipients.Any(r => r.RecipientId == userId))
            .OrderByDescending(c => c.CreatedAt)
            .Skip(skip)
            .Take(take)
            .ToListAsync();

        return cheers.Select(MapToDTO).ToList();
    }

    public async Task<CheerDTO?> GetCheerByIdAsync(Guid cheerId)
    {
        var cheer = await _context.Cheers
            .Include(c => c.Sender)
            .Include(c => c.Recipients)
                .ThenInclude(r => r.Recipient)
            .FirstOrDefaultAsync(c => c.Id == cheerId);

        return cheer == null ? null : MapToDTO(cheer);
    }

    private static CheerDTO MapToDTO(Cheer cheer)
    {
        return new CheerDTO
        {
            Id = cheer.Id,
            SenderId = cheer.SenderId,
            SenderFirstName = cheer.Sender.FirstName,
            SenderLastName = cheer.Sender.LastName,
            SenderEmail = cheer.Sender.Email,
            Message = cheer.Message,
            PointsPerRecipient = cheer.PointsPerRecipient,
            CreatedAt = cheer.CreatedAt,
            Recipients = cheer.Recipients.Select(r => new CheerRecipientDTO
            {
                Id = r.Id,
                RecipientId = r.RecipientId,
                RecipientFirstName = r.Recipient.FirstName,
                RecipientLastName = r.Recipient.LastName,
                RecipientEmail = r.Recipient.Email,
                PointsAwarded = r.PointsAwarded
            }).ToList()
        };
    }
}
