import { AppColors } from "@/src/theme/colors";
import { BloodRequestStatus } from "@/src/types/shared.types";

export const STATUS_CONFIG = (colors: AppColors) => ({
  PENDING: {
    label: "En attente",
    color: colors.amber,
    icon: "time-outline" as const,
    stripeColor: colors.amber,
  },
  FULFILLED: {
    label: "Traitée",
    color: colors.success,
    icon: "checkmark-circle-outline" as const,
    stripeColor: colors.success,
  },
  PARTIALLY_FULFILLED: {
    label: "Partiel",
    color: "#60A5FA",
    icon: "pie-chart-outline" as const,
    stripeColor: "#60A5FA",
  },
  ESCALATED_TO_ALERT: {
    label: "Escaladée",
    color: colors.red,
    icon: "alert-circle-outline" as const,
    stripeColor: colors.red,
  },
  REJECTED: {
    label: "Rejetée",
    color: colors.textMuted,
    icon: "close-circle-outline" as const,
    stripeColor: colors.textMuted,
  },
  CANCELLED: {
    label: "Annulée",
    color: colors.textMuted,
    icon: "ban-outline" as const,
    stripeColor: colors.textMuted,
  },
});

export const FILTERS: { key: BloodRequestStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "FULFILLED", label: "Traitées" },
  { key: "ESCALATED_TO_ALERT", label: "Escaladées" },
];
