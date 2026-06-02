import { api } from "./client";
import { BloodType, BloodStockLevel } from "../types/shared.types";

export interface BloodStock {
  id: string;
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel;
  healthStructureId: string;
  updatedAt: string;
}

export const bloodStocksApi = {
  // ── GET /blood-stocks/me ─────────────────────────────────
  getMyStocks: async (): Promise<BloodStock[]> => {
    const { data } = await api.get<{ success: boolean; stocks: BloodStock[] }>(
      "/blood-stocks/me",
    );
    return data.stocks;
  },

  // ── PATCH /blood-stocks/me ───────────────────────────────
  updateMyStock: async (
    bloodType: BloodType,
    quantity: number,
  ): Promise<BloodStock> => {
    const { data } = await api.patch<{ success: boolean; stock: BloodStock }>(
      "/blood-stocks/me",
      { bloodType, quantity },
    );
    return data.stock;
  },
};
