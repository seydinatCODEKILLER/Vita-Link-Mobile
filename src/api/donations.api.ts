import { api } from "./client";
import { Donation } from "../types/domain.types";

export const donationsApi = {
  // ── GET /donations/me → Historique du donneur ──────────────
  getMyDonations: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ donations: Donation[]; pagination: any }> => {
    const { data } = await api.get<{
      success: boolean;
      donations: Donation[];
      pagination: any;
    }>("/donations/me", { params });
    return data;
  },
};