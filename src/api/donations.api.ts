import { api } from "./client";
import { Donation } from "../types/domain.types";

export const donationsApi = {
  // ── POST /donations/scan → Scanner QR Code ──────────────
  scanAndValidate: async (qrCode: string) => {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      donation: Donation;
      jambaar: {
        pointsAwarded: number;
        newTotalPoints: number;
        newGrade: string;
        gradeChanged: boolean;
        nextEligibilityAt: string;
      };
    }>("/donations/scan", { qrCode });
    return data;
  },
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
