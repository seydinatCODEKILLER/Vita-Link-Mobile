import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useMyStructureDays } from "@/src/hooks/useDonationDays";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { isNetworkError } from "@/src/utils/error.utils";
import { DonationDay } from "@/src/types/donation-day.types";

export function useDonationDaysScreen() {
  const router = useRouter();
  const isPending = useIsStructurePending();
  const [activeFilter, setActiveFilter] = useState<string>("PUBLISHED");

  const { data, isLoading, isRefetching, refetch, isError, error } =
    useMyStructureDays({ status: activeFilter as any });

  const days: DonationDay[] = data?.data ?? [];

  const handleCreate = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente de validation",
        "Votre structure n'est pas encore approuvée par nos équipes. Vous pourrez créer des journées dès que votre dossier sera validé.",
        [{ text: "Compris", style: "default" }],
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/journees/create");
  };

  const handlePressCard = (id: string) => {
    router.push(`/(health)/journees/${id}?from=journees`);
  };

  const hasNetworkError = isError && !days.length && isNetworkError(error);

  return {
    isPending,
    activeFilter,
    setActiveFilter,
    days,
    isLoading,
    isRefetching,
    refetch,
    isError,
    hasNetworkError,
    handleCreate,
    handlePressCard,
  };
}
