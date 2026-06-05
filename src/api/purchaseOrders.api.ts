import { api } from "./client";
import { PurchaseOrder } from "../types/blood-request.types";

export const purchaseOrdersApi = {
  // L'agent CNTS scanne le QR Code du bon de commande
  scanPurchaseOrder: async (
    code: string,
  ): Promise<{ message: string; order: PurchaseOrder }> => {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      order: PurchaseOrder;
    }>(`/purchase-orders/${code}/scan`);
    return { message: data.message, order: data.order };
  },

  // Récupérer la liste des bons (pour plus tard si besoin)
  getList: async (
    filters?: any,
  ): Promise<{ orders: PurchaseOrder[]; pagination: any }> => {
    const { data } = await api.get<{
      success: boolean;
      orders: PurchaseOrder[];
      pagination: any;
    }>("/purchase-orders", { params: filters });
    return { orders: data.orders, pagination: data.pagination };
  },

  confirmExpiry: async (
    orderId: string,
    payload: { wasDelivered: boolean; cntsNotes?: string },
  ): Promise<{ message: string; order: PurchaseOrder }> => {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      order: PurchaseOrder;
    }>(`/purchase-orders/${orderId}/expire-confirm`, payload);
    return { message: data.message, order: data.order };
  },
};
