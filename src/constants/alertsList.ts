import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "@/src/theme/colors";
import { AlertOrigin, AlertStatus } from "@/src/types/shared.types";

export type FilterType = "ALL" | AlertStatus;

export const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "ACTIVE", label: "Actives" },
  { key: "QUOTA_REACHED", label: "Quota atteint" },
  { key: "EXPIRED", label: "Expirées" },
  { key: "CANCELLED", label: "Annulées" },
];

export const getStatusConfig = (
  colors: AppColors,
): Record<
  AlertStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  ACTIVE: { label: "En cours", color: colors.red, icon: "pulse" },
  QUOTA_REACHED: {
    label: "Quota atteint",
    color: colors.success,
    icon: "checkmark-done-circle",
  },
  EXPIRED: { label: "Expirée", color: colors.amber, icon: "time" },
  CANCELLED: {
    label: "Annulée",
    color: colors.textMuted,
    icon: "close-circle",
  },
});

export const getOriginConfig = (
  colors: AppColors,
): Record<
  AlertOrigin,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  CNTS_DIRECT: {
    label: "Direct",
    color: colors.red,
    icon: "flash",
  },
  CNTS_ESCALATION: {
    label: "Escalade",
    color: colors.amber,
    icon: "arrow-up-circle",
  },
  HOSPITAL_DIRECT: {
    label: "Hôpital",
    color: colors.textMuted,
    icon: "business",
  },
});
