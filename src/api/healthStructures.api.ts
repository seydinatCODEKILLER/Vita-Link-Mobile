import {
  AffiliatedHospital,
  AvailableCnts,
  HealthStructure,
  StaffMember,
  StructureStats,
} from "../types/healthStructure.type";
import { api } from "./client";

// ─── Appels API ───────────────────────────────────────────────

export const healthStructuresApi = {
  // ── GET /health-structures/me ─────────────────────────────
  getMyStructure: async (): Promise<HealthStructure> => {
    const { data } = await api.get<{
      success: boolean;
      structure: HealthStructure;
    }>("/health-structures/me");
    return data.structure;
  },

  // ── GET /health-structures/me/stats ───────────────────────
  getMyStats: async (): Promise<StructureStats> => {
    const { data } = await api.get<{ success: boolean; stats: StructureStats }>(
      "/health-structures/me/stats",
    );
    return data.stats;
  },

  getMyStaff: async (): Promise<StaffMember[]> => {
    const { data } = await api.get<{ success: boolean; staff: StaffMember[] }>(
      "/health-structures/me/staff",
    );
    return data.staff;
  },

  // ── POST /health-structures/me/staff ──────────────────────
  addStaff: async (staffData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    isStructureAdmin?: boolean;
  }): Promise<StaffMember> => {
    const { data } = await api.post<{ success: boolean; agent: StaffMember }>(
      "/health-structures/me/staff",
      staffData,
    );
    return data.agent;
  },

  // ── DELETE /health-structures/me/staff/:userId ────────────
  removeStaff: async (userId: string): Promise<void> => {
    await api.delete(`/health-structures/me/staff/${userId}`);
  },

  updateMyStructure: async (data: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<HealthStructure> => {
    const { data: responseData } = await api.patch<{
      success: boolean;
      structure: HealthStructure;
    }>("/health-structures/me", data);
    return responseData.structure;
  },

  // ── GET /health-structures/me/affiliated-hospitals ────────
  getAffiliatedHospitals: async (filters?: {
    status?: string;
  }): Promise<AffiliatedHospital[]> => {
    const { data } = await api.get<{
      success: boolean;
      hospitals: AffiliatedHospital[];
    }>("/health-structures/me/affiliated-hospitals", { params: filters });
    return data.hospitals;
  },

  getAvailableCnts: async (): Promise<AvailableCnts[]> => {
    const { data } = await api.get<{ success: boolean; data: AvailableCnts[] }>(
      "/auth/cnts/available",
    );
    return data.data;
  },
};
