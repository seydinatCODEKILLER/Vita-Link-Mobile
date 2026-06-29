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

    // ── 1. NOUVELLE ALERTE ──
    socket.on("alert:new", (data: Alert) => {
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

    // ── 4. RÉPONSE DONNEUR ────────────────────────────────────
    socket.on("response:new", (data: { alertId: string }) => {
      logger.info("🚶 Nouveau donneur confirmé sur l'alerte :", data.alertId);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
    });

    // ── 5. DONNEUR ARRIVÉ ──────────────────────────────────────
    socket.on("response:arrived", (data: { alertId: string }) => {
      logger.info("🏥 Donneur arrivé sur l'alerte :", data.alertId);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
    });

    // ── 6. STOCK MIS À JOUR ──────────────────────────────────
    socket.on("stock:updated", (data) => {
      logger.info("🩸 Stock de sang mis à jour via Socket :", data.bloodType);

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

      queryClient.refetchQueries({ queryKey: ["dashboard", "cnts"] });
      queryClient.refetchQueries({ queryKey: ["dashboard", "hospital"] });
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

    // ── 8. ESCALADE ALERTE HÔPITAL ──────────────────────────
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

    // ── 9. NOUVELLE DEMANDE DE SANG ────────────────────────
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

    // ── 10. DEMANDE DE SANG TRAITÉE ──────────────────────────
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

    // ── 11. BON DE COMMANDE CRÉÉ (Pour l'Hôpital) ──────────
    socket.on(
      "purchase_order:created",
      (data: {
        orderId: string;
        code: string;
        bloodType: string;
        quantity: number;
        expiresAt: string;
      }) => {
        if (user.role !== "HOSPITAL_AGENT") return;

        logger.info(
          "📋 Bon de commande créé pour votre demande :",
          data.orderId,
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        setInAppAlert({
          id: data.orderId,
          title: "📋 Bon de commande prêt",
          body: `Votre bon pour ${data.quantity} poche(s) ${data.bloodType.replace("_", "")} est disponible. Code : ${data.code}`,
          data: { orderId: data.orderId, type: "purchase_order" },
          receivedAt: new Date(),
        });

        // Rafraîchir la liste des demandes et le dashboard hospitalier
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.purchaseOrders(),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.hospitalDashboard(),
        });
      },
    );

    // ── 12. BON DE COMMANDE VALIDÉ/SCANNÉ (Pour la CNTS & Hôpital) ──
    socket.on(
      "purchase_order:validated",
      (data: {
        orderId: string;
        code: string;
        scannedAt: string;
        bloodType: string;
        quantity: number;
      }) => {
        logger.info("✅ Bon de commande scanné/validé :", data.orderId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Côté Hôpital : notification de confirmation de retrait
        if (user.role === "HOSPITAL_AGENT") {
          setInAppAlert({
            id: data.orderId,
            title: "🚚 Sang récupéré",
            body: `Le bon ${data.code} a été validé par la CNTS. ${data.quantity} poche(s) ${data.bloodType.replace("_", "")} retirée(s).`,
            data: { orderId: data.orderId, type: "purchase_order_validated" },
            receivedAt: new Date(),
          });
        }

        // Les deux rôles ont besoin de rafraîchir leurs données
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.purchaseOrders(),
        });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });

        if (user.role === "CNTS_ADMIN" || user.role === "CNTS_AGENT") {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.cntsDashboard(),
          });
        }
        if (user.role === "HOSPITAL_AGENT") {
          queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.hospitalDashboard(),
          });
        }
      },
    );

    // ── CNTS : Alerte de confirmation requise ──
    socket.on("purchase_order:expired_confirm_required", (data: any) => {
      if (user.role !== "CNTS_ADMIN" && user.role !== "CNTS_AGENT") return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setInAppAlert({
        id: data.orderId,
        title: "⏳ Bon expiré - Confirmation requise",
        body: data.message,
        data: { orderId: data.orderId, type: "expired_confirm" },
        receivedAt: new Date(),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders() });
    });

    // ── Hôpital : Stock restitué car non retiré ──
    socket.on("purchase_order:cancelled_stock_restored", (data: any) => {
      if (user.role !== "HOSPITAL_AGENT") return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setInAppAlert({
        id: data.orderId,
        title: "❌ Bon annulé",
        body: data.message,
        data: { orderId: data.orderId, type: "order_cancelled" },
        receivedAt: new Date(),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.purchaseOrders() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
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
