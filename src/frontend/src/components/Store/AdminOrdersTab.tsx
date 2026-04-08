import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { Card, Spinner } from '../ui';
import OrderFilters from './OrderFilters';
import BulkOrderActions from './BulkOrderActions';
import BulkUpdateModal from './BulkUpdateModal';
import OrderTableRow from './OrderTableRow';
import OrderUpdateModal from './OrderUpdateModal';
import Pagination from './Pagination';
import { useAdminStore } from '../../hooks/useAdminStore';
import { AdminOrder, OrderFilters as OrderFiltersType, OrderStatus, UpdateOrderStatusRequest, BulkOrderUpdateRequest } from '../../types/store';

interface AdminOrdersTabProps {}

const AdminOrdersTab: React.FC<AdminOrdersTabProps> = () => {
  const { instance } = useMsal();
  const { 
    orders: paginatedOrders, 
    loading, 
    error,
    fetchAllOrders, 
    updateOrderStatus,
    bulkUpdateOrderStatus
  } = useAdminStore(instance);
  
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<OrderFiltersType>({});
  const [filteredOrders, setFilteredOrders] = useState<AdminOrder[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Get orders array from paginated response
  const orders = paginatedOrders?.orders || [];

  useEffect(() => {
    fetchAllOrders(filters, currentPage, pageSize);
  }, [fetchAllOrders, currentPage]);

  // Apply client-side filters to orders (in addition to server-side filtering)
  useEffect(() => {
    let filtered = [...orders];

    if (filters.userEmail) {
      filtered = filtered.filter(order => 
        order.userEmail.toLowerCase().includes(filters.userEmail!.toLowerCase())
      );
    }

    if (filters.fromDate) {
      filtered = filtered.filter(order => 
        new Date(order.orderedAt) >= filters.fromDate!
      );
    }

    if (filters.toDate) {
      filtered = filtered.filter(order => 
        new Date(order.orderedAt) <= filters.toDate!
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filters]);

  const handleUpdateOrder = (order: AdminOrder) => {
    setSelectedOrder(order);
    setShowUpdateModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowUpdateModal(false);
  };

  const handleStatusUpdate = async (status: OrderStatus, notes?: string) => {
    if (!selectedOrder) return;
    
    const request: UpdateOrderStatusRequest = { status, notes };
    await updateOrderStatus(selectedOrder.id, request);
    handleCloseModal();
  };

  const handleOrderSelection = (orderId: string, selected: boolean) => {
    const newSelection = new Set(selectedOrderIds);
    if (selected) {
      newSelection.add(orderId);
    } else {
      newSelection.delete(orderId);
    }
    setSelectedOrderIds(newSelection);
  };

  const handleSelectAll = () => {
    const allIds = filteredOrders.map(order => order.id);
    setSelectedOrderIds(new Set(allIds));
  };

  const handleClearSelection = () => {
    setSelectedOrderIds(new Set());
  };

  const handleBulkUpdate = async (status: OrderStatus, notes?: string) => {
    const orderIds = Array.from(selectedOrderIds);
    if (orderIds.length === 0) return;

    try {
      const request: BulkOrderUpdateRequest = { orderIds, status, notes };
      await bulkUpdateOrderStatus(request);
      setSelectedOrderIds(new Set());
      setShowBulkModal(false);
    } catch (error) {
      console.error('Bulk update failed:', error);
    }
  };

  const handleFiltersChange = (newFilters: OrderFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    setSelectedOrderIds(new Set());
    // Re-fetch with new filters
    fetchAllOrders(newFilters, 1, pageSize);
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
    setSelectedOrderIds(new Set());
    fetchAllOrders({}, 1, pageSize);
  };

  const selectedOrders = filteredOrders.filter(order => 
    selectedOrderIds.has(order.id)
  );

  const allSelected = filteredOrders.length > 0 && 
    filteredOrders.every(order => selectedOrderIds.has(order.id));
  const someSelected = selectedOrderIds.size > 0 && !allSelected;

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="md" color="blue" />
        <span className="ml-3 text-slate-300">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Order Management</h2>
          <p className="text-slate-400 mt-1">
            Manage and fulfill store item orders ({filteredOrders.length} of {paginatedOrders?.totalCount || 0} orders)
          </p>
        </div>
        
        <button
          onClick={() => fetchAllOrders(filters, currentPage, pageSize)}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Filters */}
      <OrderFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Bulk Actions */}
      <BulkOrderActions
        selectedOrders={selectedOrders}
        onBulkUpdate={handleBulkUpdate}
        onClearSelection={handleClearSelection}
        loading={loading}
      />

      {/* Orders Table */}
      <Card>
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">
              {orders.length === 0 ? 'No orders found' : 'No orders match current filters'}
            </div>
            <p className="text-slate-500">
              {orders.length === 0 
                ? 'Orders will appear here when users make purchases.'
                : 'Try adjusting your filters or clearing them to see more orders.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead>
                <tr className="bg-slate-800">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={input => {
                        if (input) input.indeterminate = someSelected;
                      }}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleSelectAll();
                        } else {
                          handleClearSelection();
                        }
                      }}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredOrders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    isSelected={selectedOrderIds.has(order.id)}
                    onSelectionChange={handleOrderSelection}
                    onUpdateClick={() => handleUpdateOrder(order)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {paginatedOrders && paginatedOrders.totalPages > 1 && (
        <div className="flex items-center justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={paginatedOrders.totalPages}
            totalCount={paginatedOrders.totalCount}
            pageSize={pageSize}
            onPageChange={(page) => {
              setCurrentPage(page);
              fetchAllOrders(filters, page, pageSize);
              setSelectedOrderIds(new Set()); // Clear selection on page change
            }}
          />
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedOrder && (
        <OrderUpdateModal
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
          onCancel={handleCloseModal}
        />
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && selectedOrderIds.size > 0 && (
        <BulkUpdateModal
          orderIds={Array.from(selectedOrderIds)}
          orderCount={selectedOrderIds.size}
          onSubmit={handleBulkUpdate}
          onCancel={() => setShowBulkModal(false)}
        />
      )}
    </div>
  );
};

export default AdminOrdersTab;
