import React, { useState } from 'react';
import { format } from 'date-fns';
import { AdminOrder } from '../../types/store';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderTableRowProps {
  order: AdminOrder;
  isSelected: boolean;
  onSelectionChange: (orderId: string, selected: boolean) => void;
  onUpdateClick: () => void;
}

const OrderTableRow: React.FC<OrderTableRowProps> = ({
  order,
  isSelected,
  onSelectionChange,
  onUpdateClick
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const canUpdate = order.status === 'Pending';

  return (
    <>
      <tr className={`hover:bg-slate-750 transition-colors ${
        isSelected ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
      }`}>
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelectionChange(order.id, e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
          />
        </td>
        
        <td className="px-6 py-4">
          <div>
            <div className="font-medium text-slate-200">{order.userEmail}</div>
            <div className="text-xs text-slate-400 font-mono truncate max-w-32">
              {order.userId}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            {order.storeItemImageUrl ? (
              <img
                src={order.storeItemImageUrl}
                alt={order.storeItemName}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium text-slate-200 truncate">
                {order.storeItemName}
              </div>
              {order.notes && (
                <div className="text-xs text-slate-400 mt-1 truncate">
                  Note: {order.notes}
                </div>
              )}
            </div>
          </div>
        </td>
        
        <td className="px-6 py-4 font-semibold text-slate-200">
          {order.pointsSpent}
        </td>
        
        <td className="px-6 py-4">
          <OrderStatusBadge status={order.status} />
        </td>
        
        <td className="px-6 py-4 text-slate-300">
          <div>{format(new Date(order.orderedAt), 'MMM d, yyyy')}</div>
          <div className="text-xs text-slate-400">
            {format(new Date(order.orderedAt), 'h:mm a')}
          </div>
          {order.fulfilledAt && (
            <div className="text-xs text-green-400 mt-1">
              Fulfilled: {format(new Date(order.fulfilledAt), 'MMM d')}
            </div>
          )}
        </td>
        
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-slate-400 hover:text-slate-300 text-sm"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
            {canUpdate && (
              <button
                onClick={onUpdateClick}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm"
              >
                Update
              </button>
            )}
          </div>
        </td>
      </tr>
      
      {showDetails && (
        <tr className="bg-slate-800">
          <td colSpan={7} className="px-6 py-4">
            <div className="text-sm text-slate-300 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Order ID:</span>
                  <code className="ml-2 text-xs bg-slate-700 px-2 py-1 rounded">
                    {order.id}
                  </code>
                </div>
                <div>
                  <span className="font-medium">Store Item ID:</span>
                  <code className="ml-2 text-xs bg-slate-700 px-2 py-1 rounded">
                    {order.storeItemId}
                  </code>
                </div>
              </div>
              
              {order.notes && (
                <div>
                  <span className="font-medium">Admin Notes:</span>
                  <p className="mt-1 text-slate-400">{order.notes}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default OrderTableRow;