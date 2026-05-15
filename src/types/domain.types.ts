import {
  BloodType,
  BloodStockLevel,
  CouponStatus,
  DonorGrade,
  ServiceUnit,
  UrgencyLevel,
} from "./shared.types";

// ─── Donation ─────────────────────────────────────────────────

export interface DonationAlert {
  id: string;
  bloodType: BloodType;
  urgencyLevel: UrgencyLevel;
  serviceUnit: ServiceUnit;
  healthStructure: { id: string; name: string; address: string };
}

export interface Donation {
  id: string;
  isDone: boolean;
  pointsAwarded: number;
  donatedAt: string | null;
  validatedAt: string | null;
  notes: string | null;
  alertResponse: {
    qrCode: string | null;
    etaMinutes: number | null;
    alert: DonationAlert;
  } | null;
}

export interface ScanDonationPayload {
  qrCode: string;
  notes?: string;
  testResultsJson?: string;
}

export interface ScanDonationResponse {
  message: string;
  donation: Donation;
  jambaar: {
    pointsAwarded: number;
    newTotalPoints: number;
    newGrade: DonorGrade;
    gradeChanged: boolean;
    nextEligibilityAt: string;
  };
}

// ─── Jambaar ──────────────────────────────────────────────────

export interface JambaarsProgression {
  currentGrade: DonorGrade;
  nextGrade: DonorGrade | null;
  pointsToNext: number;
  progressPercent: number;
}

export interface JambaarsRanks {
  global: number | null;
  city: number | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  criteria: string;
  isSeasonal: boolean;
  season: string | null;
  isUnlocked: boolean;
  earnedAt: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  totalPoints: number;
  currentGrade: DonorGrade;
  donationCount: number;
  livesSavedEstimate: number;
  city: string | null;
  district: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    bloodType: BloodType | null;
  };
}

// ─── Blood Stock ──────────────────────────────────────────────

export interface BloodStock {
  id: string;
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel;
  updatedAt: string;
}

// ─── Coupon ───────────────────────────────────────────────────

export interface CouponReward {
  id: string;
  title: string;
  description: string;
  rewardType: string;
  partner: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
}

export interface Coupon {
  id: string;
  code: string;
  status: CouponStatus;
  usedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  reward: CouponReward;
}
