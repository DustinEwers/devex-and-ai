/**
 * Admin Store Service - Administrative store operations
 * 
 * Handles catalog management (create/update items, manage inventory)
 * and order management (view all orders, update status, fulfill orders).
 * 
 * All endpoints require Admin role authorization.
 */

import { IPublicClientApplication } from '@azure/msal-browser';
import * as msalApiClient from '../utils/msalApiClient';
import {
  CreateStoreItemRequest,
  UpdateStoreItemRequest,
  UpdateInventoryRequest,
  UpdateOrderStatusRequest,
  StoreItemAdmin,
  PaginatedAdminOrders,
  OrderFilters,
  OrderStatusUpdateResponse,
  BulkOrderUpdateRequest,
  BulkOrderUpdateResponse,
  OrderStatusReference,
} from '../types/store';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Create a new store item (Admin only)
 * @param msalInstance - MSAL instance for authentication
 * @param request - Store item creation data
 */
export async function createStoreItem(
  msalInstance: IPublicClientApplication,
  request: CreateStoreItemRequest
): Promise<StoreItemAdmin> {
  return msalApiClient.post<StoreItemAdmin>(
    msalInstance,
    `${API_BASE}/api/admin/store/items`,
    request
  );
}

/**
 * Update an existing store item (Admin only)
 * @param msalInstance - MSAL instance for authentication
 * @param itemId - Store item ID
 * @param request - Updated store item data
 */
export async function updateStoreItem(
  msalInstance: IPublicClientApplication,
  itemId: string,
  request: UpdateStoreItemRequest
): Promise<StoreItemAdmin> {
  return msalApiClient.put<StoreItemAdmin>(
    msalInstance,
    `${API_BASE}/api/admin/store/items/${itemId}`,
    request
  );
}

/**
 * Update inventory quantity for a store item (Admin only)
 * @param msalInstance - MSAL instance for authentication
 * @param itemId - Store item ID
 * @param request - Inventory update data (quantityAvailable)
 */
export async function updateInventory(
  msalInstance: IPublicClientApplication,
  itemId: string,
  request: UpdateInventoryRequest
): Promise<void> {
  return msalApiClient.makeApiRequest(
    msalInstance,
    `${API_BASE}/api/admin/store/items/${itemId}/inventory`,
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    }
  );
}

/**
 * Get all store items including inactive ones (Admin only)
 * @param msalInstance - MSAL instance for authentication
 */
export async function getAllStoreItems(
  msalInstance: IPublicClientApplication
): Promise<StoreItemAdmin[]> {
  return msalApiClient.get<StoreItemAdmin[]>(
    msalInstance,
    `${API_BASE}/api/admin/store/items`
  );
}

/**
 * Get all orders across all users (Admin only) - Enhanced with filtering
 * @param msalInstance - MSAL instance for authentication
 * @param filters - Optional filters (status, userEmail, date range)
 * @param pageNumber - Page number (1-based)
 * @param pageSize - Number of orders per page
 */
export async function getAllOrders(
  msalInstance: IPublicClientApplication,
  filters: OrderFilters = {},
  pageNumber: number = 1,
  pageSize: number = 50
): Promise<PaginatedAdminOrders> {
  const params = new URLSearchParams();
  params.append('pageNumber', pageNumber.toString());
  params.append('pageSize', pageSize.toString());
  
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.userEmail) {
    params.append('userEmail', filters.userEmail);
  }
  if (filters.fromDate) {
    params.append('fromDate', filters.fromDate.toISOString());
  }
  if (filters.toDate) {
    params.append('toDate', filters.toDate.toISOString());
  }
  
  return msalApiClient.get<PaginatedAdminOrders>(
    msalInstance,
    `${API_BASE}/api/admin/store/orders?${params.toString()}`
  );
}

/**
 * Update order status (Admin only) - Enhanced version
 * Automatically sets FulfilledAt timestamp when status changes to "Fulfilled"
 * @param msalInstance - MSAL instance for authentication
 * @param orderId - Order ID
 * @param request - Status update data
 */
export async function updateOrderStatus(
  msalInstance: IPublicClientApplication,
  orderId: string,
  request: UpdateOrderStatusRequest
): Promise<OrderStatusUpdateResponse> {
  return msalApiClient.put<OrderStatusUpdateResponse>(
    msalInstance,
    `${API_BASE}/api/admin/store/orders/${orderId}/status`,
    request
  );
}

/**
 * Bulk update order statuses (Admin only)
 * @param msalInstance - MSAL instance for authentication
 * @param request - Bulk update data
 */
export async function bulkUpdateOrderStatus(
  msalInstance: IPublicClientApplication,
  request: BulkOrderUpdateRequest
): Promise<BulkOrderUpdateResponse> {
  return msalApiClient.makeApiRequest<BulkOrderUpdateResponse>(
    msalInstance,
    `${API_BASE}/api/admin/store/orders/bulk-update`,
    {
      method: 'PATCH',
      body: JSON.stringify(request),
    }
  );
}

/**
 * Get valid order statuses and transitions (Admin only)
 * @param msalInstance - MSAL instance for authentication
 */
export async function getOrderStatuses(
  msalInstance: IPublicClientApplication
): Promise<OrderStatusReference> {
  return msalApiClient.get<OrderStatusReference>(
    msalInstance,
    `${API_BASE}/api/admin/store/orders/statuses`
  );
}
