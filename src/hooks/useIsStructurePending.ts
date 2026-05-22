import { HealthStructureStatusEnum } from "../types/shared.types";
import { useMyStructure } from "./useHealthStructure";

// ─── Sélecteurs Structure de Santé ───────────────────────────
export const useIsStructurePending = () => {
  const { data: structure } = useMyStructure();
  return structure?.status === HealthStructureStatusEnum.PENDING_REVIEW;
};