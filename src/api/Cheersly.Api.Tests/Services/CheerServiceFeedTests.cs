using Cheersly.Api.Data;
using Cheersly.Api.Models;
using Cheersly.Api.Models.DTOs;
using Cheersly.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace Cheersly.Api.Tests.Services;

[TestClass]
public class CheerServiceFeedTests
{
    private static CheerslyDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<CheerslyDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new CheerslyDbContext(options);
    }

    [TestMethod]
    public async Task GetFeedAsync_ShouldSortByPointsDescending()
    {
        using var context = CreateContext();
        var service = new CheerService(context, new Mock<ILogger<CheerService>>().Object);

        var sender = new User
        {
            Id = Guid.NewGuid(),
            Email = "sender@test.local",
            FirstName = "Sender",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var recipientOne = new User
        {
            Id = Guid.NewGuid(),
            Email = "r1@test.local",
            FirstName = "R1",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var recipientTwo = new User
        {
            Id = Guid.NewGuid(),
            Email = "r2@test.local",
            FirstName = "R2",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var lowPointsCheer = new Cheer
        {
            Id = Guid.NewGuid(),
            SenderId = sender.Id,
            Sender = sender,
            Message = "Low points",
            PointsPerRecipient = 2,
            CreatedAt = DateTime.UtcNow.AddMinutes(-10),
            Recipients = new List<CheerRecipient>()
        };
        lowPointsCheer.Recipients.Add(new CheerRecipient
        {
            Id = Guid.NewGuid(),
            CheerId = lowPointsCheer.Id,
            Cheer = lowPointsCheer,
            RecipientId = recipientOne.Id,
            Recipient = recipientOne,
            PointsAwarded = 2
        });

        var highPointsCheer = new Cheer
        {
            Id = Guid.NewGuid(),
            SenderId = sender.Id,
            Sender = sender,
            Message = "High points",
            PointsPerRecipient = 5,
            CreatedAt = DateTime.UtcNow.AddMinutes(-20),
            Recipients = new List<CheerRecipient>()
        };
        highPointsCheer.Recipients.Add(new CheerRecipient
        {
            Id = Guid.NewGuid(),
            CheerId = highPointsCheer.Id,
            Cheer = highPointsCheer,
            RecipientId = recipientOne.Id,
            Recipient = recipientOne,
            PointsAwarded = 5
        });
        highPointsCheer.Recipients.Add(new CheerRecipient
        {
            Id = Guid.NewGuid(),
            CheerId = highPointsCheer.Id,
            Cheer = highPointsCheer,
            RecipientId = recipientTwo.Id,
            Recipient = recipientTwo,
            PointsAwarded = 5
        });

        context.Users.AddRange(sender, recipientOne, recipientTwo);
        context.Cheers.AddRange(lowPointsCheer, highPointsCheer);
        context.CheerRecipients.AddRange(lowPointsCheer.Recipients);
        context.CheerRecipients.AddRange(highPointsCheer.Recipients);
        await context.SaveChangesAsync();

        var result = await service.GetFeedAsync(
            sortBy: FeedSortBy.Points,
            sortDirection: FeedSortDirection.Desc);

        Assert.AreEqual(2, result.Count);
        Assert.AreEqual(highPointsCheer.Id, result[0].Id);
        Assert.AreEqual(lowPointsCheer.Id, result[1].Id);
    }

    [TestMethod]
    public async Task GetFeedAsync_WithDirectedAtMeFilter_ShouldOnlyReturnMatchingCheers()
    {
        using var context = CreateContext();
        var service = new CheerService(context, new Mock<ILogger<CheerService>>().Object);

        var sender = new User
        {
            Id = Guid.NewGuid(),
            Email = "sender@test.local",
            FirstName = "Sender",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var me = new User
        {
            Id = Guid.NewGuid(),
            Email = "me@test.local",
            FirstName = "Me",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var someoneElse = new User
        {
            Id = Guid.NewGuid(),
            Email = "else@test.local",
            FirstName = "Else",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };

        var directedAtMe = new Cheer
        {
            Id = Guid.NewGuid(),
            SenderId = sender.Id,
            Sender = sender,
            Message = "For me",
            PointsPerRecipient = 2,
            CreatedAt = DateTime.UtcNow,
            Recipients = new List<CheerRecipient>()
        };
        directedAtMe.Recipients.Add(new CheerRecipient
        {
            Id = Guid.NewGuid(),
            CheerId = directedAtMe.Id,
            Cheer = directedAtMe,
            RecipientId = me.Id,
            Recipient = me,
            PointsAwarded = 2
        });

        var notDirectedAtMe = new Cheer
        {
            Id = Guid.NewGuid(),
            SenderId = sender.Id,
            Sender = sender,
            Message = "Not for me",
            PointsPerRecipient = 2,
            CreatedAt = DateTime.UtcNow.AddMinutes(-1),
            Recipients = new List<CheerRecipient>()
        };
        notDirectedAtMe.Recipients.Add(new CheerRecipient
        {
            Id = Guid.NewGuid(),
            CheerId = notDirectedAtMe.Id,
            Cheer = notDirectedAtMe,
            RecipientId = someoneElse.Id,
            Recipient = someoneElse,
            PointsAwarded = 2
        });

        context.Users.AddRange(sender, me, someoneElse);
        context.Cheers.AddRange(directedAtMe, notDirectedAtMe);
        context.CheerRecipients.AddRange(directedAtMe.Recipients);
        context.CheerRecipients.AddRange(notDirectedAtMe.Recipients);
        await context.SaveChangesAsync();

        var result = await service.GetFeedAsync(
            filterMode: FeedFilterMode.DirectedAtMe,
            currentUserId: me.Id);

        Assert.AreEqual(1, result.Count);
        Assert.AreEqual(directedAtMe.Id, result[0].Id);
    }

    [TestMethod]
    public async Task GetFeedAsync_WithDirectedAtMeFilterWithoutUserId_ShouldThrow()
    {
        using var context = CreateContext();
        var service = new CheerService(context, new Mock<ILogger<CheerService>>().Object);

        try
        {
            await service.GetFeedAsync(filterMode: FeedFilterMode.DirectedAtMe);
            Assert.Fail("Expected ArgumentException was not thrown.");
        }
        catch (ArgumentException ex)
        {
            StringAssert.Contains(ex.Message, "Current user ID is required");
        }
    }
}
