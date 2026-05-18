import { Reward } from "../types/domain.types";
import { api } from "./client";

export const rewardsApi = {
  // ── GET /rewards → Catalogue public pour les donneurs
  getRewards: async (): Promise<Reward[]> => {
    const { data } = await api.get<{ success: boolean; rewards: Reward[] }>(
      "/rewards",
    );
    return data.rewards;
  },
};
