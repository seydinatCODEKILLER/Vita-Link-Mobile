import { useState, useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { usersApi } from "@/src/api/users.api";
import { useAppStore } from "@/src/store/alerts.store";
import logger from "@/src/utils/logger.utils";
import { useRouter } from "expo-router";

// ─── Config globale Expo Notifications ───────────────────────
// À appeler une seule fois — idéalement dans app/_layout.tsx
// mais le mettre ici fonctionne aussi car le module est un singleton
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationsState {
  granted: boolean;
  expoPushToken: string | null;
  error: string | null;
}

export const useNotifications = () => {
  const router = useRouter();

  const [state, setState] = useState<NotificationsState>({
    granted: false,
    expoPushToken: null,
    error: null,
  });

  // ✅ Un ref par listener pour un cleanup propre
  const foregroundListenerRef = useRef<Notifications.Subscription | null>(null);
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  // ── Helper navigation depuis une notif ──
  const handleNavigation = useCallback(
    (data: Record<string, any>) => {
      if (data?.alertId) {
        setTimeout(() => {
          router.push(`/(donor)/alerts/${data.alertId}` as any);
        }, 500);
      }
    },
    [router],
  );

  // ── Demande permission + enregistrement token ──
  const requestAndRegister = useCallback(async () => {
    if (!Device.isDevice) {
      logger.warn("Push notifications non disponibles sur simulateur/Expo Go");
      setState((prev) => ({ ...prev, error: "Simulateur — push ignoré" }));
      return;
    }

    try {
      // Canal Android
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Vita-Link Alertes",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#DC1E1E",
          sound: "default",
        });
      }

      // Permission
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setState((prev) => ({
          ...prev,
          granted: false,
          error: "Permission notifications refusée",
        }));
        logger.warn("Permission push refusée");
        return;
      }

      setState((prev) => ({ ...prev, granted: true }));

      // Token Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      const token = tokenData.data;
      setState((prev) => ({ ...prev, expoPushToken: token }));

      // Sync backend — fire and forget
      usersApi
        .updateExpoToken(token)
        .then(() => logger.info("Expo push token synchronisé"))
        .catch((err) => logger.warn("Échec sync expo token", err));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message ?? "Erreur enregistrement notifications",
      }));
      logger.error("Erreur enregistrement push", err);
    }
  }, []);

  // ── Listeners foreground + tap ──
  const startForegroundListener = useCallback(() => {
    // ✅ Bug 1 corrigé : foreground listener séparé du response listener
    // Notification reçue pendant que l'app est OUVERTE → InAppAlert
    foregroundListenerRef.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body, data } = notification.request.content;

        logger.info("🔔 Notification foreground reçue", { title, data });

        // Pousser vers le store global → InAppAlert s'affiche dans le layout
        useAppStore.getState().setInAppAlert({
          id: notification.request.identifier,
          title: title ?? "Vita-Link",
          body: body ?? "",
          data: (data as Record<string, any>) ?? {},
          receivedAt: new Date(),
        });
      });

    // ✅ Bug 2 corrigé : response listener correctement assigné
    // Utilisateur tape sur la notification (app en BACKGROUND ou KILLED)
    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<
          string,
          any
        >;
        logger.info("👆 Notification tappée (background/killed)", { data });
        handleNavigation(data);
      });
  }, [handleNavigation]);

  // ── Cold Start : app totalement fermée, ouverte via notif ──
  useEffect(() => {
    const checkColdStart = async () => {
      try {
        const lastResponse =
          await Notifications.getLastNotificationResponseAsync();
        if (lastResponse) {
          const data = lastResponse.notification.request.content.data as Record<
            string,
            any
          >;
          logger.info("🧊 Cold Start via notification", { data });
          handleNavigation(data);
        }
      } catch (err) {
        logger.warn("Erreur vérification cold start notification", err);
      }
    };

    checkColdStart();
  }, [handleNavigation]);

  // ── Cleanup ──
  useEffect(() => {
    return () => {
      foregroundListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, []);

  return {
    ...state,
    requestAndRegister,
    startForegroundListener,
  };
};
