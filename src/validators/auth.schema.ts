import { z } from "zod";

export const bloodTypeValues = [
  "A_POS",
  "A_NEG",
  "B_POS",
  "B_NEG",
  "AB_POS",
  "AB_NEG",
  "O_POS",
  "O_NEG",
] as const;

export const SENEGAL_REGIONS = [
  "Dakar",
  "Diourbel",
  "Fatick",
  "Kaffrine",
  "Kaolack",
  "Kédougou",
  "Kolda",
  "Louga",
  "Matam",
  "Sédhiou",
  "Saint-Louis",
  "Tambacounda",
  "Thiès",
  "Ziguinchor",
] as const;

export const phoneRegex = /^\+?[1-9]\d{7,14}$/;

// ─── Register Donor ───────────────────────────────────────────

export const donorStep1Schema = z.object({
  firstName: z.string().trim().min(2, "Prénom trop court (min 2 caractères)"),
  lastName: z.string().trim().min(2, "Nom trop court (min 2 caractères)"),
  gender: z.enum(["MALE", "FEMALE"], { message: "Sélectionnez votre genre" }),
});

export const donorStep2Schema = z.object({
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro invalide (ex: +221771234567)"),
  email: z.string().trim().email("Adresse email invalide"),
});

export const donorStep3Schema = z.object({
  bloodType: z.enum(bloodTypeValues as any, {
    message: "Sélectionnez votre groupe sanguin",
  }),
  dateOfBirth: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), "Date invalide"),
});

export type DonorStep1Values = z.infer<typeof donorStep1Schema>;
export type DonorStep2Values = z.infer<typeof donorStep2Schema>;
export type DonorStep3Values = z.infer<typeof donorStep3Schema>;
export type RegisterDonorFormValues = DonorStep1Values &
  DonorStep2Values &
  DonorStep3Values;

// ─── OTP ──────────────────────────────────────────────────────

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Le code ne doit contenir que des chiffres"),
});

export type OtpValues = z.infer<typeof otpSchema>;

// ─── Login ────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// ─── Register Structure — Step 1 ──────────────────────────────

export const structureStep1Schema = z
  .object({
    firstName: z.string().trim().min(2, "Prénom trop court"),
    lastName: z.string().trim().min(2, "Nom trop court"),
    email: z.string().trim().email("Email invalide"),
    phone: z.string().trim().regex(phoneRegex, "Numéro invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string().min(1, "Confirmez le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ─── Register Structure — Step 2 ──────────────────────────────
// ✅ AJOUT : latitude + longitude obligatoires

export const structureStep2Schema = z.object({
  structureName: z.string().trim().min(3, "Nom de structure trop court"),
  registrationNumber: z
    .string()
    .trim()
    .min(3, "Numéro d'enregistrement invalide"),
  address: z.string().trim().min(5, "Adresse trop courte"),
  region: z.enum(SENEGAL_REGIONS, {
    message: "Veuillez sélectionner une région",
  }),

  latitude: z.number({ message: "Localisez votre structure pour continuer" }),
  longitude: z.number({ message: "Localisez votre structure pour continuer" }),

  structurePhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro invalide")
    .optional()
    .or(z.literal("")),
  structureEmail: z
    .string()
    .trim()
    .email("Email invalide")
    .optional()
    .or(z.literal("")),
});

export type StructureStep1Values = z.infer<typeof structureStep1Schema>;
export type StructureStep2Values = z.infer<typeof structureStep2Schema>;
export type RegisterStructureFormValues = StructureStep1Values &
  StructureStep2Values;
