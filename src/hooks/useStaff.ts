import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { healthStructuresApi } from "@/src/api/healthStructures.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useMyStaff = () => {
  return useQuery({
    queryKey: QUERY_KEYS.myStructureStaff,
    queryFn: healthStructuresApi.getMyStaff,
    staleTime: 30_000,
  });
};

export const useRemoveStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => healthStructuresApi.removeStaff(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStaff });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStats });
    },
  });
};