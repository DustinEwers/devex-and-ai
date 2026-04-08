using Cheersly.Api.Models;

namespace Cheersly.Api.Tests.Models;

[TestClass]
public class OrderStatusTestsSimple
{
    [TestMethod]
    public void OrderStatus_BasicTest_ShouldWork()
    {
        var pending = OrderStatusExtensions.FromString("Pending");
        Assert.AreEqual(OrderStatus.Pending, pending);
        
        var canTransition = pending.CanTransitionTo(OrderStatus.Fulfilled);
        Assert.IsTrue(canTransition);
    }
}