import { Badge, JambaarsProgression, JambaarsRanks, LeaderboardEntry } from "./domain.types";
import { JambaarsProfile } from "./user.types";

export interface JambaarProfileResponse {
  profile: JambaarsProfile & { id: string };
  progression: JambaarsProgression;
  ranks: JambaarsRanks;
}

export interface BadgesResponse {
  earned: number;
  total: number;
  badges: Badge[];
}

export interface LeaderboardResponse {
  scope: string;
  myRank: number | null;
  leaderboard: LeaderboardEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}