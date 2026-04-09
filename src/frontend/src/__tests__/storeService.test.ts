import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as msalApiClient from '../utils/msalApiClient';
import { createMockMsalInstance } from '../test/msalMocks';
import {
  getStoreItem,
  getStoreItems,
  getUserOrders,
  redeemItem,
} from '../services/storeService';

vi.mock('../utils/msalApiClient', () => ({
  get: vi.fn(),
  post: vi.fn(),
}));

describe('storeService', () => {
  const msalInstance = createMockMsalInstance() as never;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(msalApiClient.get).mockResolvedValue({} as never);
    vi.mocked(msalApiClient.post).mockResolvedValue({} as never);
  });

  it('getStoreItems uses the base catalog endpoint when no category is provided', async () => {
    await getStoreItems(msalInstance);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/store/items'
    );
  });

  it('getStoreItems encodes the category when filtering the catalog', async () => {
    await getStoreItems(msalInstance, 'Gift Cards & More');

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/store/items?category=Gift%20Cards%20%26%20More'
    );
  });

  it('getStoreItem fetches a single item by id', async () => {
    await getStoreItem(msalInstance, 'item-123');

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/store/items/item-123'
    );
  });

  it('redeemItem posts the request body to the redeem endpoint', async () => {
    const request = { storeItemId: 'item-123' };

    await redeemItem(msalInstance, request);

    expect(msalApiClient.post).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/store/redeem',
      request
    );
  });

  it('getUserOrders uses default paging values', async () => {
    await getUserOrders(msalInstance);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/store/orders?pageNumber=1&pageSize=20'
    );
  });

  it('getUserOrders passes custom paging values', async () => {
    await getUserOrders(msalInstance, 3, 10);

    expect(msalApiClient.get).toHaveBeenCalledWith(
      msalInstance,
      'http://localhost:5000/api/store/orders?pageNumber=3&pageSize=10'
    );
  });
});