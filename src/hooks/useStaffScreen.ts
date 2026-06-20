import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/src/store/auth.store";
import { useMyStaff, useRemoveStaff } from "@/src/hooks/useStaff";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { isNetworkError } from "@/src/utils/error.utils";

export function useStaffScreen() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const isPending = useIsStructurePending();

  const goBack = useSmartBack({
    defaultRoute: "/(health)/profile",
    routeMap: { profile: "/(health)/profile", dashboard: "/(health)" },
  });

  const { data: staff, isLoading, isError, error, refetch } = useMyStaff();
  const { mutateAsync: removeStaff } = useRemoveStaff();

  const hasNetworkError = isError && isNetworkError(error);
  const isDirector = currentUser?.isStructureAdmin ?? false;

  const directors = staff?.filter((m) => m.isStructureAdmin) ?? [];
  const agents = staff?.filter((m) => !m.isStructureAdmin) ?? [];

  const handleDeleteStaff = (userId: string, name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Retirer cet agent ?",
      `Voulez-vous vraiment retirer ${name} de votre structure ? Il perdra l'accès au tableau de bord médical.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Retirer",
          style: "destructive",
          onPress: async () => {
            try {
              await removeStaff(userId);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            } catch (error: any) {
              Alert.alert(
                "Erreur",
                error?.response?.data?.message ||
                  "Impossible de retirer cet agent.",
              );
            }
          },
        },
      ],
    );
  };

  const handleAddStaff = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente de validation",
        "Votre structure doit être approuvée par nos équipes avant de pouvoir ajouter des agents.",
        [{ text: "Compris", style: "default" }],
      );
      return;
    }
    router.push("/(health)/staff/add?from=staff" as any);
  };

  return {
    goBack,
    staff,
    isLoading,
    isError,
    hasNetworkError,
    refetch,
    isPending,
    isDirector,
    directors,
    agents,
    handleDeleteStaff,
    handleAddStaff,
  };
}
