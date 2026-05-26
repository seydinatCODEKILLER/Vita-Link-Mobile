import { z } from "zod";

export const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const dayStep1Schema = z.object({
  title: z.string().trim().min(5, "Titre trop court (min 5 caractères)"),
  description: z
    .string()
    .trim()
    .max(1000, "Description trop longue")
    .optional(),
});

export const dayStep2Schema = z.object({
  scheduledDate: z.string().min(1, "Date requise"),
  startTime: z.string().regex(timeRegex, "Format HH:MM requis (ex: 08:00)"),
  endTime: z.string().regex(timeRegex, "Format HH:MM requis (ex: 17:00)"),
  address: z.string().trim().min(5, "Adresse trop courte"),
});

export const dayStep3Schema = z.object({
  targetDonors: z
    .string()
    .regex(/^\d+$/, "Nombre invalide")
    .transform(Number)
    .refine((n) => n > 0, "L'objectif doit être supérieur à 0"),
  bloodTypesNeeded: z.array(z.string()).default([]),
});

// ✅ NOUVEAU : Schéma SANS transform, réservé à React Hook Form
export const dayStep3FormSchema = z.object({
  targetDonors: z
    .string()
    .regex(/^\d+$/, "Nombre invalide")
    .refine((n) => parseInt(n, 10) > 0, "L'objectif doit être supérieur à 0"),
  bloodTypesNeeded: z.array(z.string()).default([]),
});

// 🔹 Type utilisé UNIQUEMENT par React Hook Form
export type DayStep3FormValues = {
  targetDonors: string;
  bloodTypesNeeded: string[];
};

export type DayStep1Values = z.infer<typeof dayStep1Schema>;
export type DayStep2Values = z.infer<typeof dayStep2Schema>;
export type DayStep3Values = z.infer<typeof dayStep3Schema>;

export type CreateDayFormValues = DayStep1Values &
  DayStep2Values &
  DayStep3Values & { photoUri?: string | null };
