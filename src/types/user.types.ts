import {
  BloodType,
  DonorGrade,
  Gender,
  HealthStructureStatus,
  Role,
} from "./shared.types";

// ─── Sous-interfaces ──────────────────────────────────────────

export interface JambaarsProfile {
  totalPoints: number;
  currentGrade: DonorGrade;
  donationCount: number;
  livesSavedEstimate: number;
  lastDonationAt: string | null;
  nextEligibilityAt: string | null;
  city: string | null;
  district: string | null;
}

export interface EmployerStructure {
  id: string;
  name: string;
  status: HealthStructureStatus;
  isVerified: boolean;
  address: string;
}

// ─── User ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string | null;
  phone: string;
  firstName: string;
  lastName: string;
  role: Role;
  gender: Gender | null;
  dateOfBirth: string | null;
  avatarUrl: string | null;
  bloodType: BloodType | null;
  isAvailable: boolean;
  isActive: boolean;
  latitude: number | null;
  longitude: number | null;
  healthStructureId: string | null;
  isStructureAdmin: boolean;
  createdAt: string;
  jambaarsProfile: JambaarsProfile | null;
  employerStructure: EmployerStructure | null;
}

// ─── Payloads ─────────────────────────────────────────────────

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: string;
}

export interface UpdateLocationPayload {
  latitude: number;
  longitude: number;
}
