import {
  Alert,
  AlertResponse,
  AlertResponsesSummary,
  CreateAlertPayload,
  CreateAlertResponse,
} from "@/src/types/alert.types";
import { api } from "./client";

export const alertsApi = {

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
};
