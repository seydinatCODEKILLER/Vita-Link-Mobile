import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bloodStocksApi, BloodStock } from "@/src/api/bloodStocks.api";
import { BloodType } from "@/src/types/shared.types";
import { QUERY_KEYS } from "@/src/constants/query_key";

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
    onSuccess: (updatedStock) => {
      // ✅ Mise à jour optimiste du cache avec la BONNE clé
      queryClient.setQueryData<BloodStock[]>(
        QUERY_KEYS.bloodStocks,
        (oldStocks) => {
          if (!oldStocks) return [updatedStock];
          return oldStocks.map((s) =>
            s.bloodType === updatedStock.bloodType ? updatedStock : s,
          );
        },
      );
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
    },
  });
};
