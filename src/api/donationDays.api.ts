import { api } from "./client";
import { buildApiBody } from "@/src/utils/form-data.utils";
import {
  DonationDay,
  DayRegistration,
  CreateDayPayload,
  UpdateDayPayload,
  ListDaysFilters,
  DayListResponse,
  DayDetailResponse,
} from "@/src/types/donation-day.types";

export const donationDaysApi = {
  // ── GET /donation-days/my-structure ──────────────────────
  getMyStructureDays: async (
    filters?: ListDaysFilters,
  ): Promise<DayListResponse> => {
    const { data } = await api.get<{
      success: boolean;
      data: DonationDay[];
      pagination: DayListResponse["pagination"];
    }>("/donation-days/my-structure", { params: filters });

    return { data: data.data, pagination: data.pagination };
  },

  // ── GET /donation-days/:id ───────────────────────────────
  getDayDetail: async (id: string): Promise<DonationDay> => {
    const { data } = await api.get<{
      success: boolean;
      day: DonationDay;
    }>(`/donation-days/${id}`);

    return data.day;
  },

  // ── POST /donation-days ──────────────────────────────────
  createDay: async (payload: CreateDayPayload): Promise<DonationDay> => {
    const { body, isMultipart } = buildApiBody(
      {
        title: payload.title,
        description: payload.description,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        scheduledDate: payload.scheduledDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        targetDonors: payload.targetDonors,
        bloodTypesNeeded: payload.bloodTypesNeeded,
        photoUri: payload.photoUri,
      },
      "photoUri",
      "photo",
    );

    const { data } = await api.post<{ success: boolean; day: DonationDay }>(
      "/donation-days",
      body,
      {
        headers: isMultipart
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      },
    );

    return data.day;
  },

  // ── PATCH /donation-days/:id ─────────────────────────────
  updateDay: async (
    id: string,
    payload: UpdateDayPayload,
  ): Promise<DonationDay> => {
    const { body, isMultipart } = buildApiBody(
      {
        title: payload.title,
        description: payload.description,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        scheduledDate: payload.scheduledDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        targetDonors: payload.targetDonors,
        bloodTypesNeeded: payload.bloodTypesNeeded,
        photoUri: payload.photoUri,
      },
      "photoUri",
      "photo",
    );

    const { data } = await api.patch<{ success: boolean; day: DonationDay }>(
      `/donation-days/${id}`,
      body,
      {
        headers: isMultipart
          ? { "Content-Type": "multipart/form-data" }
          : undefined,
      },
    );

    return data.day;
  },

  // ── PATCH /donation-days/:id/cancel ──────────────────────
  cancelDay: async (id: string, cancelReason: string): Promise<DonationDay> => {
    const { data } = await api.patch<{ success: boolean; day: DonationDay }>(
      `/donation-days/${id}/cancel`,
      { cancelReason },
    );

    return data.day;
  },

  // ── GET /donation-days/:id/registrations ─────────────────
  getRegistrations: async (id: string): Promise<DayDetailResponse> => {
    const { data } = await api.get<{
      success: boolean;
      registrations: DayRegistration[];
      summary: DayDetailResponse["summary"];
    }>(`/donation-days/${id}/registrations`);

    return {
      registrations: data.registrations,
      summary: data.summary,
    };
  },

  // ── PATCH /donation-days/:id/registrations/:registrationId/attend
  markAttendance: async (
    dayId: string,
    registrationId: string,
    status: "ATTENDED" | "NO_SHOW",
  ): Promise<DayRegistration> => {
    const { data } = await api.patch<{
      success: boolean;
      registration: DayRegistration;
    }>(`/donation-days/${dayId}/registrations/${registrationId}/attend`, {
      status,
    });

    return data.registration;
  },
};
