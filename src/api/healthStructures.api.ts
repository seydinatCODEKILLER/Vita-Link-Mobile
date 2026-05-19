import { HealthStructure, StructureStats } from "../types/healthStructure.type";
import { api } from "./client";

// ─── Appels API ───────────────────────────────────────────────

export const healthStructuresApi = {
  // ── GET /health-structures/me ─────────────────────────────
  getMyStructure: async (): Promise<HealthStructure> => {
    const { data } = await api.get<{ success: boolean; structure: HealthStructure }>(
      "/health-structures/me",
    );
    return data.structure;
  },

  // ── GET /health-structures/me/stats ───────────────────────
  getMyStats: async (): Promise<StructureStats> => {
    const { data } = await api.get<{ success: boolean; stats: StructureStats }>(
      "/health-structures/me/stats",
    );
    return data.stats;
  },
};