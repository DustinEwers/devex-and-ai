import React, { useState } from 'react';
import { OrderStatus } from '../../types/store';
import { Card } from '../ui';

interface BulkUpdateModalProps {
  orderIds: string[];
  orderCount: number;
  onSubmit: (status: OrderStatus, notes?: string) => Promise<void>;
  onCancel: () => void;
}

const BulkUpdateModal: React.FC<BulkUpdateModalProps> = ({
  orderIds,
  orderCount,
  onSubmit,
  onCancel
}) => {
  const [status, setStatus] = useState<OrderStatus>('Fulfilled');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(status, notes || undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-md w-full">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-100 mb-2">
            Bulk Update Orders
          </h3>
          <p className="text-slate-400">
            You are about to update {orderCount} order{orderCount !== 1 ? 's' : ''}. This action cannot be undone.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Fulfilled">Fulfilled</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes for this bulk update..."
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
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                status === 'Fulfilled'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Update {orderCount} Order{orderCount !== 1 ? 's' : ''}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BulkUpdateModal;