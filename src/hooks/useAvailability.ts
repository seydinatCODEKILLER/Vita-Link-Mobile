import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/src/api/users.api";
import { useAuthStore } from "@/src/store/auth.store";
import Toast from "react-native-toast-message";

export const useUpdateAvailability = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    // L'API renvoie Promise<{ id: string; isAvailable: boolean }>
    mutationFn: (isAvailable: boolean) =>
      usersApi.updateAvailability(isAvailable),

    // ── 1. AVANT la requête (Optimisme) ──────────────────
    onMutate: async (newAvailability) => {
      await queryClient.cancelQueries({ queryKey: ["currentUser"] });
      const previousUser = user;

      // Mise à jour optimiste de Zustand (L'UI bouge instantanément)
      if (user) {
        await updateUser({ isAvailable: newAvailability });
      }

      return { previousUser };
    },

    // ── 2. SI ÇA RÉUSSIT ──────────────────────────────────
    onSuccess: (data) => {
      // 🛑 CORRECTION ICI : 'data' correspond directement à { id, isAvailable }
      // Pas besoin de data.user
      if (data?.isAvailable !== undefined) {
        updateUser({ isAvailable: data.isAvailable });
      }
      
      queryClient.invalidateQueries({ queryKey: ["nearbyAlerts"] });
    },

    // ── 3. SI ÇA ÉCHOUE (Rollback) ───────────────────────
    onError: (error, newAvailability, context) => {
      if (context?.previousUser) {
        updateUser(context.previousUser);
      }

      Toast.show({
        type: "error",
        text1: "Mise à jour impossible",
        text2: "Vérifiez votre connexion et réessayez.",
      });
    },

    // ── 4. TOUJOURS À LA FIN ──────────────────────────────
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};