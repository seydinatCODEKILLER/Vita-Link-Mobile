import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import { useAlert } from "@/src/hooks/useAlerts";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { isNetworkError } from "@/src/utils/error.utils";
import { useColors } from "@/src/theme/useTheme";

/**
 * Centralise la logique comportementale de AlertDetailScreen :
 * - animations d'entrée (fade + slide)
 * - dérivés calculés depuis l'alerte
 * - navigation vers le dashboard
 */
export function useAlertDetailScreen(alertId: string) {
  const router = useRouter();
  const colors = useColors();

  const { data: alert, isLoading, isError, error, refetch } = useAlert(alertId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoToDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(health)/alerts/${alertId}/dashboard?from=detail` as any);
  };

  // ── Dérivés calculés ────────────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

  const isVital = alert?.urgencyLevel === "VITAL";
  const isActive = alert?.status === "ACTIVE";
  const isExpired = alert?.status === "EXPIRED";

  const bloodLabel = alert
    ? (BLOOD_TYPE_LABELS[alert.bloodType] ??
      alert.bloodType.replaceAll("_", ""))
    : "";

  const formattedExpiresAt = alert?.expiresAt
    ? dayjs(alert.expiresAt).format("HH:mm")
    : "—";

  const progressPct = alert
    ? Math.min((alert.quantityConfirmed / alert.quantityNeeded) * 100, 100)
    : 0;

  const statusColor = isActive
    ? colors.success
    : isExpired
      ? colors.amber
      : colors.textMuted;

  return {
    // Data
    alert,
    isLoading,
    hasNetworkError,
    refetch,
    // Animations
    fadeAnim,
    slideAnim,
    // Dérivés
    isVital,
    isActive,
    isExpired,
    bloodLabel,
    formattedExpiresAt,
    progressPct,
    statusColor,
    // Actions
    handleGoToDashboard,
  };
}
