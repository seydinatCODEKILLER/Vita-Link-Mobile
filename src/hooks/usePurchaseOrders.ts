import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseOrdersApi } from "@/src/api/purchaseOrders.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useScanPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => purchaseOrdersApi.scanPurchaseOrder(code),
    onSuccess: () => {
      // On utilise les clés "All" pour tout invalider, peu importe les filtres
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrdersAll });
      // ✅ FIX : bloodRequests() sans argument -> ["blood-requests", undefined]
      // ne matchait pas les entrées en cache avec des filtres définis.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequestsAll });
      // ✅ FIX : cntsDashboard() sans argument -> ["dashboard","cnts",undefined]
      // ne matchait pas les entrées en cache avec un limit défini.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboardAll });
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

    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.purchaseOrdersAll,
      });
      const previousOrders = queryClient.getQueriesData({
        queryKey: QUERY_KEYS.purchaseOrdersAll,
      });

      queryClient.setQueriesData<{ orders?: any[] }>(
        { queryKey: QUERY_KEYS.purchaseOrdersAll },
        (oldData) => {
          if (!oldData?.orders) return oldData;

          return {
            ...oldData,
            orders: oldData.orders.map((order) =>
              order.id === id
                ? {
                    ...order,
                    status: payload.wasDelivered ? "USED" : "CANCELLED",
                    scannedAt: payload.wasDelivered
                      ? new Date().toISOString()
                      : null,
                  }
                : order,
            ),
          };
        },
      );
      return { previousOrders };
    },

    onError: (err, variables, context) => {
      if (context?.previousOrders) {
        context.previousOrders.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrdersAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequestsAll });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboardAll });
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