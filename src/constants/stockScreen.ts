import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "@/src/theme/colors";
import { BloodStockLevel, BloodType } from "@/src/types/shared.types";

// ─── Calcul du niveau basé sur la quantité ────────────────────────────────────
export const calculateStockLevel = (quantity: number): BloodStockLevel => {
  if (quantity === 0) return "CRITICAL";
  if (quantity <= 5) return "LOW"; // Ajustez ces seuils selon vos besoins
  if (quantity <= 30) return "ADEQUATE";
  return "SURPLUS";
};

// ─── Config Groupes Sanguins ───────────────────────────────────────────────────
export const BLOOD_TYPES_CONFIG: {
  value: BloodType;
  label: string;
  isRare?: boolean;
}[] = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A−", isRare: true },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B−", isRare: true },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−", isRare: true },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O−", isRare: true },
];

// ─── Config Niveaux de Stock (dynamique, dépend du thème) ─────────────────────
export const getStockLevelConfig = (
  colors: AppColors,
): Record<
  BloodStockLevel,
  {
    color: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }
> => ({
  CRITICAL: {
    color: colors.red,
    icon: "alert-circle-outline",
    label: "Critique",
  },
  LOW: { color: "#F97316", icon: "trending-down-outline", label: "Bas" },
  ADEQUATE: {
    color: colors.success,
    icon: "checkmark-circle-outline",
    label: "Adéquat",
  },
  SURPLUS: { color: "#3B82F6", icon: "add-circle-outline", label: "Surplus" },
});
