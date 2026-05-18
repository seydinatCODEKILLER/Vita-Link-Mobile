import { useQuery } from "@tanstack/react-query";
import { rewardsApi } from "@/src/api/rewards.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useRewards = () => {
  return useQuery({
    queryKey: QUERY_KEYS.rewards,
    queryFn: () => rewardsApi.getRewards(),
    staleTime: 60_000,
  });
};
