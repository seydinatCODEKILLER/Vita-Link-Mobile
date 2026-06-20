export const BLOOD_TYPES = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A−" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B−" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O−" },
] as const;

// Les couleurs d'urgence restent partiellement statiques
// car elles sont fixes par design (rouge = vital, amber = standard)
export const URGENCY_LEVELS = [
  { value: "VITAL", label: "Vital", icon: "flash" as const },
  { value: "STANDARD", label: "Standard", icon: "time-outline" as const },
] as const;

export const SERVICE_UNITS = [
  { value: "EMERGENCY_ROOM", label: "Urgences" },
  { value: "OPERATING_ROOM", label: "Bloc op." },
  { value: "MATERNITY", label: "Maternité" },
  { value: "GENERAL", label: "Général" },
  { value: "PEDIATRICS", label: "Pédiatrie" },
] as const;
