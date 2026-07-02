import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { healthStructuresApi } from "@/src/api/healthStructures.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { AffiliatedHospital } from "../types/healthStructure.type";

// ── Stats du dashboard structure ───────────────────────────────
export const useStructureStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.myStructureStats,
    queryFn: () => healthStructuresApi.getMyStats(),
    staleTime: 30_000,
  });
};

// ── Infos de ma structure ──────────────────────────────────────
export const useMyStructure = () => {
  return useQuery({
    queryKey: QUERY_KEYS.myStructure,
    queryFn: () => healthStructuresApi.getMyStructure(),
    staleTime: 60_000,
  });
};

// ── Modifier ma structure (Directeur) ──────────────────────────
export const useUpdateMyStructure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
    }) => healthStructuresApi.updateMyStructure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructure });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
    },
  });
};

export function useAffiliatedHospitals(filters?: { status?: string }) {
  return useQuery<AffiliatedHospital[]>({
    // ✅ FIX : spread de QUERY_KEYS.myStructure au lieu de l'imbriquer.
    // Avant : [QUERY_KEYS.myStructure, ...] créait [["health-structures","me"], ...]
    // ce qui cassait le matching par préfixe avec invalidateQueries({ queryKey: QUERY_KEYS.myStructure }).
    queryKey: [...QUERY_KEYS.myStructure, "affiliated-hospitals", filters],
    queryFn: () => healthStructuresApi.getAffiliatedHospitals(filters),
    staleTime: 60_000,
  });
}

export const useAvailableCnts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.availableCnts,
    queryFn: healthStructuresApi.getAvailableCnts,
    staleTime: 1000 * 60 * 10,
  });
};