import { api } from "./client";
import {
  BloodRequest,
  HandleRequestPayload,
  ListBloodRequestsFilters,
} from "../types/blood-request.types";
import { BloodType, UrgencyLevel } from "../types/shared.types";

export const bloodRequestsApi = {
  getRequests: async (
    filters?: ListBloodRequestsFilters,
  ): Promise<{ requests: BloodRequest[]; pagination: any }> => {
    const { data } = await api.get<{
      success: boolean;
      requests: BloodRequest[];
      pagination: any;
    }>("/blood-requests", { params: filters });
    return { requests: data.requests, pagination: data.pagination };
  },

  getById: async (id: string): Promise<BloodRequest> => {
    const { data } = await api.get<{ success: boolean; request: BloodRequest }>(
      `/blood-requests/${id}`,
    );
    return data.request;
  },

  handleRequest: async (
    id: string,
    payload: HandleRequestPayload,
  ): Promise<BloodRequest> => {
    const { data } = await api.post<{
      success: boolean;
      request: BloodRequest;
    }>(`/blood-requests/${id}/handle`, payload);
    return data.request;
  },

  cancelRequest: async (id: string): Promise<BloodRequest> => {
    const { data } = await api.patch<{
      success: boolean;
      request: BloodRequest;
    }>(`/blood-requests/${id}/cancel`);
    return data.request;
  },

  createRequest: async (payload: {
    bloodType: BloodType;
    quantityNeeded: number;
    urgencyLevel: UrgencyLevel;
    serviceUnit?: string;
    clinicalContext?: string;
  }): Promise<BloodRequest> => {
    const { data } = await api.post<{
      success: boolean;
      request: BloodRequest;
    }>("/blood-requests", payload);
    return data.request;
  },
};
