import { AppColors } from "@/src/theme/colors";
import { BloodStockLevel } from "@/src/types/shared.types";

export const getLevelConfig = (
  colors: AppColors,
): Record<BloodStockLevel, { label: string; color: string }> => ({
  CRITICAL: { label: "Critique", color: colors.red },
  LOW: { label: "Bas", color: colors.amber },
  ADEQUATE: { label: "Ok", color: colors.success },
  SURPLUS: { label: "Surplus", color: "#60A5FA" },
});

export const calculateStockLevel = (quantity: number): BloodStockLevel => {
  if (quantity === 0) return "CRITICAL";
  if (quantity <= 5) return "LOW";
  if (quantity <= 30) return "ADEQUATE";
  return "SURPLUS";
};
