import { z } from "zod";

export const editProfileSchema = z.object({
  firstName: z.string().min(2, "Min. 2 caractères"),
  lastName: z.string().min(2, "Min. 2 caractères"),

  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),

  bloodType: z.enum([
    "A_POS",
    "A_NEG",
    "B_POS",
    "B_NEG",
    "AB_POS",
    "AB_NEG",
    "O_POS",
    "O_NEG",
  ]),

  dateOfBirth: z.string().optional().nullable(),
});

export type EditProfileValues = z.infer<typeof editProfileSchema>;