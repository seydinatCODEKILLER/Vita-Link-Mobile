import { CntsDashboard, HospitalDashboard } from "../types/dashboard.types";
import { api } from "./client";

export const dashboardApi = {
  // ── GET /dashboard/cnts ─────────────────────────────────
  getCntsDashboard: async (params?: {
    recentRequestsLimit?: number;
  }): Promise<CntsDashboard> => {
    const { data } = await api.get<{
      success: boolean;
      dashboard: CntsDashboard;
    }>("/dashboard/cnts", { params });
    return data.dashboard;
  },

  getHospitalDashboard: async (params?: {
    myRequestsLimit?: number;
  }): Promise<HospitalDashboard> => {
    const { data } = await api.get<{
      success: boolean;
      dashboard: HospitalDashboard;
    }>("/dashboard/hospital", { params });
    return data.dashboard;
  },
};
