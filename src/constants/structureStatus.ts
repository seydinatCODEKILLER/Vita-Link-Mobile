import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "@/src/theme/colors";

export const getStatusConfig = (
  colors: AppColors,
): Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  VERIFIED: {
    label: "Vérifié",
    color: colors.success,
    icon: "shield-checkmark",
  },
  PENDING_REVIEW: {
    label: "En attente",
    color: colors.amber,
    icon: "time-outline",
  },
  SUSPENDED: {
    label: "Suspendu",
    color: colors.red,
    icon: "alert-circle-outline",
  },
});
