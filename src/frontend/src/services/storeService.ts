/**
 * Store Service - User-facing store operations
 * 
 * Handles browsing the store catalog, viewing item details,
 * redeeming items for points, and viewing order history.
 */

import { IPublicClientApplication } from '@azure/msal-browser';
import * as msalApiClient from '../utils/msalApiClient';
import {
  StoreItem,
  StoreItemDetail,
  RedeemRequest,
  RedeemResponse,
  PaginatedOrders,
} from '../types/store';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Get all active store items
 * @param msalInstance - MSAL instance for authentication
 * @param category - Optional category filter
 */
export async function getStoreItems(
  msalInstance: IPublicClientApplication,
  category?: string
): Promise<StoreItem[]> {
  const url = category
    ? `${API_BASE}/api/store/items?category=${encodeURIComponent(category)}`
    : `${API_BASE}/api/store/items`;

  return msalApiClient.get<StoreItem[]>(msalInstance, url);
}

/**
 * Get detailed information about a specific store item
 * Includes user's current point balance and affordability check
 * @param msalInstance - MSAL instance for authentication
 * @param itemId - Store item ID
 */
export async function getStoreItem(
  msalInstance: IPublicClientApplication,
  itemId: string
): Promise<StoreItemDetail> {
  return msalApiClient.get<StoreItemDetail>(
    msalInstance,
    `${API_BASE}/api/store/items/${itemId}`
  );
}

/**
 * Redeem a store item for points
 * @param msalInstance - MSAL instance for authentication
 * @param request - Redemption request containing store item ID
 */
export async function redeemItem(
  msalInstance: IPublicClientApplication,
  request: RedeemRequest
): Promise<RedeemResponse> {
  return msalApiClient.post<RedeemResponse>(
    msalInstance,
    `${API_BASE}/api/store/redeem`,
    request
  );
}

/**
 * Get the authenticated user's order history
 * @param msalInstance - MSAL instance for authentication
 * @param pageNumber - Page number (1-based)
 * @param pageSize - Number of orders per page
 */
export async function getUserOrders(
  msalInstance: IPublicClientApplication,
  pageNumber: number = 1,
  pageSize: number = 20
): Promise<PaginatedOrders> {
  return msalApiClient.get<PaginatedOrders>(
    msalInstance,
    `${API_BASE}/api/store/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`
  );
}
