import { useAuthStore } from "@/src/store/auth.store";
import dayjs from "dayjs";

export const useIsEligible = () => {
  const profile = useAuthStore((state) => state.user?.jambaarsProfile);
  if (!profile) return { isEligible: true, daysLeft: 0, nextDate: null };

  const nextDate = profile.nextEligibilityAt ? new Date(profile.nextEligibilityAt) : null;
  const isEligible = !nextDate || nextDate <= new Date();
  
  const daysLeft = !isEligible && nextDate 
    ? dayjs(nextDate).diff(dayjs(), "day") 
    : 0;

  return { isEligible, daysLeft, nextDate };
};

// ─── Sélecteurs basiques ──────────────────────────────────────
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthIsLoading = () => useAuthStore((state) => state.isLoading);

// ─── Sélecteurs de Rôle (Parfaits pour le routing Expo) ────────
export const useUserRole = () => useAuthStore((state) => state.user?.role);

export const useIsDonor = () =>
  useAuthStore((state) => state.user?.role === "DONOR");

export const useIsHealthStructure = () =>
  useAuthStore((state) => state.user?.role === "HEALTH_STRUCTURE");

export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === "ADMIN");

// ─── Sélecteurs spécifiques Vita-Link ─────────────────────────
export const useUserStructureId = () =>
  useAuthStore((state) => state.user?.healthStructureId);

export const useUserBloodType = () =>
  useAuthStore((state) => state.user?.bloodType);

export const useUserJambaarProfile = () =>
  useAuthStore((state) => state.user?.jambaarsProfile);

// ─── Actions (Optionnel mais très propre) ─────────────────────
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setUser: state.setUser,
    updateUser: state.updateUser,
    logout: state.logout,
    initialize: state.initialize,
  }));
