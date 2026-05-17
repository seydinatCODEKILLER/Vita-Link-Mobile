import {
  Alert,
  AlertResponse,
  AlertResponsesSummary,
  ConfirmAlertPayload,
  ConfirmAlertResponse,
  CreateAlertPayload,
  CreateAlertResponse,
} from "@/src/types/alert.types";
import { api } from "./client";

export const alertsApi = {
  // ── GET /alerts?lat=..&lng=.. (Donneur) ───────────────────
  getNearby: async (params?: {
    lat?: number;
    lng?: number;
    radius?: number;
  }): Promise<Alert[]> => {
    const { data } = await api.get<{ success: boolean; alerts: Alert[] }>(
      "/alerts",
      { params },
    );
    return data.alerts;
  },

  // ── GET /alerts/:id ───────────────────────────────────────
  getById: async (alertId: string): Promise<Alert> => {
    const { data } = await api.get<{ success: boolean; alert: Alert }>(
      `/alerts/${alertId}`,
    );
    return data.alert;
  },

  // ── GET /alerts/my-structure (Agent) ─────────────────────
  getMyStructure: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ alerts: Alert[]; pagination: any }> => {
    const { data } = await api.get<{
      success: boolean;
      alerts: Alert[];
      pagination: any;
    }>("/alerts/my-structure", { params });
    return data;
  },

  // ── POST /alerts (Agent) ──────────────────────────────────
  create: async (payload: CreateAlertPayload): Promise<CreateAlertResponse> => {
    const { data } = await api.post<{ success: boolean } & CreateAlertResponse>(
      "/alerts",
      payload,
    );
    return data;
  },

  // ── PATCH /alerts/:id/close (Agent) ──────────────────────
  close: async (alertId: string): Promise<Alert> => {
    const { data } = await api.patch<{ success: boolean; alert: Alert }>(
      `/alerts/${alertId}/close`,
    );
    return data.alert;
  },

  // ── GET /alerts/:id/responses (Dashboard médecin) ────────
  getResponses: async (
    alertId: string,
  ): Promise<{
    alert: Alert;
    responses: AlertResponse[];
    summary: AlertResponsesSummary;
  }> => {
    const { data } = await api.get<{
      success: boolean;
      alert: Alert;
      responses: AlertResponse[];
      summary: AlertResponsesSummary;
    }>(`/alerts/${alertId}/responses`);
    return data;
  },

  // ── POST /alert-responses/:alertId/confirm (Donneur) ─────
  confirm: async (
    alertId: string,
    payload?: ConfirmAlertPayload,
  ): Promise<ConfirmAlertResponse> => {
    const { data } = await api.post<
      { success: boolean } & ConfirmAlertResponse
    >(`/alert-responses/${alertId}/confirm`, payload ?? {});
    return data;
  },

  // ── POST /alert-responses/:alertId/decline (Donneur) ─────
  decline: async (alertId: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ success: boolean; message: string }>(
      `/alert-responses/${alertId}/decline`,
    );
    return data;
  },

  checkActiveConfirmation: async (): Promise<{
    hasActiveConfirmation: boolean;
  }> => {
    const { data } = await api.get<{
      success: boolean;
      hasActiveConfirmation: boolean;
    }>("/alert-responses/active-confirmation");
    return data;
  },

  cancel: async (alertId: string): Promise<{ message: string }> => {
    const { data } = await api.patch<{ success: boolean; message: string }>(
      `/alert-responses/${alertId}/cancel`,
    );
    return data;
  },
};
