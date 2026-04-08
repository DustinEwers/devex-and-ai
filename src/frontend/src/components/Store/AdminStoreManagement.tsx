import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import AdminStoreItemsTab from './AdminStoreItemsTab';
import AdminOrdersTab from './AdminOrdersTab';
import { useAdminStore } from '../../hooks/useAdminStore';

type AdminView = 'items' | 'orders';

const AdminStoreManagement = () => {
  const [activeView, setActiveView] = useState<AdminView>('orders'); // Start with orders tab
  const { instance } = useMsal();
  const { orders: paginatedOrders, fetchAllOrders } = useAdminStore(instance);
  
  // Get pending order count for badge
  const pendingOrdersCount = paginatedOrders?.orders.filter(order => order.status === 'Pending').length || 0;
  
  useEffect(() => {
    // Load orders when component mounts to get the count
    fetchAllOrders({}, 1, 20);
  }, [fetchAllOrders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Store Administration</h1>
        <p className="text-purple-100 mt-1">Manage store items and fulfill orders</p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveView('items')}
          className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${
            activeView === 'items'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Manage Items
        </button>
        <button
          onClick={() => setActiveView('orders')}
          className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 relative ${
            activeView === 'orders'
              ? 'text-blue-400 border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Manage Orders
          {pendingOrdersCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-1 animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div>
        {activeView === 'items' && <AdminStoreItemsTab />}
        {activeView === 'orders' && <AdminOrdersTab />}
      </div>
    </div>
  );
};

export default AdminStoreManagement;
