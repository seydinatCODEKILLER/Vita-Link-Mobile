import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bloodRequestsApi } from "@/src/api/blood-requests.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import {
  ListBloodRequestsFilters,
  HandleRequestPayload,
} from "@/src/types/blood-request.types";

export const useBloodRequests = (filters?: ListBloodRequestsFilters) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.bloodRequests(), filters],
    queryFn: () => bloodRequestsApi.getRequests(filters),
    staleTime: 15_000,
  });
};

export const useBloodRequestDetail = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.bloodRequest(id),
    queryFn: () => bloodRequestsApi.getById(id),
    enabled: !!id,
  });
};

export const useHandleBloodRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: HandleRequestPayload;
    }) => bloodRequestsApi.handleRequest(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.bloodRequest(variables.id),
      });
      // On invalide aussi le stock car FULFILL/PARTIAL décrémente le stock
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodStocks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      // Si escalation, la liste des alertes va changer
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
    },
  });
};

export const useCancelBloodRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bloodRequestsApi.cancelRequest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequest(id) });
    },
  });
};
