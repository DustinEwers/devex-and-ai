import { RedeemResponse } from '../../types/store';

interface RedeemConfirmationModalProps {
  redemption: RedeemResponse;
  onClose: () => void;
}

const RedeemConfirmationModal = ({ redemption, onClose }: RedeemConfirmationModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-slate-100 mb-2">
          Order Placed Successfully!
        </h2>

        {/* Message */}
        <p className="text-slate-300 text-center mb-6">
          Your order for <strong>{redemption.storeItemName}</strong> has been placed.
        </p>

        {/* Details */}
        <div className="bg-slate-900 rounded-lg p-4 space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Order ID:</span>
            <span className="text-slate-200 font-mono text-sm">{redemption.orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Points Spent:</span>
            <span className="text-slate-200 font-semibold">{redemption.pointsSpent}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Remaining Balance:</span>
            <span className="text-green-400 font-semibold">{redemption.remainingPoints}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Status:</span>
            <span className="text-yellow-400 font-medium">{redemption.status}</span>
          </div>
        </div>

        {/* Information */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-200">
            <strong>What's next?</strong> Your order is being processed. You'll be notified when it's ready for fulfillment.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default RedeemConfirmationModal;
