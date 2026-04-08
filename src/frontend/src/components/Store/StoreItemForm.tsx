import { useState, useEffect } from 'react';
import { StoreCategory, CreateStoreItemRequest, UpdateStoreItemRequest, StoreItemAdmin } from '../../types/store';

interface StoreItemFormProps {
  item?: StoreItemAdmin;
  onSubmit: (data: CreateStoreItemRequest | UpdateStoreItemRequest) => Promise<boolean>;
  onCancel: () => void;
}

const CATEGORIES: StoreCategory[] = [
  'Gift Cards',
  'Swag',
  'Experiences',
  'Time Off',
  'Charitable Donations',
  'Other',
];

const StoreItemForm = ({ item, onSubmit, onCancel }: StoreItemFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointCost: 0,
    imageUrl: '',
    category: 'Gift Cards' as StoreCategory,
    quantityAvailable: undefined as number | undefined,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlimitedStock, setUnlimitedStock] = useState(true);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        pointCost: item.pointCost,
        imageUrl: item.imageUrl || '',
        category: item.category as StoreCategory,
        quantityAvailable: item.quantityAvailable,
        isActive: item.isActive,
      });
      setUnlimitedStock(item.quantityAvailable === undefined || item.quantityAvailable === null);
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        quantityAvailable: unlimitedStock ? undefined : formData.quantityAvailable,
      };

      const success = await onSubmit(submitData);
      if (!success) {
        setError('Failed to save item. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
          Item Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., $50 Amazon Gift Card"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-200 mb-2">
          Description <span className="text-red-400">*</span>
          <span className="text-slate-400 text-xs ml-2">(Markdown supported)</span>
        </label>
        <textarea
          id="description"
          required
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the item (you can use **markdown** for formatting)"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Point Cost */}
        <div>
          <label htmlFor="pointCost" className="block text-sm font-medium text-slate-200 mb-2">
            Point Cost <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            id="pointCost"
            required
            min="1"
            value={formData.pointCost}
            onChange={(e) => setFormData({ ...formData, pointCost: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-200 mb-2">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            id="category"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as StoreCategory })}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-slate-200 mb-2">
          Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {/* Stock Management */}
      <div>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={unlimitedStock}
            onChange={(e) => setUnlimitedStock(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-200">Unlimited Stock</span>
        </label>

        {!unlimitedStock && (
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-200 mb-2">
              Quantity Available
            </label>
            <input
              type="number"
              id="quantity"
              min="0"
              value={formData.quantityAvailable ?? 0}
              onChange={(e) =>
                setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Active Status */}
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-slate-200">
            Active (visible in store)
          </span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-slate-700">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors"
        >
          {isSubmitting ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 font-semibold rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default StoreItemForm;
