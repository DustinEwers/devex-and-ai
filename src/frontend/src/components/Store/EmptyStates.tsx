/**
 * Empty State Components for Store
 * 
 * Display friendly messages when there's no data to show.
 */

export function EmptyStoreState() {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-24 w-24 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No items available</h3>
      <p className="mt-2 text-sm text-gray-500">
        There are no store items available at this time.
      </p>
    </div>
  );
}

export function EmptyOrdersState({ onBrowseStore }: { onBrowseStore?: () => void }) {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-24 w-24 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">No orders yet</h3>
      <p className="mt-2 text-sm text-gray-500">
        You haven't redeemed any items yet. Browse the store to get started!
      </p>
      {onBrowseStore && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onBrowseStore}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Store
          </button>
        </div>
      )}
    </div>
  );
}

export function EmptySearchState({ category }: { category?: string }) {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-24 w-24 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        No items in this category
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {category
          ? `There are no items available in the "${category}" category.`
          : 'Try adjusting your filters to see more results.'}
      </p>
    </div>
  );
}
