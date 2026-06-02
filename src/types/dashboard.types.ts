import { BloodStockLevel, BloodType, UrgencyLevel } from "./shared.types";

export interface CntsDashboardKpis {
  pendingRequests: number;
  criticalStocks: number;
  activeAlerts: number;
  totalDonations: number;
}

export interface BloodStockItem {
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel;
}

export interface RecentRequest {
  id: string;
  bloodType: BloodType;
  quantityNeeded: number;
  urgencyLevel: UrgencyLevel;
  status: string;
  createdAt: string;
  requestingHospital: {
    id: string;
    name: string;
    region: string;
  };
}

export interface CntsDashboard {
  kpis: CntsDashboardKpis;
  bloodStocks: BloodStockItem[];
  recentRequests: RecentRequest[];
}

export interface HospitalDashboardKpis {
  pendingRequests: number;
  activeDirectAlerts: number;
  totalDonations: number;
}

export interface HospitalRequest {
  id: string;
  bloodType: BloodType;
  quantityNeeded: number;
  quantityProvided: number;
  status: string;
  urgencyLevel: UrgencyLevel;
  createdAt: string;
}

export interface HospitalDashboard {
  kpis: HospitalDashboardKpis;
  myRequests: HospitalRequest[];
  cntsStock: BloodStockItem[];
}
