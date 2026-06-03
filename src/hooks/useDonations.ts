import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { donationsApi } from "@/src/api/donations.api";
import { QUERY_KEYS } from "@/src/constants/query_key";


export const useScanDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (qrCode: string) => donationsApi.scanAndValidate(qrCode),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.structureDonations,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodStocks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
    },
  });
};
