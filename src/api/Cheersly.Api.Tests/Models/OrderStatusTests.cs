using Cheersly.Api.Models;

namespace Cheersly.Api.Tests.Models;

[TestClass]
public class OrderStatusTests
{
    [TestMethod]
    [DataRow("Pending", OrderStatus.Pending)]
    [DataRow("Fulfilled", OrderStatus.Fulfilled)]
    [DataRow("Cancelled", OrderStatus.Cancelled)]
    public void FromString_ValidStatus_ShouldReturnCorrectEnum(string statusString, OrderStatus expectedStatus)
    {
        // Act
        var result = OrderStatus.FromString(statusString);

        // Assert
        Assert.AreEqual(expectedStatus, result);
    }

    [TestMethod]
    public void FromString_InvalidStatus_ShouldThrowArgumentException()
    {
        // Act & Assert
        var exception = Assert.ThrowsException<ArgumentException>(() => OrderStatus.FromString("InvalidStatus"));
        Assert.IsTrue(exception.Message.Contains("Invalid order status: InvalidStatus"));
    }

    [TestMethod]
    [DataRow(OrderStatus.Pending, OrderStatus.Fulfilled, true)]
    [DataRow(OrderStatus.Pending, OrderStatus.Cancelled, true)]
    [DataRow(OrderStatus.Fulfilled, OrderStatus.Pending, false)]
    [DataRow(OrderStatus.Fulfilled, OrderStatus.Cancelled, false)]
    [DataRow(OrderStatus.Cancelled, OrderStatus.Pending, false)]
    [DataRow(OrderStatus.Cancelled, OrderStatus.Fulfilled, false)]
    public void CanTransitionTo_VariousTransitions_ShouldReturnCorrectResult(OrderStatus currentStatus, OrderStatus newStatus, bool expectedResult)
    {
        // Act
        var result = currentStatus.CanTransitionTo(newStatus);

        // Assert
        Assert.AreEqual(expectedResult, result);
    }

    [TestMethod]
    public void GetValidNextStates_PendingStatus_ShouldReturnFulfilledAndCancelled()
    {
        // Act
        var validStates = OrderStatus.Pending.GetValidNextStates().ToArray();

        // Assert
        Assert.AreEqual(2, validStates.Length);
        Assert.IsTrue(validStates.Contains(OrderStatus.Fulfilled));
        Assert.IsTrue(validStates.Contains(OrderStatus.Cancelled));
    }

    [TestMethod]
    public void GetValidNextStates_FulfilledStatus_ShouldReturnEmpty()
    {
        // Act
        var validStates = OrderStatus.Fulfilled.GetValidNextStates().ToArray();

        // Assert
        Assert.AreEqual(0, validStates.Length);
    }

    [TestMethod]
    public void GetValidNextStates_CancelledStatus_ShouldReturnEmpty()
    {
        // Act
        var validStates = OrderStatus.Cancelled.GetValidNextStates().ToArray();

        // Assert
        Assert.AreEqual(0, validStates.Length);
    }

    [TestMethod]
    [DataRow(OrderStatus.Pending, "Pending")]
    [DataRow(OrderStatus.Fulfilled, "Fulfilled")]
    [DataRow(OrderStatus.Cancelled, "Cancelled")]
    public void ToStringValue_ValidStatus_ShouldReturnCorrectString(OrderStatus status, string expectedString)
    {
        // Act
        var result = status.ToStringValue();

        // Assert
        Assert.AreEqual(expectedString, result);
    }
}