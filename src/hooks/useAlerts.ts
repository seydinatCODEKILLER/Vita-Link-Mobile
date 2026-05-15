import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/src/api/alerts.api";
import { useAuthStore } from "@/src/store/auth.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { CreateAlertPayload } from "@/src/types/alert.types";

// ── GET alertes autour du donneur ─────────────────────────────
export const useNearbyAlerts = () => {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: QUERY_KEYS.nearbyAlerts,
    queryFn: () =>
      alertsApi.getNearby({
        lat: user?.latitude ?? undefined,
        lng: user?.longitude ?? undefined,
      }),
    // Rafraîchir toutes les 30 secondes — les alertes sont temps-réel
    // Socket.io s'occupe des nouvelles alertes, React Query gère le fallback
    refetchInterval: 30_000,
    staleTime: 15_000,
    enabled: !!user,
  });
};

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
    refetchInterval: 10_000, // Polling léger en plus du socket
    staleTime: 5_000,
  });
};

// ── Confirmer venue (Donneur) ─────────────────────────────────
export const useConfirmAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      alertId,
      etaMinutes,
    }: {
      alertId: string;
      etaMinutes?: number;
    }) => alertsApi.confirm(alertId, { etaMinutes }),
    onSuccess: () => {
      // Invalider la liste des alertes proches
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    },
  });
};

// ── Décliner (Donneur) ────────────────────────────────────────
export const useDeclineAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertsApi.decline(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    },
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
