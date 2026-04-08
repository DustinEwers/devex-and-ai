import React, { useState } from 'react';
import { AdminOrder, OrderStatus } from '../../types/store';
import { Card } from '../ui';

interface BulkOrderActionsProps {
  selectedOrders: AdminOrder[];
  onBulkUpdate: (status: OrderStatus, notes?: string) => Promise<void>;
  onClearSelection: () => void;
  loading?: boolean;
}

const BulkOrderActions: React.FC<BulkOrderActionsProps> = ({
  selectedOrders,
  onBulkUpdate,
  onClearSelection,
  loading = false
}) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [pendingAction, setPendingAction] = useState<OrderStatus | null>(null);

  const handleBulkAction = async (status: OrderStatus) => {
    if (selectedOrders.length === 0) return;
    
    setPendingAction(status);
    try {
      await onBulkUpdate(status, notes || undefined);
      setNotes('');
      setShowNotes(false);
      onClearSelection();
    } finally {
      setPendingAction(null);
    }
  };

  const canFulfill = selectedOrders.some(order => order.status === 'Pending');
  const canCancel = selectedOrders.some(order => order.status === 'Pending');

  if (selectedOrders.length === 0) {
    return null;
  }

  return (
    <Card className="!bg-blue-900/20 border-blue-500/30">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-slate-200 font-medium">
              {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <button
            onClick={onClearSelection}
            className="text-sm text-slate-400 hover:text-slate-300"
            disabled={loading}
          >
            Clear Selection
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="px-3 py-2 text-sm text-slate-300 hover:text-slate-200 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors"
            disabled={loading}
          >
            {showNotes ? 'Hide Notes' : 'Add Notes'}
          </button>
          
          {canFulfill && (
            <button
              onClick={() => handleBulkAction('Fulfilled')}
              disabled={loading || pendingAction !== null}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {pendingAction === 'Fulfilled' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Fulfill Selected
            </button>
          )}
          
          {canCancel && (
            <button
              onClick={() => handleBulkAction('Cancelled')}
              disabled={loading || pendingAction !== null}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {pendingAction === 'Cancelled' && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              Cancel Selected
            </button>
          )}
        </div>
      </div>

      {showNotes && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes for this bulk action..."
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </Card>
  );
};

export default BulkOrderActions;