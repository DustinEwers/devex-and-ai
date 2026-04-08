import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import { useAdminStore } from '../../hooks/useAdminStore';
import { StoreItemAdmin, CreateStoreItemRequest, UpdateStoreItemRequest } from '../../types/store';
import StoreItemForm from './StoreItemForm';

interface AdminStoreItemsTabProps {}

const AdminStoreItemsTab = ({}: AdminStoreItemsTabProps) => {
  const { instance } = useMsal();
  const { items, loading, error, fetchAllStoreItems, createItem, updateItem } = useAdminStore(instance);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<StoreItemAdmin | null>(null);

  useEffect(() => {
    fetchAllStoreItems();
  }, [fetchAllStoreItems]);

  const handleCreate = async (data: CreateStoreItemRequest): Promise<boolean> => {
    const result = await createItem(data);
    if (result) {
      setView('list');
      return true;
    }
    return false;
  };

  const handleUpdate = async (data: UpdateStoreItemRequest): Promise<boolean> => {
    if (!editingItem) return false;
    const success = await updateItem(editingItem.id, data);
    if (success) {
      setView('list');
      setEditingItem(null);
      return true;
    }
    return false;
  };

  const handleEdit = (item: StoreItemAdmin) => {
    setEditingItem(item);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setEditingItem(null);
  };

  if (view === 'create') {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Create Store Item</h2>
        <div className="bg-slate-800 rounded-lg p-6">
          <StoreItemForm onSubmit={handleCreate} onCancel={handleCancel} />
        </div>
      </div>
    );
  }

  if (view === 'edit' && editingItem) {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">Edit Store Item</h2>
        <div className="bg-slate-800 rounded-lg p-6">
          <StoreItemForm item={editingItem} onSubmit={handleUpdate} onCancel={handleCancel} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100">Manage Store Items</h2>
        <button
          onClick={() => setView('create')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-2">Loading items...</p>
        </div>
      )}

      {/* Items Table */}
      {!loading && !error && (
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-900 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-750">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-slate-200">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{item.category}</td>
                  <td className="px-6 py-4 text-slate-200 font-semibold">{item.pointCost}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {item.quantityAvailable === undefined || item.quantityAvailable === null
                      ? 'Unlimited'
                      : item.quantityAvailable}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.isActive
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-400 hover:text-blue-300 font-medium text-sm"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-12 bg-slate-800 rounded-lg">
          <p className="text-slate-400">No store items yet. Create your first item!</p>
        </div>
      )}
    </div>
  );
};

export default AdminStoreItemsTab;
