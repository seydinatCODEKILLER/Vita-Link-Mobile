import {
  AuthResponse,
  LoginPayload,
  RefreshResponse,
  RegisterCntsPayload,
  RegisterDonorPayload,
  RegisterHospitalPayload,
  RegisterStructurePayload,
  RegisterStructureResponse,
  VerifyOtpPayload,
} from "../types/auth.types";
import { api } from "./client";

export const authApi = {
  // ── POST /auth/register/donor ─────────────────────────────
  registerDonor: async (
    payload: RegisterDonorPayload,
  ): Promise<{ message: string; email: string }> => {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      email: string;
    }>("/auth/register/donor", payload);
    return data;
  },

  // ── POST /auth/register/health-structure ──────────────────
  registerHealthStructure: async (
    payload: RegisterStructurePayload,
  ): Promise<RegisterStructureResponse> => {
    const { data } = await api.post<
      { success: boolean } & RegisterStructureResponse
    >("/auth/register/health-structure", payload);
    return data;
  },

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

  // ── POST /auth/otp/send ───────────────────────────────────
  sendOtp: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>(
      "/auth/otp/send",
      { email },
    );
    return data;
  },

  // ── POST /auth/otp/verify ─────────────────────────────────
  // Reçoit les données du donneur pour l'upsert en base
  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthResponse> => {
    const { data } = await api.post<{ success: boolean } & AuthResponse>(
      "/auth/otp/verify",
      payload,
    );
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
