import { BloodType, Gender, Role } from "./shared.types";
import { User } from "./user.types";

// ─── Tokens ───────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ─── Réponses API ─────────────────────────────────────────────

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterDonorResponse {
  message: string;
  email: string;
  requiresEmail?: boolean;
  phone?: string;
}

export interface RegisterStructureResponse {
  message: string;
  director: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    isStructureAdmin: boolean;
    healthStructureId: string;
  };
  structure: {
    id: string;
    name: string;
    status: "PENDING_REVIEW";
  };
}

// ─── Payloads (ce qu'on envoie à l'API) ──────────────────────

export interface RegisterDonorPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  bloodType: BloodType;
  gender: Gender;
  dateOfBirth?: string;
}

export interface RegisterStructurePayload {
  // Directeur
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  // Structure
  structureName: string;
  registrationNumber: string;
  region: string;
  address: string;
  structurePhone?: string;
  structureEmail?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  phone: string;
  firstName: string;
  lastName: string;
  bloodType: BloodType;
  gender: Gender;
  dateOfBirth?: string;
}

export interface SendOtpPayload {
  email: string;
}
