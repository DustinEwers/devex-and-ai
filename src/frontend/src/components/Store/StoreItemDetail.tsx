import { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import ReactMarkdown from 'react-markdown';
import { useStore } from '../../hooks/useStore';
import { StoreItemDetail as StoreItemDetailType, RedeemResponse } from '../../types/store';

interface StoreItemDetailProps {
  itemId: string;
  onBack: () => void;
  onRedemptionSuccess: (redemption: RedeemResponse) => void;
}

const StoreItemDetail = ({ itemId, onBack, onRedemptionSuccess }: StoreItemDetailProps) => {
  const { instance } = useMsal();
  const { itemDetail, loading, error, fetchStoreItem, redeemItem } = useStore(instance);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    fetchStoreItem(itemId);
  }, [itemId, fetchStoreItem]);

  const handleRedeem = async () => {
    if (!itemDetail) return;

    setIsRedeeming(true);
    try {
      const response = await redeemItem({ storeItemId: itemId });
      if (response) {
        onRedemptionSuccess(response);
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-slate-700 rounded"></div>
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <div className="h-96 bg-slate-700 rounded"></div>
            <div className="space-y-2">
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !itemDetail) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Store
        </button>
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-red-200">
          <p className="font-medium">Failed to load item details</p>
          <p className="text-sm mt-1">{error || 'Item not found'}</p>
        </div>
      </div>
    );
  }

  const canAfford = itemDetail.userCanAfford;
  const isInStock = itemDetail.isInStock;
  const canRedeem = canAfford && isInStock && !isRedeeming;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Store
      </button>

      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-slate-700">
            {itemDetail.imageUrl ? (
              <img
                src={itemDetail.imageUrl}
                alt={itemDetail.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Category Badge */}
            <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-sm rounded-full">
              {itemDetail.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-100">{itemDetail.name}</h1>

            {/* Price & Stock */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className="text-3xl font-bold text-slate-100">{itemDetail.pointCost}</span>
                <span className="text-slate-400">points</span>
              </div>

              {/* User Balance */}
              <div className="flex items-center justify-between p-4 bg-slate-900 rounded-lg">
                <span className="text-slate-400">Your balance:</span>
                <span className="text-xl font-semibold text-slate-200">{itemDetail.userCurrentPoints} points</span>
              </div>

              {/* Stock Status */}
              {itemDetail.quantityAvailable !== undefined && itemDetail.quantityAvailable !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Available:</span>
                  <span className={`font-medium ${isInStock ? 'text-green-400' : 'text-red-400'}`}>
                    {isInStock ? `${itemDetail.quantityAvailable} in stock` : 'Out of stock'}
                  </span>
                </div>
              )}
            </div>

            {/* Redeem Button */}
            <button
              onClick={handleRedeem}
              disabled={!canRedeem}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                canRedeem
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isRedeeming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : !isInStock ? (
                'Out of Stock'
              ) : !canAfford ? (
                `Need ${itemDetail.pointCost - itemDetail.userCurrentPoints} more points`
              ) : (
                'Redeem Now'
              )}
            </button>

            {/* Warnings */}
            {!canAfford && isInStock && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  You don't have enough points for this item. Keep earning cheers to unlock this reward!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Description</h2>
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown>{itemDetail.description}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreItemDetail;
