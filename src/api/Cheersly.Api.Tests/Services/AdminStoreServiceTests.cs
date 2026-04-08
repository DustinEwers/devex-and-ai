using Cheersly.Api.Models;

namespace Cheersly.Api.Tests.Services;

[TestClass]
public class AdminStoreServiceTests
{
    [TestMethod]
    public void OrderStatusValidation_ShouldWork()
    {
        // Test basic order status functionality
        var pending = OrderStatusExtensions.FromString("Pending");
        Assert.AreEqual(OrderStatus.Pending, pending);
        
        var canTransition = pending.CanTransitionTo(OrderStatus.Fulfilled);
        Assert.IsTrue(canTransition);
        
        var cannotTransition = OrderStatus.Fulfilled.CanTransitionTo(OrderStatus.Pending);
        Assert.IsFalse(cannotTransition);
    }
}