import { useQuery } from "@tanstack/react-query";
import { healthStructuresApi } from "@/src/api/healthStructures.api";
import { QUERY_KEYS } from "@/src/constants/query_key";

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