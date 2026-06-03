import { useAuthStore } from "@/src/store/auth.store";
// ─── Sélecteurs basiques ──────────────────────────────────────
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useAuthIsLoading = () => useAuthStore((state) => state.isLoading);

// ─── Sélecteurs de Rôle (Parfaits pour le routing Expo) ────────
export const useUserRole = () => useAuthStore((state) => state.user?.role);

export const useIsAdmin = () =>
  useAuthStore((state) => state.user?.role === "ADMIN");

// ─── Sélecteurs spécifiques Vita-Link ─────────────────────────
export const useUserStructureId = () =>
  useAuthStore((state) => state.user?.healthStructureId);

export const useUserBloodType = () =>
  useAuthStore((state) => state.user?.bloodType);

export const useUserJambaarProfile = () =>
  useAuthStore((state) => state.user?.jambaarsProfile);

// Remplace l'ancien useIsHealthStructure par ceux-ci :
export const useIsCnts = () =>
  useAuthStore((state) => state.user?.role === "CNTS_AGENT" || state.user?.role === "CNTS_ADMIN");

export const useIsHospital = () =>
  useAuthStore((state) => state.user?.role === "HOSPITAL_AGENT");

// Pour la redirection à la racine, tu peux faire un hook générique :
export const useIsHealthProfessional = () =>
  useAuthStore((state) => 
    state.user?.role === "CNTS_AGENT" || 
    state.user?.role === "CNTS_ADMIN" || 
    state.user?.role === "HOSPITAL_AGENT"
  );

// ─── Actions (Optionnel mais très propre) ─────────────────────
export const useAuthActions = () =>
  useAuthStore((state) => ({
    setUser: state.setUser,
    updateUser: state.updateUser,
    logout: state.logout,
    initialize: state.initialize,
  }));
