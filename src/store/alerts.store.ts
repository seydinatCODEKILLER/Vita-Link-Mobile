import { create } from "zustand";
import { Alert } from "@/src/types/alert.types";

// ─── Types pour les Modales & Alertes UI ────────────────────

export interface InAppAlertData {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  receivedAt: Date;
}

export interface JambaarCelebration {
  pointsEarned: number;
  message: string;
}

export interface BadgeUnlock {
  name: string;
  description: string;
  iconUrl?: string;
}

// ─── Interface du Store ─────────────────────────────────────

interface AlertState {
  // ── 1. État des Données (Liste & Engagement) ──
  alerts: Alert[];
  confirmedAlertId: string | null; // L'alerte pour laquelle j'ai dit "J'y vais"

  // ── 2. État de l'UI (Bannières & Modales) ──
  inAppAlert: InAppAlertData | null;
  jambaarCelebration: JambaarCelebration | null;
  badgeUnlock: BadgeUnlock | null;

  // ── Actions - Données ──
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  removeAlert: (alertId: string) => void;
  setConfirmedAlertId: (alertId: string | null) => void;

  // ── Actions - UI ──
  setInAppAlert: (alert: InAppAlertData | null) => void;
  setJambaarCelebration: (celebration: JambaarCelebration | null) => void;
  setBadgeUnlock: (badge: BadgeUnlock | null) => void;

  // ── Reset ──
  clearAlertStore: () => void;
}

const initialState = {
  alerts: [],
  confirmedAlertId: null,
  inAppAlert: null,
  jambaarCelebration: null,
  badgeUnlock: null,
};

export const useAlertStore = create<AlertState>((set, get) => ({
  ...initialState,

  // ──────────────────────────────────────────────────────────
  // ACTIONS - DONNÉES
  // ──────────────────────────────────────────────────────────

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) => {
    const currentAlerts = get().alerts;
    // Éviter les doublons (si le socket émet deux fois la même alerte)
    if (currentAlerts.some((a) => a.id === alert.id)) return;
    // Ajouter en tête de liste pour que la nouvelle alerte apparaisse en haut
    set({ alerts: [alert, ...currentAlerts] });
  },

  removeAlert: (alertId) => {
    set({ alerts: get().alerts.filter((a) => a.id !== alertId) });
  },

  setConfirmedAlertId: (alertId) => {
    set({ confirmedAlertId: alertId });
  },

  // ──────────────────────────────────────────────────────────
  // ACTIONS - UI
  // ──────────────────────────────────────────────────────────

  setInAppAlert: (alert) => set({ inAppAlert: alert }),
  setJambaarCelebration: (celebration) => set({ jambaarCelebration: celebration }),
  setBadgeUnlock: (badge) => set({ badgeUnlock: badge }),

  // ──────────────────────────────────────────────────────────
  // RESET (Ex: à la déconnexion)
  // ──────────────────────────────────────────────────────────

  clearAlertStore: () => set(initialState),
}));