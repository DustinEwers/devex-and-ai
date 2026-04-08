import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { format } from 'date-fns';
import { useStore } from '../../hooks/useStore';
import OrderStatusBadge from './OrderStatusBadge';
import Pagination from './Pagination';
import OrderHistorySkeleton from './OrderHistorySkeleton';
import { EmptyOrdersState } from './EmptyStates';

interface OrderHistoryProps {
  onBrowseStore: () => void;
}

const OrderHistory = ({ onBrowseStore }: OrderHistoryProps) => {
  const { instance } = useMsal();
  const { orders, loading, error, fetchUserOrders } = useStore(instance);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchUserOrders(currentPage, pageSize);
  }, [currentPage, fetchUserOrders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <OrderHistorySkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-200">
        <p className="font-medium">Failed to load order history</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!orders || orders.orders.length === 0) {
    return <EmptyOrdersState onBrowseStore={onBrowseStore} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Order History</h2>
        <p className="text-slate-400">
          {orders.totalCount} {orders.totalCount === 1 ? 'order' : 'orders'} total
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-slate-800 rounded-lg overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Points
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Ordered
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Fulfilled
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {orders.orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-750 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {order.storeItemImageUrl ? (
                      <img
                        src={order.storeItemImageUrl}
                        alt={order.storeItemName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className="font-medium text-slate-200">{order.storeItemName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-slate-200">{order.pointsSpent}</span>
                </td>
                <td className="px-6 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {format(new Date(order.orderedAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {order.fulfilledAt ? format(new Date(order.fulfilledAt), 'MMM d, yyyy') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {orders.orders.map((order) => (
          <div key={order.id} className="bg-slate-800 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3 mb-3">
              {order.storeItemImageUrl ? (
                <img
                  src={order.storeItemImageUrl}
                  alt={order.storeItemName}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-200 truncate">{order.storeItemName}</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {format(new Date(order.orderedAt), 'MMM d, yyyy')}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <span className="text-sm text-slate-400">Points Spent</span>
              <span className="font-semibold text-slate-200">{order.pointsSpent}</span>
            </div>
            {order.fulfilledAt && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-slate-400">Fulfilled</span>
                <span className="text-sm text-slate-300">
                  {format(new Date(order.fulfilledAt), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {orders.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={orders.totalPages}
          totalCount={orders.totalCount}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default OrderHistory;
