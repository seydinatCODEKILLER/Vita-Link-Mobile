import { useUserBloodType } from "@/src/hooks/useAuthStore";

/**
 * Retourne true si le donneur n'a pas renseigné son groupe sanguin.
 * Utilisé pour afficher la bannière d'incitation dans DonorHomeScreen.
 */
export const useBloodTypeBanner = () => {
  const bloodType = useUserBloodType();
  return { showBanner: !bloodType };
};