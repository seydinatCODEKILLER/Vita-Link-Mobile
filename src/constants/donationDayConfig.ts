import { AppColors } from "@/src/theme/colors";

export const DAY_FILTERS = [
  { key: "PUBLISHED", label: "À venir" },
  { key: "COMPLETED", label: "Terminées" },
  { key: "CANCELLED", label: "Annulées" },
] as const;

export const getThemeStatusConfig = (c: AppColors) => ({
  DRAFT: {
    label: "Brouillon",
    bg: c.cardBorder + "20",
    border: c.cardBorder + "40",
    color: c.textMuted,
    coverBg: c.cardBorder + "10",
    iconName: "create-outline" as const,
  },
  PUBLISHED: {
    label: "À venir",
    bg: "rgba(29,158,117,0.14)",
    border: "rgba(29,158,117,0.28)",
    color: "#1D9E75",
    coverBg: c.red + "08",
    iconName: "calendar-outline" as const,
  },
  COMPLETED: {
    label: "Terminée",
    bg: "rgba(96,165,250,0.14)",
    border: "rgba(96,165,250,0.28)",
    color: "#60A5FA",
    coverBg: "rgba(96,165,250,0.07)",
    iconName: "checkmark-circle-outline" as const,
  },
  CANCELLED: {
    label: "Annulée",
    bg: "rgba(220,30,30,0.12)",
    border: "rgba(220,30,30,0.25)",
    color: "#DC1E1E",
    coverBg: c.red + "05",
    iconName: "close-circle-outline" as const,
  },
});
