import { useState, useEffect, useRef, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { usersApi } from "@/src/api/users.api";
import { useAuthStore } from "@/src/store/auth.store";
import logger from "@/src/utils/logger.utils";

// ─── Config globale Expo Notifications ───────────────────────
// À appeler une seule fois au niveau app/_layout.tsx
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  data: Record<string, any>;
  receivedAt: Date;
}

interface NotificationsState {
  granted: boolean;
  expoPushToken: string | null;
  error: string | null;
  // Notifications reçues en foreground (pour InAppAlert)
  foregroundNotification: InAppNotification | null;
}

export const useNotifications = () => {
  const { updateUser } = useAuthStore();

  const [state, setState] = useState<NotificationsState>({
    granted: false,
    expoPushToken: null,
    error: null,
    foregroundNotification: null,
  });

  // Ref pour le listener foreground
  const notifListenerRef = useRef<Notifications.Subscription | null>(null);
  const responseListenerRef = useRef<Notifications.Subscription | null>(null);

  /**
   * Demande la permission push et enregistre le token Expo.
   * Appelé au montage du layout donneur.
   */
  const requestAndRegister = useCallback(async () => {
    // Les push ne fonctionnent pas sur simulateur
    if (!Device.isDevice) {
      logger.warn("Push notifications non disponibles sur simulateur");
      setState((prev) => ({ ...prev, error: "Simulateur — push ignoré" }));
      return;
    }

    try {
      // Android : créer le canal de notification
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Vita-Link Alertes",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#DC1E1E",
          sound: "default",
        });
      }

      // Vérifier / demander la permission
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

      // Récupérer le token Expo
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });

      const token = tokenData.data;
      setState((prev) => ({ ...prev, expoPushToken: token }));

      // Envoyer au backend — fire and forget
      usersApi
        .updateExpoToken(token)
        .then(() => {
          logger.info("Expo push token synchronisé");
        })
        .catch((err) => {
          logger.warn("Échec sync expo token", err);
        });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message ?? "Erreur enregistrement notifications",
      }));
      logger.error("Erreur enregistrement push", err);
    }
  }, []);

  /**
   * Écoute les notifications reçues en foreground (app ouverte).
   * Déclenche l'affichage d'une InAppAlert dans le layout.
   */
  const startForegroundListener = useCallback(() => {
    // Listener : notification reçue pendant que l'app est ouverte
    notifListenerRef.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body, data } = notification.request.content;

        const inApp: InAppNotification = {
          id: notification.request.identifier,
          title: title ?? "Vita-Link",
          body: body ?? "",
          data: (data as Record<string, any>) ?? {},
          receivedAt: new Date(),
        };

        setState((prev) => ({ ...prev, foregroundNotification: inApp }));
        logger.info("Notification foreground reçue", { title, data });
      },
    );

    // Listener : l'utilisateur tape sur la notification (background/killed)
    responseListenerRef.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as Record<
          string,
          any
        >;
        logger.info("Notification tappée", { data });
        // La navigation est gérée dans le layout via le data.type
        // Ex: data.type === "ALERT_NEW" → naviguer vers alerts/[id]
      });
  }, []);

  const clearForegroundNotification = useCallback(() => {
    setState((prev) => ({ ...prev, foregroundNotification: null }));
  }, []);

  // Cleanup listeners
  useEffect(() => {
    return () => {
      notifListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, []);

  return {
    ...state,
    requestAndRegister,
    startForegroundListener,
    clearForegroundNotification,
  };
};
