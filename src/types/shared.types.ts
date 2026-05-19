// ─── Enums partagés ───────────────────────────────────────────
// Ces types sont utilisés dans plusieurs domaines (user, alert, donation...)

export const RoleEnum = {
  DONOR: "DONOR",
  HEALTH_STRUCTURE: "HEALTH_STRUCTURE",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof RoleEnum)[keyof typeof RoleEnum];

export const GenderEnum = {
  MALE: "MALE",
  FEMALE: "FEMALE",
} as const;
export type Gender = (typeof GenderEnum)[keyof typeof GenderEnum];

export const BloodTypeEnum = {
  A_POS: "A_POS",
  A_NEG: "A_NEG",
  B_POS: "B_POS",
  B_NEG: "B_NEG",
  AB_POS: "AB_POS",
  AB_NEG: "AB_NEG",
  O_POS: "O_POS",
  O_NEG: "O_NEG",
} as const;
export type BloodType = (typeof BloodTypeEnum)[keyof typeof BloodTypeEnum];

export const DonorGradeEnum = {
  ASPIRANT: "ASPIRANT",
  SENTINELLE: "SENTINELLE",
  AMBASSADEUR: "AMBASSADEUR",
} as const;
export type DonorGrade = (typeof DonorGradeEnum)[keyof typeof DonorGradeEnum];

export const UrgencyLevelEnum = {
  VITAL: "VITAL",
  STANDARD: "STANDARD",
} as const;
export type UrgencyLevel = (typeof UrgencyLevelEnum)[keyof typeof UrgencyLevelEnum];

export const AlertStatusEnum = {
  ACTIVE: "ACTIVE",
  QUOTA_REACHED: "QUOTA_REACHED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type AlertStatus = (typeof AlertStatusEnum)[keyof typeof AlertStatusEnum];

export const AlertResponseStatusEnum = {
  CONFIRMED: "CONFIRMED",
  DECLINED: "DECLINED",
  ARRIVED: "ARRIVED",
  NO_SHOW: "NO_SHOW",
  CANCELLED: "CANCELLED",
} as const;
export type AlertResponseStatus = (typeof AlertResponseStatusEnum)[keyof typeof AlertResponseStatusEnum];

export const ServiceUnitEnum = {
  EMERGENCY_ROOM: "EMERGENCY_ROOM",
  OPERATING_ROOM: "OPERATING_ROOM",
  MATERNITY: "MATERNITY",
  GENERAL: "GENERAL",
  PEDIATRICS: "PEDIATRICS",
} as const;
export type ServiceUnit = (typeof ServiceUnitEnum)[keyof typeof ServiceUnitEnum];

export const CouponStatusEnum = {
  ACTIVE: "ACTIVE",
  USED: "USED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
} as const;
export type CouponStatus = (typeof CouponStatusEnum)[keyof typeof CouponStatusEnum];

export const BloodStockLevelEnum = {
  CRITICAL: "CRITICAL",
  LOW: "LOW",
  ADEQUATE: "ADEQUATE",
  SURPLUS: "SURPLUS",
} as const;
export type BloodStockLevel = (typeof BloodStockLevelEnum)[keyof typeof BloodStockLevelEnum];

export const HealthStructureStatusEnum = {
  PENDING_REVIEW: "PENDING_REVIEW",
  VERIFIED: "VERIFIED",
  SUSPENDED: "SUSPENDED",
} as const;
export type HealthStructureStatus = (typeof HealthStructureStatusEnum)[keyof typeof HealthStructureStatusEnum];

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