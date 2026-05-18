import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponsApi } from "@/src/api/coupon.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useMyCoupons = (params?: { status?: string }) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myCoupons, params],
    queryFn: () => couponsApi.getMyCoupons({ ...params, limit: 50 }),
    staleTime: 30_000,
  });
};

export const useRedeemReward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardId: string) => couponsApi.redeemReward(rewardId),
    onSuccess: () => {
      // Invalider le solde de points et la liste des coupons
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarsProfile });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myCoupons });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rewards }); // Rafraîchir le stock
    },
  });
};
