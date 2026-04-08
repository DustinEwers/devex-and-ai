import React, { useState } from 'react';
import { AdminOrder, OrderStatus } from '../../types/store';
import { Card } from '../ui';
import OrderStatusBadge from './OrderStatusBadge';
import { format } from 'date-fns';

interface OrderUpdateModalProps {
  order: AdminOrder;
  onStatusUpdate: (status: OrderStatus, notes?: string) => Promise<void>;
  onCancel: () => void;
}

const OrderUpdateModal: React.FC<OrderUpdateModalProps> = ({
  order,
  onStatusUpdate,
  onCancel
}) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === order.status && notes === (order.notes || '')) {
      onCancel();
      return;
    }

    setLoading(true);
    try {
      await onStatusUpdate(status, notes || undefined);
    } finally {
      setLoading(false);
    }
  };

  const canUpdate = order.status === 'Pending';
  const hasChanges = status !== order.status || notes !== (order.notes || '');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            Update Order Status
          </h3>
          
          {/* Order Details */}
          <div className="bg-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Order ID:</span>
              <code className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                {order.id}
              </code>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">User:</span>
              <span className="text-slate-200">{order.userEmail}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Item:</span>
              <div className="flex items-center gap-2">
                {order.storeItemImageUrl && (
                  <img
                    src={order.storeItemImageUrl}
                    alt={order.storeItemName}
                    className="w-6 h-6 rounded object-cover"
                  />
                )}
                <span className="text-slate-200">{order.storeItemName}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Points:</span>
              <span className="font-semibold text-slate-200">{order.pointsSpent}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Current Status:</span>
              <OrderStatusBadge status={order.status} />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Ordered:</span>
              <span className="text-slate-200">
                {format(new Date(order.orderedAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            
            {order.fulfilledAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Fulfilled:</span>
                <span className="text-green-400">
                  {format(new Date(order.fulfilledAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              disabled={!canUpdate}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              required
            >
              <option value="Pending">Pending</option>
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            {!canUpdate && (
              <p className="text-xs text-slate-400 mt-1">
                Only pending orders can be updated
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Admin Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this order update..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-slate-300 hover:text-slate-200 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !hasChanges || (!canUpdate && status !== order.status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                status === 'Fulfilled'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : status === 'Cancelled'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {hasChanges ? 'Update Order' : 'No Changes'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default OrderUpdateModal;