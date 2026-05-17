import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

// ─── Temps restant avant expiration ──────────────────────────
export const getTimeRemaining = (expiresAt: string | null): string => {
  if (!expiresAt) return "Pas de limite";

  const now = dayjs();
  const expiry = dayjs(expiresAt);
  const diffMinutes = expiry.diff(now, "minute");

  if (diffMinutes <= 0) return "Expirée";
  if (diffMinutes < 60) return `${diffMinutes} min restantes`;

  const diffHours = expiry.diff(now, "hour");
  return `${diffHours}h restantes`;
};

// ─── Distance formatée ────────────────────────────────────────
export const formatDistance = (km: number | null | undefined): string => {
  if (km == null) return "— km";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${Math.round(km * 10) / 10} km`;
};

// ─── Date formatée ────────────────────────────────────────────
export const formatDate = (date: string): string => {
  return dayjs(date).format("DD MMM YYYY");
};

export const formatDateTime = (date: string): string => {
  return dayjs(date).format("DD MMM YYYY à HH:mm");
};

export const formatRelative = (date: string): string => {
  return dayjs(date).fromNow();
};

// ─── Groupe sanguin ───────────────────────────────────────────
export const BLOOD_TYPE_LABELS: Record<string, string> = {
  A_POS: "A+",  A_NEG: "A−",
  B_POS: "B+",  B_NEG: "B−",
  AB_POS: "AB+", AB_NEG: "AB−",
  O_POS: "O+",  O_NEG: "O−",
};

export const formatBloodType = (bloodType: string): string => {
  return BLOOD_TYPE_LABELS[bloodType] ?? bloodType;
};

// ─── Service hospitalier ──────────────────────────────────────
export const SERVICE_LABELS: Record<string, string> = {
  EMERGENCY_ROOM: "Urgences",
  OPERATING_ROOM: "Bloc opératoire",
  MATERNITY:      "Maternité",
  GENERAL:        "Service général",
  PEDIATRICS:     "Pédiatrie",
};

export const formatServiceUnit = (unit: string): string => {
  return SERVICE_LABELS[unit] ?? unit;
};