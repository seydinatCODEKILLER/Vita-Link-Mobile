import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/src/api/dashboard.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

export const useCntsDashboard = (limit = 5) => {
  return useQuery({
    queryKey: QUERY_KEYS.cntsDashboard(limit),
    queryFn: () =>
      dashboardApi.getCntsDashboard({ recentRequestsLimit: limit }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
};

export const useHospitalDashboard = (limit = 5) => {
  return useQuery({
    queryKey: QUERY_KEYS.hospitalDashboard(limit),
    queryFn: () =>
      dashboardApi.getHospitalDashboard({ myRequestsLimit: limit }),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
};
