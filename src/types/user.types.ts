export interface JambaarsProfile {
  totalPoints: number;
  currentGrade: string;
  donationCount: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "DONOR" | "HEALTH_STRUCTURE" | "ADMIN";
  bloodType?: string;
  gender?: "MALE" | "FEMALE";
  isActive: boolean;
  isAvailable?: boolean;
  isStructureAdmin?: boolean;
  healthStructureId?: string | null;
  jambaarsProfile?: JambaarsProfile | null;
}
