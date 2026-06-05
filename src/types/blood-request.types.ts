import { BloodType, UrgencyLevel, BloodRequestStatus } from "./shared.types";

export interface BloodRequest {
  id: string;
  bloodType: BloodType;
  quantityNeeded: number;
  quantityProvided: number;
  urgencyLevel: UrgencyLevel;
  serviceUnit: string;
  clinicalContext: string | null;
  status: BloodRequestStatus;
  cntsNotes: string | null;
  escalatedAlertId: string | null;
  fulfilledAt: string | null;
  createdAt: string;
  updatedAt: string;
  purchaseOrder: PurchaseOrder | null;
  
  requestingHospital: {
    id: string;
    name: string;
    address: string;
    region: string;
  };
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  handledByCnts: {
    id: string;
    name: string;
    region: string;
  };
  handledBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  escalatedAlert: {
    id: string;
    status: string;
    createdAt: string;
  } | null;
}

export type HandleAction = "FULFILL" | "PARTIALLY_FULFILL" | "ESCALATE" | "REJECT";

export interface HandleRequestPayload {
  action: HandleAction;
  quantityProvided?: number;
  cntsNotes?: string;
  radiusKm?: number;
}

export interface ListBloodRequestsFilters {
  page?: number;
  limit?: number;
  status?: BloodRequestStatus;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  bloodType: BloodType;
  quantity: number;
  status: "PENDING" | "USED" | "EXPIRED" | "CANCELLED";
  expiresAt: string;
  scannedAt: string | null;
  cnts: { id: string; name: string; address: string };
  hospital: { id: string; name: string; address: string };
}