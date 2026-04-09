import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as msalApiClient from '../utils/msalApiClient';
import { createMockMsalInstance } from '../test/msalMocks';
import {
  bulkUpdateOrderStatus,
  getAllOrders,
  getAllStoreItems,
  getOrderStatuses,
  updateInventory,
  updateOrderStatus,
  updateStoreItem,
} from '../services/adminStoreService';

vi.mock('../utils/msalApiClient', () => ({
  get: vi.fn(),
  put: vi.fn(),
  makeApiRequest: vi.fn(),
}));

describe('adminStoreService', () => {
  const msalInstance = createMockMsalInstance() as never;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(msalApiClient.get).mockResolvedValue({} as never);
    vi.mocked(msalApiClient.put).mockResolvedValue({} as never);
    vi.mocked(msalApiClient.makeApiRequest).mockResolvedValue({} as never);
  });

  it('getAllStoreItems fetches the admin catalog endpoint', async () => {
    await getAllStoreItems(msalInstance);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/items'
    );
  });

  it('getAllOrders includes paging defaults when no filters are supplied', async () => {
    await getAllOrders(msalInstance);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/orders?pageNumber=1&pageSize=50'
    );
  });

  it('getAllOrders serializes all supported filters into the query string', async () => {
    const fromDate = new Date('2026-01-01T12:00:00.000Z');
    const toDate = new Date('2026-01-31T18:30:00.000Z');

    await getAllOrders(
      msalInstance,
      {
        status: 'Pending',
        userEmail: 'admin@example.com',
        fromDate,
        toDate,
      },
      2,
      25
    );

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      `http://localhost:5000/api/admin/store/orders?pageNumber=2&pageSize=25&status=Pending&userEmail=admin%40example.com&fromDate=${encodeURIComponent(fromDate.toISOString())}&toDate=${encodeURIComponent(toDate.toISOString())}`
    );
  });

  it('updateStoreItem sends a PUT request to the item endpoint', async () => {
    const request = {
      name: 'Coffee Mug',
      description: 'Nice mug',
      pointCost: 25,
      category: 'Swag',
      isActive: true,
    };

    await updateStoreItem(msalInstance, 'item-123', request);

    expect(msalApiClient.put).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/items/item-123',
      request
    );
  });

  it('updateInventory uses a PATCH request with a serialized body', async () => {
    const request = { quantityAvailable: 7 };

    await updateInventory(msalInstance, 'item-123', request);

    expect(msalApiClient.makeApiRequest).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/items/item-123/inventory',
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      }
    );
  });

  it('updateOrderStatus sends a PUT request to the status endpoint', async () => {
    const request = { status: 'Fulfilled', notes: 'completed' };

    await updateOrderStatus(msalInstance, 'order-123', request);

    expect(msalApiClient.put).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/orders/order-123/status',
      request
    );
  });

  it('bulkUpdateOrderStatus uses PATCH for the bulk update endpoint', async () => {
    const request = {
      orderIds: ['order-1', 'order-2'],
      status: 'Fulfilled' as const,
      notes: 'done',
    };

    await bulkUpdateOrderStatus(msalInstance, request);

    expect(msalApiClient.makeApiRequest).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/orders/bulk-update',
      {
        method: 'PATCH',
        body: JSON.stringify(request),
      }
    );
  });

  it('getOrderStatuses fetches the order status reference endpoint', async () => {
    await getOrderStatuses(msalInstance);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/admin/store/orders/statuses'
    );
  });
});