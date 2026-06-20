import { RegistrationSummary } from "@/src/types/donation-day.types";

export const REGISTRATION_STATUS_CONFIG = {
  REGISTERED: {
    label: "En attente",
    color: "#F59E0B",
    icon: "time-outline" as const,
  },
  ATTENDED: {
    label: "Présent",
    color: "#10B981",
    icon: "checkmark-circle-outline" as const,
  },
  NO_SHOW: {
    label: "Absent",
    color: "#EF4444",
    icon: "close-circle-outline" as const,
  },
  CANCELLED: {
    label: "Annulé",
    color: "#6B7280",
    icon: "ban-outline" as const,
  },
};

export const STATS: {
  key: keyof RegistrationSummary;
  label: string;
  color: string;
}[] = [
  { key: "registered", label: "En attente", color: "#F59E0B" },
  { key: "attended", label: "Présents", color: "#10B981" },
  { key: "noShow", label: "Absents", color: "#EF4444" },
];

export const FILTERS = [
  { key: "ALL", label: "Tous" },
  { key: "REGISTERED", label: "En attente" },
  { key: "ATTENDED", label: "Présents" },
  { key: "NO_SHOW", label: "Absents" },
];
