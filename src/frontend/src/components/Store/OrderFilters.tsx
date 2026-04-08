import React, { useState } from 'react';
import { OrderFilters as OrderFiltersType, OrderStatus } from '../../types/store';

interface OrderFiltersProps {
  filters: OrderFiltersType;
  onFiltersChange: (filters: OrderFiltersType) => void;
  onReset: () => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ filters, onFiltersChange, onReset }) => {
  const [localFilters, setLocalFilters] = useState<OrderFiltersType>(filters);

  const handleFilterChange = (key: keyof OrderFiltersType, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateChange = (key: 'fromDate' | 'toDate', value: string) => {
    const date = value ? new Date(value) : undefined;
    handleFilterChange(key, date);
  };

  const formatDateForInput = (date?: Date) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-100">Filter Orders</h3>
        {hasActiveFilters && (
          <button
            onClick={() => {
              setLocalFilters({});
              onReset();
            }}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Status
          </label>
          <select
            value={localFilters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value as OrderStatus || undefined)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* User Email Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            User Email
          </label>
          <input
            type="text"
            value={localFilters.userEmail || ''}
            onChange={(e) => handleFilterChange('userEmail', e.target.value || undefined)}
            placeholder="Search by email..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* From Date Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            From Date
          </label>
          <input
            type="date"
            value={formatDateForInput(localFilters.fromDate)}
            onChange={(e) => handleDateChange('fromDate', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* To Date Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            To Date
          </label>
          <input
            type="date"
            value={formatDateForInput(localFilters.toDate)}
            onChange={(e) => handleDateChange('toDate', e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="text-sm text-slate-400">
          Active filters: {Object.entries(filters).filter(([_, value]) => 
            value !== undefined && value !== null && value !== ''
          ).length}
        </div>
      )}
    </div>
  );
};

export default OrderFilters;