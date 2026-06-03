import {
  AuthResponse,
  LoginPayload,
  RefreshResponse,
  RegisterCntsPayload,
  RegisterHospitalPayload,
  RegisterStructureResponse,
} from "../types/auth.types";
import { api } from "./client";

export const authApi = {
  // ── POST /auth/register/cnts ──────────────────────────────
  registerCnts: async (
    payload: RegisterCntsPayload,
  ): Promise<RegisterStructureResponse> => {
    const { data } = await api.post<
      { success: boolean } & RegisterStructureResponse
    >("/auth/register/cnts", payload);
    return data;
  },

  // ── POST /auth/register/hospital ──────────────────────────
  registerHospital: async (
    payload: RegisterHospitalPayload,
  ): Promise<RegisterStructureResponse> => {
    const { data } = await api.post<
      { success: boolean } & RegisterStructureResponse
    >("/auth/register/hospital", payload);
    return data;
  },

  // ── POST /auth/login (agents & admins) ────────────────────
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: boolean } & AuthResponse>(
      "/auth/login",
      payload,
    );
    return data;
  },

  // ── POST /auth/refresh ────────────────────────────────────
  refresh: async (refreshToken: string): Promise<RefreshResponse> => {
    const { data } = await api.post<{ success: boolean } & RefreshResponse>(
      "/auth/refresh",
      { refreshToken },
    );
    return data;
  },

  // ── POST /auth/logout ─────────────────────────────────────
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};
