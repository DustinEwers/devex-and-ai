namespace Cheersly.Api.Models;

public enum OrderStatus
{
    Pending,
    Fulfilled,
    Cancelled
}

public static class OrderStatusExtensions
{
    public static string ToStringValue(this OrderStatus status)
    {
        return status.ToString();
    }

    public static OrderStatus FromString(string status)
    {
        return status switch
        {
            "Pending" => OrderStatus.Pending,
            "Fulfilled" => OrderStatus.Fulfilled,
            "Cancelled" => OrderStatus.Cancelled,
            _ => throw new ArgumentException($"Invalid order status: {status}")
        };
    }

    public static bool CanTransitionTo(this OrderStatus currentStatus, OrderStatus newStatus)
    {
        return currentStatus switch
        {
            OrderStatus.Pending => newStatus == OrderStatus.Fulfilled || newStatus == OrderStatus.Cancelled,
            OrderStatus.Fulfilled => false,
            OrderStatus.Cancelled => false,
            _ => false
        };
    }

    public static IEnumerable<OrderStatus> GetValidNextStates(this OrderStatus currentStatus)
    {
        return currentStatus switch
        {
            OrderStatus.Pending => new[] { OrderStatus.Fulfilled, OrderStatus.Cancelled },
            OrderStatus.Fulfilled => Array.Empty<OrderStatus>(),
            OrderStatus.Cancelled => Array.Empty<OrderStatus>(),
            _ => Array.Empty<OrderStatus>()
        };
    }
}