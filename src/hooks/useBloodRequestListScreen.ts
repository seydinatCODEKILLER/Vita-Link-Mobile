import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useBloodRequests } from "@/src/hooks/useBloodRequests";
import { useIsCnts } from "@/src/hooks/useAuthStore";
import { isNetworkError } from "@/src/utils/error.utils";
import { BloodRequestStatus } from "@/src/types/shared.types";

export function useBloodRequestListScreen() {
  const router = useRouter();
  const isCnts = useIsCnts();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useBloodRequests({
      status:
        activeFilter === "ALL"
          ? undefined
          : (activeFilter as BloodRequestStatus),
    });

  const requests = data?.requests ?? [];

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(health)/blood-requests/${id}?from=list`);
  };

  const handleFilterPress = (key: string, disabled: boolean) => {
    if (disabled) return;
    setActiveFilter(key);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const hasNetworkError = isError && isNetworkError(error) && !requests.length;
  const showSkeleton = isLoading && !requests.length;

  return {
    isCnts,
    activeFilter,
    fadeAnim,
    requests,
    isRefetching,
    refetch,
    hasNetworkError,
    showSkeleton,
    handlePress,
    handleFilterPress,
  };
}
