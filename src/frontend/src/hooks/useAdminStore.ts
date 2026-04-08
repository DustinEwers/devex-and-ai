import { useState, useCallback } from 'react';
import { IPublicClientApplication } from '@azure/msal-browser';
import * as adminStoreService from '../services/adminStoreService';
import {
  StoreItemAdmin,
  PaginatedAdminOrders,
  CreateStoreItemRequest,
  UpdateStoreItemRequest,
  UpdateInventoryRequest,
  UpdateOrderStatusRequest,
  OrderStatus,
  OrderFilters,
  BulkOrderUpdateRequest,
  BulkOrderUpdateResponse,
  OrderStatusReference
} from '../types/store';

export const useAdminStore = (msalInstance: IPublicClientApplication) => {
  const [items, setItems] = useState<StoreItemAdmin[]>([]);
  const [orders, setOrders] = useState<PaginatedAdminOrders | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStoreItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminStoreService.getAllStoreItems(msalInstance);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load store items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const createItem = useCallback(async (request: CreateStoreItemRequest): Promise<StoreItemAdmin | null> => {
    setLoading(true);
    setError(null);
    try {
      const item = await adminStoreService.createStoreItem(msalInstance, request);
      setItems(prev => [...prev, item]);
      return item;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
      return null;
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const updateItem = useCallback(async (id: string, request: UpdateStoreItemRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await adminStoreService.updateStoreItem(msalInstance, id, request);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...request } : item
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      return false;
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const updateInventory = useCallback(async (id: string, request: UpdateInventoryRequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await adminStoreService.updateInventory(msalInstance, id, request);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, quantityAvailable: request.quantityAvailable } : item
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
      return false;
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const fetchAllOrders = useCallback(async (
    filters: OrderFilters = {},
    pageNumber: number = 1,
    pageSize: number = 10
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminStoreService.getAllOrders(msalInstance, filters, pageNumber, pageSize);
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      setOrders(null);
    } finally {
      setLoading(false);
    }
  }, [msalInstance]);

  const updateOrderStatus = useCallback(async (
    orderId: string,
    request: UpdateOrderStatusRequest
  ): Promise<boolean> => {
    setError(null);
    try {
      const response = await adminStoreService.updateOrderStatus(msalInstance, orderId, request);
      // Optimistically update the orders list
      if (orders) {
        setOrders({
          ...orders,
          orders: orders.orders.map(order =>
            order.id === orderId
              ? { ...order, status: response.newStatus, notes: request.notes || order.notes }
              : order
          ),
        });
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      return false;
    }
  }, [msalInstance, orders]);

  const bulkUpdateOrderStatus = useCallback(async (
    request: BulkOrderUpdateRequest
  ): Promise<BulkOrderUpdateResponse | null> => {
    setError(null);
    try {
      const response = await adminStoreService.bulkUpdateOrderStatus(msalInstance, request);
      
      // Optimistically update the orders list
      if (orders) {
        const updatedOrderIds = new Set(response.successfulOrders.map(o => o.orderId));
        setOrders({
          ...orders,
          orders: orders.orders.map(order =>
            updatedOrderIds.has(order.id)
              ? { ...order, status: request.status, notes: request.notes || order.notes }
              : order
          ),
        });
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update orders');
      return null;
    }
  }, [msalInstance, orders]);

  const getOrderStatuses = useCallback(async (): Promise<OrderStatusReference | null> => {
    try {
      return await adminStoreService.getOrderStatuses(msalInstance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order statuses');
      return null;
    }
  }, [msalInstance]);

  return {
    items,
    orders,
    loading,
    error,
    fetchAllStoreItems,
    createItem,
    updateItem,
    updateInventory,
    fetchAllOrders,
    updateOrderStatus,
    bulkUpdateOrderStatus,
    getOrderStatuses,
  };
};
