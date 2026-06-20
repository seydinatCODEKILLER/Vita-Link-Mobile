import { useEffect, useMemo, useRef } from "react";
import { Animated } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/src/theme/useTheme";

export function usePendingReviewScreen() {
  const router = useRouter();
  const colors = useColors();

  // ── Animations d'entrée ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Données de la Timeline ──
  // ✅ useMemo évite de recréer le tableau et les couleurs à chaque re-rendu
  const STEPS_INFO = useMemo(
    () => [
      {
        icon: "checkmark-circle-outline" as const,
        color: colors.success,
        label: "Demande soumise",
        done: true,
      },
      {
        icon: "search-outline" as const,
        color: colors.amber,
        label: "Vérification en cours (24-48h)",
        done: false,
      },
      {
        icon: "shield-checkmark-outline" as const,
        color: colors.textSubtle,
        label: "Accès activé",
        done: false,
      },
    ],
    [colors.success, colors.amber, colors.textSubtle],
  );

  // ── Actions ──
  const goToLogin = () => router.replace("/(auth)/login");
  const goToWelcome = () => router.replace("/(auth)/welcome");

  return {
    fadeAnim,
    scaleAnim,
    slideAnim,
    STEPS_INFO,
    goToLogin,
    goToWelcome,
  };
}
