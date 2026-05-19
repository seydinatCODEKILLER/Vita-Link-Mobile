import { z } from "zod";
import {
  BloodTypeEnum,
  ServiceUnitEnum,
  UrgencyLevelEnum,
} from "../types/shared.types";

// ─── Schéma Création Alerte ────────────────────────────────────
export const createAlertSchema = z.object({
  bloodType: z.nativeEnum(BloodTypeEnum, {
    error: "Le groupe sanguin est requis",
  }),
  urgencyLevel: z.nativeEnum(UrgencyLevelEnum, {
    error: "Le niveau d'urgence est requis",
  }),
  quantityNeeded: z.coerce
    .number()
    .min(1, "Minimum 1 donneur requis")
    .max(20, "Maximum 20 donneurs par alerte"),
  serviceUnit: z.nativeEnum(ServiceUnitEnum).optional(),
  radiusKm: z.number().min(1).max(50),
});

export type CreateAlertFormValues = z.infer<typeof createAlertSchema>;
