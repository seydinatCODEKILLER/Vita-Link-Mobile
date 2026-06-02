// blood-requests.schema.ts
import { z } from "zod";

export const createBloodRequestSchema = z.object({
  bloodType: z.enum(
    ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"],
    { message: "Sélectionnez un groupe" },
  ),
  quantityNeeded: z
    .number()
    .int()
    .min(1, "Min. 1 poche")
    .max(50, "Max. 50 poches"),
  urgencyLevel: z.enum(["VITAL", "STANDARD"], {
    message: "Sélectionnez l'urgence",
  }),
  serviceUnit: z
    .enum([
      "EMERGENCY_ROOM",
      "OPERATING_ROOM",
      "MATERNITY",
      "GENERAL",
      "PEDIATRICS",
    ])
    .optional(),
  clinicalContext: z.string().trim().max(500).optional(),
});

export type CreateBloodRequestFormValues = z.infer<
  typeof createBloodRequestSchema
>;
