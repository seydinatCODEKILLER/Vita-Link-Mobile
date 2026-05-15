// ─── Enums partagés ───────────────────────────────────────────
// Ces types sont utilisés dans plusieurs domaines (user, alert, donation...)

export type Role = "DONOR" | "HEALTH_STRUCTURE" | "ADMIN";
export type Gender = "MALE" | "FEMALE";
export type BloodType =
  | "A_POS"
  | "A_NEG"
  | "B_POS"
  | "B_NEG"
  | "AB_POS"
  | "AB_NEG"
  | "O_POS"
  | "O_NEG";
export type DonorGrade = "ASPIRANT" | "SENTINELLE" | "AMBASSADEUR";
export type UrgencyLevel = "VITAL" | "STANDARD";
export type AlertStatus = "ACTIVE" | "QUOTA_REACHED" | "EXPIRED" | "CANCELLED";
export type AlertResponseStatus =
  | "CONFIRMED"
  | "DECLINED"
  | "ARRIVED"
  | "NO_SHOW"
  | "CANCELLED";
export type ServiceUnit =
  | "EMERGENCY_ROOM"
  | "OPERATING_ROOM"
  | "MATERNITY"
  | "GENERAL"
  | "PEDIATRICS";
export type CouponStatus = "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED";
export type BloodStockLevel = "CRITICAL" | "LOW" | "ADEQUATE" | "SURPLUS";
export type HealthStructureStatus = "PENDING_REVIEW" | "VERIFIED" | "SUSPENDED";

// ─── Pagination ───────────────────────────────────────────────

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}
