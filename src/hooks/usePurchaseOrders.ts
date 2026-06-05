import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseOrdersApi } from "@/src/api/purchaseOrders.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useScanPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => purchaseOrdersApi.scanPurchaseOrder(code),
    onSuccess: () => {
      // Invalider les queries liées aux bons de commande et aux demandes
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodStocks });
    },
  });
};

export const useConfirmExpiredOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { wasDelivered: boolean; cntsNotes?: string };
    }) => purchaseOrdersApi.confirmExpiry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodStocks });
    },
  });
};

export const usePurchaseOrders = (filters?: any) => {
  return useQuery({
    queryKey: QUERY_KEYS.purchaseOrders(filters),
    queryFn: () => purchaseOrdersApi.getList(filters),
  });
};
