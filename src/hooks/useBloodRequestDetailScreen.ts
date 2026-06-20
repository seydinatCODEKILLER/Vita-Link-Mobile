import { useEffect, useRef, useState } from "react";
import { Animated, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import {
  useBloodRequestDetail,
  useCancelBloodRequest,
} from "@/src/hooks/useBloodRequests";
import { useIsCnts } from "@/src/hooks/useAuthStore";
import { isNetworkError } from "@/src/utils/error.utils";

export function useBloodRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isCnts = useIsCnts();
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const goBack = useSmartBack({
    defaultRoute: "/(health)/blood-requests",
    routeMap: {
      list: "/(health)/blood-requests",
      dashboard: "/(health)",
    },
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useBloodRequestDetail(id);
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelBloodRequest();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Annuler la demande ?", "Cette action est irréversible.", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui, annuler",
        style: "destructive",
        onPress: async () => {
          await cancelRequest(id);
          router.back();
        },
      },
    ]);
  };

  const handleOpenSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSheetVisible(true);
  };

  // Dérivés
  const hasNetworkError = isError && isNetworkError(error) && !request;
  const isNotFound = isError && !request;
  const showSkeleton = isLoading && !request;

  const isPending = request?.status === "PENDING";
  const canHandle = isCnts && isPending;
  const isVital = request?.urgencyLevel === "VITAL";

  const progressPct = request
    ? request.quantityProvided > 0
      ? Math.min(
          Math.round((request.quantityProvided / request.quantityNeeded) * 100),
          100,
        )
      : 0
    : 0;

  return {
    id,
    isCnts,
    isSheetVisible,
    setIsSheetVisible,
    goBack,
    fadeAnim,
    request,
    refetch,
    isCancelling,
    handleCancel,
    handleOpenSheet,
    hasNetworkError,
    isNotFound,
    showSkeleton,
    canHandle,
    isVital,
    isPending,
    progressPct,
  };
}
