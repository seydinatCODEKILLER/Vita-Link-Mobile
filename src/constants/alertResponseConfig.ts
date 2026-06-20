import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "@/src/theme/colors";
import { AlertResponseStatus } from "@/src/types/shared.types";

export const getResponseConfig = (
  colors: AppColors,
): Record<
  AlertResponseStatus,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> => ({
  CONFIRMED: { label: "En route", icon: "walk-outline", color: colors.blue },
  ARRIVED: {
    label: "Arrivé",
    icon: "checkmark-circle-outline",
    color: colors.success,
  },
  DECLINED: {
    label: "Refusé",
    icon: "close-circle-outline",
    color: colors.red,
  },
  NO_SHOW: {
    label: "Absent",
    icon: "alert-circle-outline",
    color: colors.amber,
  },
  CANCELLED: {
    label: "Annulé",
    icon: "remove-circle-outline",
    color: colors.textMuted,
  },
});
