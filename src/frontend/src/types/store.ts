/**
 * Store domain types matching backend API contracts
 */

export type OrderStatus = 'Pending' | 'Fulfilled' | 'Cancelled';

export type StoreCategory = 
  | 'Gift Cards' 
  | 'Swag' 
  | 'Experiences' 
  | 'Time Off' 
  | 'Charitable Donations' 
  | 'Other';

/**
 * Order filters for enhanced queries
 */
export interface OrderFilters {
  status?: OrderStatus;
  userEmail?: string;
  fromDate?: Date;
  toDate?: Date;
}

/**
 * Order status update response
 */
export interface OrderStatusUpdateResponse {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  updatedAt: string;
  updatedBy: string;
}

/**
 * Bulk order update request
 */
export interface BulkOrderUpdateRequest {
  orderIds: string[];
  status: OrderStatus;
  notes?: string;
}

/**
 * Bulk order update response
 */
export interface BulkOrderUpdateResponse {
  totalRequested: number;
  successfulUpdates: number;
  failedUpdates: number;
  successfulOrders: OrderStatusUpdateResponse[];
  errors: BulkUpdateError[];
}

/**
 * Individual error in bulk update
 */
export interface BulkUpdateError {
  orderId: string;
  errorMessage: string;
  errorCode: string;
}

/**
 * Order status reference
 */
export interface OrderStatusReference {
  statuses: OrderStatus[];
  transitions: Record<OrderStatus, OrderStatus[]>;
}

/**
 * Store item as returned in catalog listings
 */
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  category: string;
  quantityAvailable?: number;
  isInStock: boolean;
}

/**
 * Detailed store item view with user context
 */
export interface StoreItemDetail extends StoreItem {
  userCurrentPoints: number;
  userCanAfford: boolean;
}

/**
 * User's order record
 */
export interface Order {
  id: string;
  storeItemName: string;
  storeItemImageUrl?: string;
  pointsSpent: number;
  status: string;
  orderedAt: string;
  fulfilledAt?: string;
}

/**
 * Admin view of orders with user details
 */
export interface AdminOrder extends Order {
  userId: string;
  userEmail: string;
  storeItemId: string;
  notes?: string;
}

/**
 * Request to redeem a store item
 */
export interface RedeemRequest {
  storeItemId: string;
}

/**
 * Response after successful redemption
 */
export interface RedeemResponse {
  orderId: string;
  storeItemName: string;
  pointsSpent: number;
  remainingPoints: number;
  orderedAt: string;
  status: string;
}

/**
 * Paginated orders response
 */
export interface PaginatedOrders {
  orders: Order[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated admin orders response
 */
export interface PaginatedAdminOrders {
  orders: AdminOrder[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Request to create a new store item (admin)
 */
export interface CreateStoreItemRequest {
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  category: string;
  quantityAvailable?: number;
  isActive: boolean;
}

/**
 * Request to update an existing store item (admin)
 */
export interface UpdateStoreItemRequest {
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  category: string;
  quantityAvailable?: number;
  isActive: boolean;
}

/**
 * Request to update item inventory (admin)
 */
export interface UpdateInventoryRequest {
  quantityAvailable?: number;
}

/**
 * Request to update order status (admin)
 */
export interface UpdateOrderStatusRequest {
  status: string;
  notes?: string;
}

/**
 * Full store item response (admin view)
 */
export interface StoreItemAdmin {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  imageUrl?: string;
  category: string;
  quantityAvailable?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
