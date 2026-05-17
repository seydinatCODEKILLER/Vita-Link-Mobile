import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth.store";
import { useAppStore } from "@/src/store/alerts.store";
import { tokenManager } from "@/src/utils/token.utils";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { Alert } from "@/src/types/alert.types";
import logger from "@/src/utils/logger.utils";

export const useSocket = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { setInAppAlert, setJambaarCelebration, setBadgeUnlock } =
    useAppStore();

  const socketRef = useRef<Socket | null>(null);
  const isConnecting = useRef(false); // ✅ Guard anti-double connexion

  const connect = useCallback(async () => {
    if (!user) return;

    // ✅ Empêche les connexions simultanées
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
      // ✅ FIX PRINCIPAL : polling d'abord → upgrade auto vers websocket
      // Forcer "websocket" seul échoue sur réseau local sans handshake HTTP
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
      isConnecting.current = false; // ✅ Reset pour permettre retry
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

      // Ajouter l'alerte en tête de liste sans refetch
      queryClient.setQueryData<Alert[]>(QUERY_KEYS.nearbyAlerts, (oldData) => {
        if (!oldData) return [data];
        if (oldData.some((a) => a.id === data.id)) return oldData;
        return [data, ...oldData];
      });
    });

    // ── 2. DON VALIDÉ ────────────────────────────────────────
    socket.on("donation:validated", (data: { pointsAwarded: number }) => {
      logger.info("🎉 Don validé, points crédités :", data.pointsAwarded);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Mise à jour optimiste du profil Jambaar dans le store
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

      // Invalider les queries pour forcer un refetch propre
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

      // Mettre à jour la liste + le détail de l'alerte
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alert(data.alertId),
      });
    });

    // ── 5. ALERTE FERMÉE ─────────────────────────────────────
    socket.on("alert:closed", (data: { alertId: string; status: string }) => {
      logger.info("🔒 Alerte fermée :", data.alertId);

      // Retirer l'alerte de la liste locale immédiatement
      queryClient.setQueryData<Alert[]>(
        QUERY_KEYS.nearbyAlerts,
        (oldData) => oldData?.filter((a) => a.id !== data.alertId) ?? [],
      );

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alert(data.alertId),
      });
    });

    socketRef.current = socket;
  }, [
    user?.id, // ✅ Dépendance sur user.id seulement, pas user entier
    queryClient,
    updateUser,
    setInAppAlert,
    setJambaarCelebration,
    setBadgeUnlock,
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
