/**
 * StoreItemSkeleton Component
 * 
 * Loading placeholder for store item cards.
 */

export default function StoreItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-300"></div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Category badge skeleton */}
        <div className="mb-2">
          <div className="h-5 w-20 bg-gray-300 rounded-full"></div>
        </div>

        {/* Title skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-5 bg-gray-300 rounded w-1/2"></div>
        </div>

        {/* Price skeleton */}
        <div className="h-6 bg-gray-300 rounded w-1/3"></div>
      </div>
    </div>
  );
}
