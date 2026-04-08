/**
 * OrderStatusBadge Component
 * 
 * Displays a color-coded badge for order status.
 */

import { OrderStatus } from '../../types/store';

interface OrderStatusBadgeProps {
  status: string;
}

const statusStyles: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Processing: 'bg-blue-100 text-blue-800',
  Fulfilled: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-100 text-gray-800',
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const styles = statusStyles[status as OrderStatus] || statusStyles.Pending;

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${styles}`}
    >
      {status}
    </span>
  );
}
