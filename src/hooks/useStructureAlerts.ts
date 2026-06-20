import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useInfiniteQuery } from "@tanstack/react-query";
import { alertsApi } from "@/src/api/alerts.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { Alert as AlertType } from "@/src/types/alert.types";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { FilterType } from "@/src/constants/alertsList";

/**
 * Centralise toute la logique de l'écran HealthAlertsScreen :
 * - query infinie paginée + filtre par statut
 * - navigation vers le détail
 * - garde "structure en attente" sur la création
 */
export function useStructureAlerts() {
  const router = useRouter();
  const isPending = useIsStructurePending();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.myAlerts, activeFilter],
    queryFn: ({ pageParam = 1 }) =>
      alertsApi.getMyStructure({
        page: pageParam,
        limit: 15,
        status: activeFilter === "ALL" ? undefined : activeFilter,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages)
        return lastPage.pagination.page + 1;
      return undefined;
    },
    staleTime: 15_000,
  });

  const alerts: AlertType[] = data?.pages.flatMap((p) => p.alerts) ?? [];

  const handleAlertPress = useCallback(
    (alertId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(health)/alerts/${alertId}/dashboard` as any);
    },
    [router],
  );

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCreate = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente de validation",
        "Votre structure n'est pas encore approuvée par nos équipes. Vous pourrez créer des alertes dès que votre dossier sera validé.",
        [{ text: "Compris", style: "default" }],
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/alerts/create" as any);
  };

  return {
    alerts,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
    activeFilter,
    handleFilterChange,
    handleAlertPress,
    handleCreate,
    isPending,
  };
}
