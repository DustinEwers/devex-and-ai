/**
 * OrderHistorySkeleton Component
 * 
 * Loading placeholder for order history list.
 */

export default function OrderHistorySkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
        >
          {/* Thumbnail skeleton */}
          <div className="w-16 h-16 bg-gray-300 rounded flex-shrink-0"></div>

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-300 rounded w-2/3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>

          {/* Status badge skeleton */}
          <div className="h-6 w-24 bg-gray-300 rounded-full flex-shrink-0"></div>
        </div>
      ))}
    </div>
  );
}
