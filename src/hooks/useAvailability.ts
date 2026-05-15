import { useMutation } from "@tanstack/react-query";
import { usersApi } from "@/src/api/users.api";
import { useAuthStore } from "@/src/store/auth.store";

export const useUpdateAvailability = () => {
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (isAvailable: boolean) =>
      usersApi.updateAvailability(isAvailable),
    onSuccess: (_, isAvailable) => {
      // Mise à jour optimiste du store local
      updateUser({ isAvailable });
    },
    onError: () => {
      // En cas d'erreur, on pourrait afficher un toast,
      // le toggle reviendra à sa position initiale grâce au store
    },
  });
};
