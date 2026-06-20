import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/src/store/auth.store";
import { useAlertStore } from "@/src/store/alerts.store";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useLocation } from "@/src/hooks/useLocation";
import { useSocket } from "@/src/hooks/useSocket";
import logger from "@/src/utils/logger.utils";

/**
 * Centralise toute la logique du HealthLayout :
 * - guard d'authentification et de rôle
 * - initialisation des permissions (location, notifications, socket)
 * - calculs de hauteur de la tab bar
 */
export function useHealthLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated } = useAuthStore();
  const inAppAlert = useAlertStore((s) => s.inAppAlert);
  const setInAppAlert = useAlertStore((s) => s.setInAppAlert);

  const { requestAndRegister, startForegroundListener } = useNotifications();
  const { requestAndSync: syncLocation } = useLocation();

  useSocket();

  // ── Guard rôle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/(auth)/welcome");
      return;
    }
    if (user.role === "CNTS_ADMIN" || user.role === "CNTS_AGENT") {
      router.replace("/(health)");
    } else if (user.role === "HOSPITAL_AGENT") {
      router.replace("/(hospital)");
    } else {
      router.replace("/unauthorized");
    }
  }, [isAuthenticated, user]);

  // ── Init permissions (une seule fois) ───────────────────────────────────────
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!user || hasInitialized.current) return;
    hasInitialized.current = true;
    logger.info("Initialisation permissions structure de santé...");

    const init = async () => {
      syncLocation();
      await requestAndRegister();
      startForegroundListener();
      logger.info("Permissions structure initialisées");
    };

    init();
  }, [user?.id]);

  // ── Calculs insets ───────────────────────────────────────────────────────────
  const safeBottom = Platform.select({
    ios: insets.bottom,
    android: insets.bottom > 0 ? insets.bottom + 8 : 28,
    default: 8,
  });
  const tabBarHeight = 64 + (safeBottom ?? 0);

  const isCntsUser = user?.role === "CNTS_ADMIN" || user?.role === "CNTS_AGENT";

  return {
    user,
    isAuthenticated,
    isCntsUser,
    inAppAlert,
    setInAppAlert,
    safeBottom: safeBottom ?? 0,
    tabBarHeight,
  };
}
