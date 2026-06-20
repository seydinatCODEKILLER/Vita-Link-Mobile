// ─── Onglets principaux (tab bar) ────────────────────────────────────────────
export const PRIMARY_TABS = [
  {
    name: "index",
    label: "Dashboard",
    icon: "grid" as const,
    iconOutline: "grid-outline" as const,
  },
  {
    name: "blood-requests/index",
    label: "Demandes",
    icon: "document-text" as const,
    iconOutline: "document-text-outline" as const,
  },
  {
    name: "scan",
    label: "Scanner",
    icon: "qr-code" as const,
    iconOutline: "qr-code-outline" as const,
  },
  {
    name: "stock",
    label: "Stock Sang",
    icon: "water" as const,
    iconOutline: "water-outline" as const,
  },
] as const;

// ─── Onglets secondaires (bottom sheet "Plus") ────────────────────────────────
export const SECONDARY_TABS = [
  {
    name: "alerts",
    label: "Alertes Pénurie",
    icon: "medkit" as const,
    route: "/(health)/alerts" as const,
    description: "Gérer les alertes de stock critique",
    color: "#FF6B6B",
    shortcut: "⌘A",
  },
  {
    name: "purchase-orders",
    label: "Bons de Commande",
    icon: "receipt" as const,
    route: "/(health)/purchase-orders" as const,
    description: "Suivre les retraits de sang des hôpitaux",
    color: "#4ECDC4",
    shortcut: "⌘B",
  },
  {
    name: "journees",
    label: "Journées de Don",
    icon: "calendar" as const,
    route: "/(health)/journees" as const,
    description: "Planifiez vos collectes",
    color: "#FFD93D",
    shortcut: "⌘J",
  },
  {
    name: "my-structure",
    label: "Ma Structure",
    icon: "settings" as const,
    route: "/(health)/profile" as const,
    description: "Paramètres CNTS & Agents",
    color: "#6C5CE7",
    shortcut: "⌘S",
  },
] as const;

export type SecondaryTab = (typeof SECONDARY_TABS)[number];
export type PrimaryTab = (typeof PRIMARY_TABS)[number];
