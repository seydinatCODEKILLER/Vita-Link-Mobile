import {
  AlertResponseStatus,
  AlertStatus,
  BloodType,
  ServiceUnit,
  UrgencyLevel,
} from "./shared.types";

// ─── Alert ────────────────────────────────────────────────────

export interface AlertStructure {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
}

// Ajoute ces valeurs dans ton shared.types.ts
export const AlertOriginEnum = {
  CNTS_DIRECT: "CNTS_DIRECT",
  CNTS_ESCALATION: "CNTS_ESCALATION",
  HOSPITAL_DIRECT: "HOSPITAL_DIRECT",
} as const;
export type AlertOrigin =
  (typeof AlertOriginEnum)[keyof typeof AlertOriginEnum];

export interface Alert {
  id: string;
  bloodType: BloodType;
  quantityNeeded: number;
  quantityConfirmed: number;
  urgencyLevel: UrgencyLevel;
  status: AlertStatus;
  serviceUnit: ServiceUnit;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number;
  expiresAt: string | null;
  createdAt: string;

  origin: AlertOrigin;
  bloodRequestId: string | null;

  healthStructure: AlertStructure;
  distance_km?: number;
}

// ─── Alert Response ───────────────────────────────────────────

export interface AlertResponseDonor {
  id: string;
  firstName: string;
  lastName: string;
  bloodType: BloodType | null;
  avatarUrl: string | null;
  phone: string;
}

export interface AlertResponse {
  id: string;
  status: AlertResponseStatus;
  etaMinutes: number | null;
  respondedAt: string;
  arrivedAt: string | null;
  qrCode: string | null;
  donor: AlertResponseDonor;
}

export interface AlertResponsesSummary {
  confirmed: number;
  arrived: number;
  declined: number;
  noShow: number;
}

// ─── Payloads ─────────────────────────────────────────────────

export interface CreateAlertPayload {
  bloodType: BloodType;
  quantityNeeded: number;
  urgencyLevel: UrgencyLevel;
  serviceUnit?: ServiceUnit;
  radiusKm?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
  expiresAt?: string;
}

export interface ConfirmAlertPayload {
  etaMinutes?: number;
}

// ─── Réponses API ─────────────────────────────────────────────

export interface ConfirmAlertResponse {
  message: string;
  qrCode: string;
  isQuotaReached: boolean;
}

export interface CreateAlertResponse {
  alert: Alert;
  notifiedDonors: number;
}
