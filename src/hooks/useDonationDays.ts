import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { donationDaysApi } from "@/src/api/donationDays.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import {
  ListDaysFilters,
  CreateDayPayload,
  UpdateDayPayload,
} from "@/src/types/donation-day.types";

// ─── Queries (Lecture) ──────────────────────────────────────────

export function useMyStructureDays(filters?: ListDaysFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.myStructureDays(filters),
    queryFn: () => donationDaysApi.getMyStructureDays(filters),
  });
}

export function useDayDetail(dayId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.donationDay(dayId),
    queryFn: () => donationDaysApi.getDayDetail(dayId),
    enabled: !!dayId,
  });
}

export function useDayRegistrations(dayId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dayRegistrations(dayId),
    queryFn: () => donationDaysApi.getRegistrations(dayId),
    enabled: !!dayId,
  });
}

// ─── Mutations (Écriture) ───────────────────────────────────────
// Plus de onError ! Le MutationCache global de queryClient s'en charge.

export function useCreateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDayPayload) =>
      donationDaysApi.createDay(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.donationDays });
    },
  });
}

export function useUpdateDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDayPayload }) =>
      donationDaysApi.updateDay(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.donationDays });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(variables.id),
      });
    },
  });
}

export function useCancelDay() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dayId,
      cancelReason,
    }: {
      dayId: string;
      cancelReason: string;
    }) => donationDaysApi.cancelDay(dayId, cancelReason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.donationDays });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(variables.dayId),
      });
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dayId,
      registrationId,
      status,
    }: {
      dayId: string;
      registrationId: string;
      status: "ATTENDED" | "NO_SHOW";
    }) => donationDaysApi.markAttendance(dayId, registrationId, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dayRegistrations(variables.dayId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(variables.dayId),
      });
    },
  });
}

// ─── Queries & Mutations DONNEUR ────────────────────────────────

export function usePublishedDays(filters?: ListDaysFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.publishedDays(filters),
    queryFn: () => donationDaysApi.getPublishedDays(filters),
  });
}

export function useMyRegistrations(filters?: ListDaysFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.myRegistrations(filters), // ✅ Utilise la clé mise à jour
    queryFn: () => donationDaysApi.getMyRegistrations(filters),
  });
}

export function useRegisterDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dayId: string) => donationDaysApi.registerDonor(dayId),
    onSuccess: (_, dayId) => {
      // Invalide toutes les listes de journées publiées (peu importe les filtres)
      queryClient.invalidateQueries({
        queryKey: ["donation-days", "published"],
      });
      // Invalide toutes les listes de mes inscriptions
      queryClient.invalidateQueries({
        queryKey: ["donation-days", "my-registrations"],
      });
      // Invalide le détail de cette journée spécifique
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(dayId),
      });
    },
  });
}

export function useCancelDonorRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dayId: string) =>
      donationDaysApi.cancelDonorRegistration(dayId),
    onSuccess: (_, dayId) => {
      queryClient.invalidateQueries({
        queryKey: ["donation-days", "published"],
      });
      queryClient.invalidateQueries({
        queryKey: ["donation-days", "my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(dayId),
      });
    },
  });
}
