import { useEffect, useRef } from "react";
import { Alert, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { useAlertResponses, useCloseAlert } from "@/src/hooks/useAlerts";
import { useSocket } from "@/src/hooks/useSocket";
import { useColors } from "@/src/theme/useTheme";
import { isNetworkError } from "@/src/utils/error.utils";

/**
 * Centralise la logique comportementale de AlertDashboardScreen :
 * - animation d'entrée (fade)
 * - gestion socket (join/leave room)
 * - fermeture de l'alerte (confirmation + mutation)
 * - dérivés calculés depuis l'alerte
 */
export function useAlertDashboardScreen() {
  const { id: alertId } = useLocalSearchParams<{ id: string }>();
  const { socketRef } = useSocket();
  const colors = useColors();

  const goBack = useSmartBack({
    defaultRoute: "/(health)/alerts",
    routeMap: {
      alerts: "/(health)/alerts",
      detail: `/(health)/alerts/${alertId}`,
      dashboard: "/(health)",
    },
  });

  const { data, isLoading, isError, error, refetch } =
    useAlertResponses(alertId);
  const { mutateAsync: closeAlert, isPending: isClosing } = useCloseAlert();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Animation d'entrée ──────────────────────────────────────
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // ── Socket : rejoindre / quitter la room alerte ─────────────
  useEffect(() => {
    if (!alertId || !socketRef.current?.connected) return;
    const socket = socketRef.current;
    socket.emit("join:alert", { alertId });
    return () => {
      socket.emit("leave:alert", { alertId });
    };
  }, [alertId, socketRef]);

  // ── Fermeture de l'alerte ───────────────────────────────────
  const handleCloseAlert = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Fermer l'alerte ?",
      "Le quota est-il atteint ou l'urgence est-elle résolue ? Les donneurs en route seront notifiés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Fermer",
          style: "destructive",
          onPress: async () => {
            try {
              await closeAlert(alertId);
              goBack();
            } catch {
              Alert.alert("Erreur", "Impossible de fermer l'alerte.");
            }
          },
        },
      ],
    );
  };

  // ── Dérivés ─────────────────────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

  const alert = data?.alert;
  const isVital = alert?.urgencyLevel === "VITAL";
  const isActive = alert?.status === "ACTIVE";
  const closedColor =
    alert?.status === "EXPIRED" ? colors.amber : colors.success;

  return {
    alertId,
    data,
    isLoading,
    isError,
    hasNetworkError,
    refetch,
    isClosing,
    fadeAnim,
    goBack,
    handleCloseAlert,
    // Dérivés
    isVital,
    isActive,
    closedColor,
  };
}
