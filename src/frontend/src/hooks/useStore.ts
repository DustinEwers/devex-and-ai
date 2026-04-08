import { useState, useCallback } from 'react';
import { IPublicClientApplication } from '@azure/msal-browser';
import * as storeService from '../services/storeService';
import { 
  StoreItem, 
  StoreItemDetail, 
  Order, 
  RedeemRequest, 
  RedeemResponse,
  PaginatedOrders,
  StoreCategory 
} from '../types/store';

export const useStore = (msalInstance: IPublicClientApplication) => {
  const [items, setItems] = useState<StoreItem[]>([]);
  const [itemDetail, setItemDetail] = useState<StoreItemDetail | null>(null);
  const [orders, setOrders] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStoreItems = useCallback(async (category?: StoreCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeService.getStoreItems(msalInstance, category);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const fetchStoreItem = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeService.getStoreItem(msalInstance, id);
      setItemDetail(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item details');
      setItemDetail(null);
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const redeemItem = useCallback(async (request: RedeemRequest): Promise<RedeemResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await storeService.redeemItem(msalInstance, request);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to redeem item');
      return null;
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const fetchUserOrders = useCallback(async (pageNumber: number = 1, pageSize: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeService.getUserOrders(msalInstance, pageNumber, pageSize);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order history');
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  return {
    items,
    itemDetail,
    orders,
    loading,
    error,
    fetchStoreItems,
    fetchStoreItem,
    redeemItem,
    fetchUserOrders,
  };
};
