import {
  BadgesResponse,
  JambaarProfileResponse,
  LeaderboardResponse,
} from "../types/jambaar.types";
import { api } from "./client";

export const jambaarApi = {
  getMyProfile: async (): Promise<JambaarProfileResponse> => {
    const { data } = await api.get<
      { success: boolean } & JambaarProfileResponse
    >("/jambaar/me");
    return data;
  },

  getMyBadges: async (): Promise<BadgesResponse> => {
    const { data } = await api.get<{ success: boolean } & BadgesResponse>(
      "/jambaar/me/badges",
    );
    return data;
  },

  getLeaderboard: async (params?: {
    city?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<LeaderboardResponse> => {
    const { data } = await api.get<{ success: boolean } & LeaderboardResponse>(
      "/jambaar/leaderboard",
      { params },
    );
    return data;
  },
};
