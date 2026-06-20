import { useEffect, useRef } from "react";
import { Alert, Animated } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";

/**
 * Centralise la logique comportementale du CntsDashboardScreen :
 * - animations d'entrée (FAB + fade)
 * - action "Créer alerte" avec garde pending
 */
export function useDashboardScreen() {
  const router = useRouter();
  const isPending = useIsStructurePending();

  const fabScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCreateAlert = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente",
        "Votre CNTS n'est pas encore approuvée. Vous pourrez créer des alertes dès validation.",
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/alerts/create?from=dashboard" as any);
  };

  return { fabScale, fadeAnim, handleCreateAlert };
}
