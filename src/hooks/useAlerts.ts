import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertsApi } from "@/src/api/alerts.api";
import { useAuthStore } from "@/src/store/auth.store";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { CreateAlertPayload } from "@/src/types/alert.types";
import { usersApi } from "../api/users.api";
import { useUserRole } from "./useAuthStore";

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

export const useActiveEngagement = () => {
  return useQuery({
    queryKey: QUERY_KEYS.activeEngagement, // Ajoute "activeEngagement" dans tes constants
    queryFn: () => usersApi.getActiveEngagement(),
    refetchInterval: 60_000, // Vérifie toutes les minutes
    staleTime: 30_000,
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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEngagement });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.hasActiveConfirmation });
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

// ── GET Vérification engagement actif ──────────────────────────
export const useHasActiveConfirmation = () => {
  const role = useUserRole();

  return useQuery({
    queryKey: QUERY_KEYS.hasActiveConfirmation,
    queryFn: () => alertsApi.checkActiveConfirmation(),
    select: (data) => data.hasActiveConfirmation,
    enabled: role === "DONOR",
    staleTime: 15_000,
  });
};

export const useCancelConfirmation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => alertsApi.cancel(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEngagement });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hasActiveConfirmation,
      });
    },
  });
};
