import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth.store";
import { tokenManager } from "@/src/utils/token.utils";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { Alert } from "@/src/types/alert.types";
import logger from "@/src/utils/logger.utils";
import { useAlertStore } from "../store/alerts.store";

export const useSocket = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  // ✅ AJOUT : On récupère les actions de données (addAlert, removeAlert)
  // en plus des actions d'UI
  const {
    setInAppAlert,
    setJambaarCelebration,
    setBadgeUnlock,
    addAlert,
    removeAlert,
  } = useAlertStore();

  const socketRef = useRef<Socket | null>(null);
  const isConnecting = useRef(false);

  const connect = useCallback(async () => {
    if (!user) return;

    if (socketRef.current?.connected) return;
    if (isConnecting.current) return;

    const socketUrl = Constants.expoConfig?.extra?.socketUrl;
    if (!socketUrl) {
      logger.warn("SOCKET_URL non définie dans app.config.ts");
      return;
    }

    const token = await tokenManager.getAccessToken();
    if (!token) return;

    logger.info("🔍 Socket URL utilisée :", socketUrl);
    logger.info("🔍 Token disponible :", !!token);

    isConnecting.current = true;
    logger.info("🔌 Connexion Socket.io en cours...");

    const socket = io(socketUrl, {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    // ── Événements de connexion ──────────────────────────────

    socket.on("connect", () => {
      isConnecting.current = false;
      logger.info(
        "✅ Socket.io connecté — transport :",
        socket.io.engine.transport.name,
      );
    });

    socket.on("disconnect", (reason) => {
      logger.warn("🔌 Socket.io déconnecté :", reason);
    });

    socket.on("connect_error", (err) => {
      isConnecting.current = false;
      logger.error("❌ Socket.io erreur de connexion :", err.message);
    });

    // ── 1. NOUVELLE ALERTE ───────────────────────────────────
    socket.on("alert:new", (data: Alert) => {
      logger.info("🚨 Nouvelle alerte reçue via Socket :", data.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      setInAppAlert({
        id: data.id,
        title:
          data.urgencyLevel === "VITAL"
            ? "🚨 URGENCE VITALE"
            : "🩸 Alerte donneur",
        body: `Groupe ${data.bloodType} requis — ${data.healthStructure?.name}`,
        data: { alertId: data.id, urgencyLevel: data.urgencyLevel },
        receivedAt: new Date(),
      });

      // ✅ MODIFICATION : On utilise l'action Zustand pour une maj UI instantanée
      // (Le store gère déjà la déduplication)
      addAlert(data);

      // On déclenche un refetch en arrière-plan pour resync avec la BDD
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    });

    // ── 2. DON VALIDÉ ────────────────────────────────────────
    socket.on("donation:validated", (data: { pointsAwarded: number }) => {
      logger.info("🎉 Don validé, points crédités :", data.pointsAwarded);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const currentUser = useAuthStore.getState().user;
      if (currentUser?.jambaarsProfile) {
        updateUser({
          jambaarsProfile: {
            ...currentUser.jambaarsProfile,
            totalPoints:
              currentUser.jambaarsProfile.totalPoints + data.pointsAwarded,
            donationCount: currentUser.jambaarsProfile.donationCount + 1,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myDonations });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarsProfile });

      setJambaarCelebration({
        pointsEarned: data.pointsAwarded,
        message: "Votre don a été validé !",
      });
    });

    // ── 3. BADGE DÉBLOQUÉ ────────────────────────────────────
    socket.on(
      "badges:earned",
      (data: { name: string; description: string; iconUrl?: string }) => {
        logger.info("🏅 Badge débloqué :", data.name);

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setBadgeUnlock({
          name: data.name,
          description: data.description,
          iconUrl: data.iconUrl,
        });

        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarssBadges });
      },
    );

    // ── 4. QUOTA ATTEINT ─────────────────────────────────────
    socket.on("alert:quota_reached", (data: { alertId: string }) => {
      logger.info("🎯 Quota atteint pour l'alerte :", data.alertId);

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alert(data.alertId),
      });
    });

    // ── 5. ALERTE FERMÉE ─────────────────────────────────────
    socket.on("alert:closed", (data: { alertId: string; status: string }) => {
      logger.info("🔒 Alerte fermée :", data.alertId);

      // ✅ MODIFICATION : On utilise l'action Zustand pour une suppression UI instantanée
      removeAlert(data.alertId);

      // Et on resync le cache React Query en arrière-plan
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alert(data.alertId),
      });
    });

    socketRef.current = socket;
  }, [
    user?.id,
    queryClient,
    updateUser,
    setInAppAlert,
    setJambaarCelebration,
    setBadgeUnlock,
    addAlert, // ✅ AJOUT : Ajout des nouvelles dépendances
    removeAlert, // ✅ AJOUT : pour le callback
  ]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnecting.current = false;
      logger.info("🔌 Socket.io déconnecté manuellement");
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { disconnect };
};
