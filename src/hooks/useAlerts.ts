import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/src/api/alerts.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { CreateAlertPayload } from "@/src/types/alert.types";

// ── GET détail d'une alerte ───────────────────────────────────
export const useAlert = (alertId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.alert(alertId),
    queryFn: () => alertsApi.getById(alertId),
    enabled: !!alertId,
    staleTime: 10_000,
  });
};

// ── GET alertes de ma structure (Agent) ──────────────────────
export const useMyStructureAlerts = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.myAlerts, params],
    queryFn: () => alertsApi.getMyStructure(params),
    staleTime: 15_000,
  });
};

// ── GET réponses d'une alerte (Dashboard médecin) ────────────
export const useAlertResponses = (alertId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.alertResponses(alertId),
    queryFn: () => alertsApi.getResponses(alertId),
    enabled: !!alertId,
    refetchInterval: (query) => {
      const isActive = query.state.data?.alert?.status === "ACTIVE";
      return isActive ? 10_000 : false;
    },
    staleTime: 5_000,
  });
};

// ── Créer une alerte (Agent) ──────────────────────────────────
export const useCreateAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAlertPayload) => alertsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
    },
  });
};

// ── Fermer une alerte (Agent) ─────────────────────────────────
export const useCloseAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertsApi.close(alertId),
    onSuccess: (_, alertId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alert(alertId) });
    },
  });
};
