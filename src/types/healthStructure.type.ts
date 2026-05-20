import { BloodStockLevel, BloodType, HealthStructureStatus } from "./shared.types";

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

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  isStructureAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}