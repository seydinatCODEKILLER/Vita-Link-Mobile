import { create } from "zustand";

// ✅ Type unifié pour les InAppAlerts (Socket ET Push Notifications)
export interface InAppAlertData {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>; // Obligatoire pour la navigation
  receivedAt: Date;          // ✅ AJOUTÉ pour le type InAppAlert
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

interface AppState {
  // InApp Alert (Bannière en haut)
  inAppAlert: InAppAlertData | null;
  setInAppAlert: (alert: InAppAlertData | null) => void;

  // Célébration Points Jambaar
  jambaarCelebration: JambaarCelebration | null;
  setJambaarCelebration: (celebration: JambaarCelebration | null) => void;

  // Déblocage Badge
  badgeUnlock: BadgeUnlock | null;
  setBadgeUnlock: (badge: BadgeUnlock | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  inAppAlert: null,
  setInAppAlert: (alert) => set({ inAppAlert: alert }),

  jambaarCelebration: null,
  setJambaarCelebration: (celebration) => set({ jambaarCelebration: celebration }),

  badgeUnlock: null,
  setBadgeUnlock: (badge) => set({ badgeUnlock: badge }),
}));