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

    // ✅ Mise à jour optimiste : on applique le changement AVANT même la réponse API
    onMutate: async ({ bloodType, quantity }) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.bloodStocks });

      // Sauvegarder l'état actuel (rollback en cas d'erreur)
      const previousStocks = queryClient.getQueryData<BloodStock[]>(
        QUERY_KEYS.bloodStocks,
      );

      // Calculer le niveau localement avec les seuils du FRONTEND
      const computedLevel = calculateStockLevel(quantity);

      // Mettre à jour le cache instantanément
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
      // ❌ En cas d'erreur, on revient à l'état précédent
      if (context?.previousStocks) {
        queryClient.setQueryData(
          QUERY_KEYS.bloodStocks,
          context.previousStocks,
        );
      }
    },

    onSuccess: () => {
      // Invalider les autres écrans (Dashboard, Stats)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
    },
  });
};
