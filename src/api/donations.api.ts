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
};
