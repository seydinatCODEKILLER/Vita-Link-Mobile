import { AppColors } from "@/src/theme/colors";

export const getAvatarColors = (colors: AppColors) => [
  { bg: colors.success + "14", text: colors.success },
  { bg: "#60A5FA14", text: "#60A5FA" },
  { bg: colors.red + "12", text: colors.red },
  { bg: colors.amber + "14", text: colors.amber },
];

export const getRoleConfig = (
  colors: AppColors,
): Record<string, { label: string; color: string }> => ({
  CNTS_ADMIN: { label: "Admin CNTS", color: colors.amber },
  CNTS_AGENT: { label: "Agent CNTS", color: colors.success },
  HOSPITAL_AGENT: { label: "Agent Hôpital", color: "#60A5FA" },
});
