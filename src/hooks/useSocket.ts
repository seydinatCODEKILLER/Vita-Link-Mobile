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
import { BloodStock } from "../types/domain.types";

export const useSocket = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const { setInAppAlert, removeAlert } = useAlertStore();

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

    isConnecting.current = true;

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
      logger.info("✅ Socket.io connecté");
    });

    socket.on("disconnect", (reason) => {
      logger.warn("🔌 Socket.io déconnecté :", reason);
    });

    socket.on("connect_error", (err) => {
      isConnecting.current = false;
      logger.error("❌ Socket.io erreur de connexion :", err.message);
    });

    // ── 1. NOUVELLE ALERTE (Redirigé vers l'agent si besoin) ──
    socket.on("alert:new", (data: Alert) => {
      // Les agents reçoivent les alertes via leur propre route "my-structure",
      // mais on peut garder cet événement pour une notification in-app globale si nécessaire.
      // Pour l'instant, on ne fait rien de spécifique pour ne pas polluer l'interface agent.
      logger.info("🚨 Nouvelle alerte diffusée :", data.id);
    });

    // ── 2. QUOTA ATTEINT ─────────────────────────────────────
    socket.on("alert:quota_reached", (data: { alertId: string }) => {
      logger.info("🎯 Quota atteint pour l'alerte :", data.alertId);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alert(data.alertId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });

      if (user.role === "CNTS_ADMIN" || user.role === "CNTS_AGENT") {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      }
      if (user.role === "HOSPITAL_AGENT") {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.hospitalDashboard(),
        });
      }
    });

    // ── 3. ALERTE FERMÉE ─────────────────────────────────────
    socket.on("alert:closed", (data: { alertId: string; status: string }) => {
      logger.info("🔒 Alerte fermée :", data.alertId);

      removeAlert(data.alertId);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alert(data.alertId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });

      if (user.role === "CNTS_ADMIN" || user.role === "CNTS_AGENT") {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      }
      if (user.role === "HOSPITAL_AGENT") {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.hospitalDashboard(),
        });
      }
    });

    // ── 4. RÉPONSE DONNEUR (Pour CNTS / HÔPITAUX) ────────────
    socket.on("response:new", (data: { alertId: string }) => {
      logger.info("🚶 Nouveau donneur confirmé sur l'alerte :", data.alertId);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
    });

    // ── 5. DONNEUR ARRIVÉ (Pour CNTS / HÔPITAUX) ──────────────
    socket.on("response:arrived", (data: { alertId: string }) => {
      logger.info("🏥 Donneur arrivé sur l'alerte :", data.alertId);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
    });

    // ── 6. STOCK MIS À JOUR (Pour CNTS) ──────────────────────
    socket.on("stock:updated", (data) => {
      logger.info("🩸 Stock de sang mis à jour via Socket :", data.bloodType);

      // ✅ Mise à jour instantanée du cache de l'écran Stock CNTS
      queryClient.setQueryData<BloodStock[]>(
        QUERY_KEYS.bloodStocks,
        (oldStocks) => {
          if (!oldStocks) return oldStocks;
          return oldStocks.map((s) =>
            s.bloodType === data.bloodType
              ? { ...s, quantity: data.quantity, level: data.level }
              : s,
          );
        },
      );

      // ✅ Forcer le refetch IMMÉDIAT du Dashboard CNTS
      queryClient.refetchQueries({ queryKey: ["dashboard", "cnts"] });

      // ✅ NOUVEAU : Forcer le refetch IMMÉDIAT du Dashboard Hôpital
      queryClient.refetchQueries({ queryKey: ["dashboard", "hospital"] });

      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStats });
    });

    // ── 7. STRUCTURE VALIDÉE ─────────────────────────────────
    socket.on(
      "structure:verified",
      (data: { structureId: string; status: string; verifiedAt: string }) => {
        logger.info("✅ Structure validée :", data.structureId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const currentUser = useAuthStore.getState().user;
        if (currentUser?.employerStructure) {
          updateUser({
            employerStructure: {
              ...currentUser.employerStructure,
              status: "VERIFIED",
              isVerified: true,
            },
          });
        }

        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructure });
      },
    );

    // ── 8. ESCALADE ALERTE HÔPITAL (Pour la CNTS) ──────────
    socket.on(
      "alert:escalation",
      (data: {
        alertId: string;
        hospitalName: string;
        bloodType: string;
        urgencyLevel: string;
      }) => {
        if (user.role !== "CNTS_ADMIN" && user.role !== "CNTS_AGENT") return;

        logger.info(
          "🚨 Alerte escaladée par un hôpital via Socket :",
          data.alertId,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        setInAppAlert({
          id: data.alertId,
          title: "🚨 Escalade Hôpital",
          body: `${data.hospitalName} lance une alerte ${data.urgencyLevel === "VITAL" ? "VITALE" : "standard"} pour du sang ${data.bloodType.replace("_", "")}`,
          data: { alertId: data.alertId, type: "alert_escalation" },
          receivedAt: new Date(),
        });

        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      },
    );

    // ── 9. NOUVELLE DEMANDE DE SANG (Pour la CNTS) ────────
    socket.on(
      "blood-request:new",
      (data: {
        requestId: string;
        hospitalName: string;
        bloodType: string;
      }) => {
        if (user.role !== "CNTS_ADMIN" && user.role !== "CNTS_AGENT") return;

        logger.info(
          "🏥 Nouvelle demande de sang d'un hôpital :",
          data.requestId,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        setInAppAlert({
          id: data.requestId,
          title: "🏥 Nouvelle demande",
          body: `${data.hospitalName} demande du sang ${data.bloodType.replace("_", "")}`,
          data: { requestId: data.requestId, type: "blood_request" },
          receivedAt: new Date(),
        });

        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      },
    );

    // ── 10. DEMANDE DE SANG TRAITÉE (Pour l'Hôpital) ──────
    socket.on("blood-request:fulfilled", (data: { requestId: string }) => {
      if (user.role !== "HOSPITAL_AGENT") return;

      logger.info(
        "✅ Votre demande de sang a été traitée par la CNTS :",
        data.requestId,
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setInAppAlert({
        id: data.requestId,
        title: "✅ Demande traitée",
        body: "La CNTS a traité votre demande de sang.",
        data: { requestId: data.requestId, type: "request_fulfilled" },
        receivedAt: new Date(),
      });

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hospitalDashboard(),
      });
    });

    socketRef.current = socket;
  }, [
    user?.id,
    user?.role,
    queryClient,
    updateUser,
    setInAppAlert,
    removeAlert,
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

  return { disconnect, socketRef };
};
