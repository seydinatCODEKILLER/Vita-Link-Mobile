import {
  BloodStockLevel,
  BloodType,
  HealthStructureStatus,
} from "./shared.types";

export interface StructureStats {
  totalDonations: number;
  avgResponseTimeMinutes: number | null;
  alerts: {
    ACTIVE?: number;
    QUOTA_REACHED?: number;
    EXPIRED?: number;
    CANCELLED?: number;
  };
  bloodStocks: {
    bloodType: BloodType;
    quantity: number;
    level: BloodStockLevel;
  }[];
}

export interface HealthStructure {
  id: string;
  name: string;
  registrationNumber: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  isVerified: boolean;
  status: HealthStructureStatus;
  verifiedAt: string | null;
  createdAt: string;
}

export type StaffRole = "CNTS_ADMIN" | "CNTS_AGENT" | "HOSPITAL_AGENT";

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  isStructureAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface AffiliatedHospital {
  id: string;
  name: string;
  structureType: "HOSPITAL" | "HEALTH_CENTER";
  status: HealthStructureStatus;
  address: string;
  region: string;
  phone: string | null;
  email: string | null;
  _count: {
    staffMembers: number;
  };
}

export interface HospitalDetail extends AffiliatedHospital {
  bloodRequests: {
    id: string;
    bloodType: string;
    quantityNeeded: number;
    status: string;
    createdAt: string;
  }[];
}

export interface AvailableCnts {
  id: string;
  name: string;
  region: string;
  address: string;
}
