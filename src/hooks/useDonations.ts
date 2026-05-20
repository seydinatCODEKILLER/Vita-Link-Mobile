import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { donationsApi } from "@/src/api/donations.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useMyDonations = () => {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.myDonations,
    queryFn: ({ pageParam = 1 }) =>
      donationsApi.getMyDonations({ page: pageParam, limit: 15 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30_000,
  });
};

export const useScanDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qrCode: string) => donationsApi.scanAndValidate(qrCode),
    onSuccess: (data) => {
      // Invalider les caches pertinents après un scan réussi
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
      queryClient.invalidateQueries({ queryKey: ["structureDonations"] });
      queryClient.invalidateQueries({ queryKey: ["bloodStocks"] });
    },
  });
};
