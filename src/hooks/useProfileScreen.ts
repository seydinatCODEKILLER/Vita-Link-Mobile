import { useEffect, useRef } from "react";
import { Alert, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { useLogout } from "@/src/hooks/useAuth";

/**
 * Centralise la logique comportementale du HealthProfileScreen :
 * - animations d'entrée (fade + slide)
 * - confirmation et action de déconnexion
 */
export function useProfileScreen() {
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
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

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter de Vita-Link ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: () => logout() },
    ]);
  };

  return { fadeAnim, slideAnim, isLoggingOut, handleLogout };
}
