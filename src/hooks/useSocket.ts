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
import { clearPendingQr } from "../utils/qr.utils";

export const useSocket = () => {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

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

    // ── 1. NOUVELLE ALERTE (Pour les DONNEURS) ────────────────
    socket.on("alert:new", (data: Alert) => {
      if (user.role !== "DONOR") return;

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

      addAlert(data);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
    });

    // ── 2. DON VALIDÉ (Pour les DONNEURS) ────────────────────
    socket.on("donation:validated", (data: any) => {
      if (user.role !== "DONOR") return;

      logger.info("🎉 Don validé, points crédités :", data.pointsAwarded);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      clearPendingQr().catch((err) =>
        logger.warn("Erreur nettoyage QR local", err),
      );

      const currentUser = useAuthStore.getState().user;
      if (currentUser?.jambaarsProfile) {
        updateUser({
          jambaarsProfile: {
            ...currentUser.jambaarsProfile,
            totalPoints:
              data.totalPoints ??
              currentUser.jambaarsProfile.totalPoints + data.pointsAwarded,
            donationCount: currentUser.jambaarsProfile.donationCount + 1,
            currentGrade:
              data.newGrade ?? currentUser.jambaarsProfile.currentGrade,
            nextEligibilityAt:
              data.nextEligibilityAt ??
              currentUser.jambaarsProfile.nextEligibilityAt,
            lastDonationAt: new Date().toISOString(),
            livesSavedEstimate:
              currentUser.jambaarsProfile.livesSavedEstimate + 3,
          },
        });
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.me });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeEngagement });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hasActiveConfirmation,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myDonations });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarsProfile });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leaderboard });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.jambaarssBadges });

      setJambaarCelebration({
        pointsEarned: data.pointsAwarded,
        message: data.gradeChanged
          ? `Nouveau grade : ${data.newGrade} !`
          : "Votre don a été validé !",
      });
    });

    // ── 3. BADGE DÉBLOQUÉ (Pour les DONNEURS) ────────────────
    socket.on(
      "badges:earned",
      (data: { name: string; description: string; iconUrl?: string }) => {
        if (user.role !== "DONOR") return;

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
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });

      if (user.role === "CNTS_ADMIN" || user.role === "CNTS_AGENT") {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      }
      // 🆕 L'hôpital aussi doit voir son dashboard mis à jour
      if (user.role === "HOSPITAL_AGENT") {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.hospitalDashboard(),
        });
      }
    });

    // ── 5. ALERTE FERMÉE ─────────────────────────────────────
    socket.on("alert:closed", (data: { alertId: string; status: string }) => {
      logger.info("🔒 Alerte fermée :", data.alertId);

      removeAlert(data.alertId);

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.nearbyAlerts });
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
      // 🆕 L'hôpital aussi doit voir son dashboard mis à jour
      if (user.role === "HOSPITAL_AGENT") {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.hospitalDashboard(),
        });
      }
    });

    // ── 6. RÉPONSE DONNEUR (Pour CNTS / HÔPITAL) ────────────
    socket.on("response:new", (data: { alertId: string }) => {
      logger.info("🚶 Nouveau donneur confirmé sur l'alerte :", data.alertId);

      if (user.role !== "DONOR") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
    });

    // ── 7. DONNEUR ARRIVÉ (Pour CNTS / HÔPITAL) ──────────────
    socket.on("response:arrived", (data: { alertId: string }) => {
      logger.info("🏥 Donneur arrivé sur l'alerte :", data.alertId);
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alertResponses(data.alertId),
      });
    });

    // ── 8. STOCK MIS À JOUR (Pour CNTS) ──────────────────────
    socket.on("stock:updated", (data) => {
      logger.info("🩸 Stock de sang mis à jour via Socket :", data.bloodType);

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodStocks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
    });

    socket.on("stock:critical", (data) => {
      logger.info("🚨 Stock critique signalé aux admins :", data);
      queryClient.invalidateQueries({ queryKey: ["admin", "stocks"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
    });

    // ── 9. STRUCTURE VALIDÉE ─────────────────────────────────
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

    // ── 10. JOURNÉE DE DON ANNULÉE (Pour le Donneur) ──────────
    socket.on(
      "donation-day:cancelled",
      (data: { dayId: string; title: string; cancelReason: string }) => {
        if (user.role !== "DONOR") return;

        logger.info("📅 Journée de don annulée via Socket :", data.dayId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        setInAppAlert({
          id: data.dayId,
          title: "📅 Collecte annulée",
          body: `"${data.title}" a été annulée. Raison : ${data.cancelReason}`,
          data: { dayId: data.dayId, type: "day_cancelled" },
          receivedAt: new Date(),
        });

        queryClient.invalidateQueries({
          queryKey: ["donation-days", "published"],
        });
        queryClient.invalidateQueries({
          queryKey: ["donation-days", "my-registrations"],
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.donationDay(data.dayId),
        });
      },
    );

    // ── 11. JOURNÉE DE DON MODIFIÉE (Pour le Donneur) ────────
    socket.on("donation-day:updated", (data: { dayId: string }) => {
      if (user.role !== "DONOR") return;

      logger.info("✏️ Journée de don modifiée via Socket :", data.dayId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      setInAppAlert({
        id: `update-${data.dayId}`,
        title: "📅 Modification de collecte",
        body: "Les détails d'une journée à laquelle vous êtes inscrit ont changé.",
        data: { dayId: data.dayId, type: "day_updated" },
        receivedAt: new Date(),
      });

      queryClient.invalidateQueries({
        queryKey: ["donation-days", "published"],
      });
      queryClient.invalidateQueries({
        queryKey: ["donation-days", "my-registrations"],
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.donationDay(data.dayId),
      });
    });

    // ── 12. STATUT INSCRIPTION MIS À JOUR ────────────────────
    socket.on(
      "registration:status-updated",
      (data: { dayId: string; status: string }) => {
        logger.info(
          "✅ Statut inscription mis à jour via Socket :",
          data.status,
        );

        if (data.status === "ATTENDED" && user.role === "DONOR") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setInAppAlert({
            id: `reg-${data.dayId}`,
            title: "✅ Présence confirmée",
            body: "Votre présence à la collecte a été validée par l'équipe médicale.",
            data: { dayId: data.dayId, type: "registration_updated" },
            receivedAt: new Date(),
          });
        }

        queryClient.invalidateQueries({
          queryKey: ["donation-days", "my-registrations"],
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.donationDay(data.dayId),
        });
      },
    );

    // ── 🆕 13. ESCALADE ALERTE HÔPITAL (Pour la CNTS) ──────────
    socket.on(
      "alert:escalation",
      (data: {
        alertId: string;
        hospitalName: string;
        bloodType: string;
        urgencyLevel: string;
      }) => {
        // Seule la CNTS reçoit cet événement de la part d'un hôpital
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

        // Rafraîchir la liste des alertes de la structure (CNTS) et le dashboard
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAlerts });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cntsDashboard() });
      },
    );

    // ── 14. NOUVELLE DEMANDE DE SANG (Pour la CNTS) ────────
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

    // ── 15. DEMANDE DE SANG TRAITÉE (Pour l'Hôpital) ──────
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
    setJambaarCelebration,
    setBadgeUnlock,
    addAlert,
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
