import { PaginatedResponse } from "./shared.types";

// ─── Enums ───────────────────────────────────────────────────
export const DonationDayStatusEnum = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;
export type DonationDayStatus =
  (typeof DonationDayStatusEnum)[keyof typeof DonationDayStatusEnum];

export const RegistrationStatusEnum = {
  REGISTERED: "REGISTERED",
  ATTENDED: "ATTENDED",
  NO_SHOW: "NO_SHOW",
  CANCELLED: "CANCELLED",
} as const;
export type RegistrationStatus =
  (typeof RegistrationStatusEnum)[keyof typeof RegistrationStatusEnum];

// ─── Modèles principaux ──────────────────────────────────────

export interface DonationDay {
  id: string;
  title: string;
  description: string | null;
  photoUrl: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  targetDonors: number;
  bloodTypesNeeded: string[];
  status: DonationDayStatus;
  publishedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  healthStructure: { id: string; name: string };
  createdBy: { id: string; firstName: string; lastName: string };
  _count?: { registrations: number };
  remainingSpots?: number;
}

export interface DayRegistration {
  id: string;
  status: RegistrationStatus;
  timeSlot: string | null;
  registeredAt: string;
  attendedAt: string | null;
  donor: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    bloodType: string;
  };
}

export interface RegistrationSummary {
  registered: number;
  attended: number;
  noShow: number;
  cancelled: number;
}

// ─── Réponses API spécifiques ────────────────────────────────

export type DayListResponse = PaginatedResponse<DonationDay>;

export interface DayDetailResponse {
  registrations: DayRegistration[];
  summary: RegistrationSummary;
}

// ─── Payloads (Requêtes) ────────────────────────────────────

export interface ListDaysFilters {
  page?: number;
  limit?: number;
  status?: DonationDayStatus;
}

export interface CreateDayPayload {
  title: string;
  description?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  targetDonors?: number;
  bloodTypesNeeded?: string[];
  photoUri?: string | null;
}

export type UpdateDayPayload = Partial<CreateDayPayload>;