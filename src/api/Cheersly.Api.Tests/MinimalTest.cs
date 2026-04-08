using Cheersly.Api.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace Cheersly.Api.Tests;

[TestClass]
public class MinimalTest
{
    [TestMethod]
    public void CanCreateUser()
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@example.com",
            FirstName = "Test",
            LastName = "User",
            Role = "Normal",
            PointsToGive = 50,
            PointsReceived = 0,
            CreatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            LastPointsReset = DateTime.UtcNow
        };
        
        Assert.IsNotNull(user);
        Assert.AreEqual("Normal", user.Role);
    }
}
