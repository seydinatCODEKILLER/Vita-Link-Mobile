import { Ionicons } from "@expo/vector-icons";

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PENDING: { label: "En attente", color: "amber", icon: "time-outline" },
  USED: {
    label: "Utilisé",
    color: "success",
    icon: "checkmark-circle-outline",
  },
  EXPIRED: { label: "Expiré", color: "red", icon: "alert-circle-outline" },
  CANCELLED: {
    label: "Annulé",
    color: "textMuted",
    icon: "close-circle-outline",
  },
};

export const TAB_FILTERS = [
  {
    label: "En attente",
    value: "PENDING",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    label: "Expirés",
    value: "EXPIRED",
    icon: "alert-circle-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    label: "Utilisés",
    value: "USED",
    icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
  },
];
