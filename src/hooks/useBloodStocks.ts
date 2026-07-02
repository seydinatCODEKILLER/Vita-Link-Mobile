import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bloodStocksApi, BloodStock } from "@/src/api/bloodStocks.api";
import { BloodType } from "@/src/types/shared.types";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { calculateStockLevel } from "../utils/format.utils";

// ─── On importe la même fonction que dans le composant ──────
export const useMyStocks = () => {
  return useQuery({
    queryKey: QUERY_KEYS.bloodStocks,
    queryFn: bloodStocksApi.getMyStocks,
    staleTime: 30_000,
  });
};

export const useUpdateMyStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bloodType,
      quantity,
    }: {
      bloodType: BloodType;
      quantity: number;
    }) => bloodStocksApi.updateMyStock(bloodType, quantity),

    onMutate: async ({ bloodType, quantity }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.bloodStocks });

      const previousStocks = queryClient.getQueryData<BloodStock[]>(
        QUERY_KEYS.bloodStocks,
      );

      const computedLevel = calculateStockLevel(quantity);

      queryClient.setQueryData<BloodStock[]>(QUERY_KEYS.bloodStocks, (old) => {
        if (!old) return old;
        return old.map((s) =>
          s.bloodType === bloodType
            ? { ...s, quantity, level: computedLevel }
            : s,
        );
      });

      return { previousStocks };
    },

    onError: (err, variables, context) => {
      if (context?.previousStocks) {
        queryClient.setQueryData(
          QUERY_KEYS.bloodStocks,
          context.previousStocks,
        );
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboardAll });
    },
  });
};