import { api } from "./client";
import { CouponsResponse, RedeemRewardResponse, Reward } from "../types/domain.types";

export const couponsApi = {
  // ── GET /rewards → Catalogue ──────────────────────────────
  getRewards: async (): Promise<Reward[]> => {
    const { data } = await api.get<{ success: boolean; rewards: Reward[] }>(
      "/rewards",
    );
    return data.rewards;
  },

  // ── POST /coupons/redeem/:rewardId → Échanger ────────────
  redeemReward: async (rewardId: string): Promise<RedeemRewardResponse> => {
    const { data } = await api.post<
      { success: boolean } & RedeemRewardResponse
    >(`/coupons/redeem/${rewardId}`);
    return data;
  },

  // ── GET /coupons/me → Mes coupons ────────────────────────
  getMyCoupons: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<CouponsResponse> => {
    const { data } = await api.get<{ success: boolean } & CouponsResponse>(
      "/coupons/me",
      { params },
    );
    return data;
  },
};
