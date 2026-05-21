import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useAlertResponses, useCloseAlert } from "@/src/hooks/useAlerts";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { AlertResponseStatus } from "@/src/types/shared.types";
import { useSocket } from "@/src/hooks/useSocket";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.07)",
  red: "#DC1E1E",
  green: "#1D9E75",
  amber: "#FAC775",
  blue: "#60A5FA",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.42)",
  textSubtle: "rgba(255,255,255,0.16)",
} as const;

// ─── Config Statut Réponse ──────────────────────────────────
const RESPONSE_CONFIG: Record<
  AlertResponseStatus,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  CONFIRMED: { label: "En route", icon: "walk-outline", color: COLORS.blue },
  ARRIVED: {
    label: "Arrivé",
    icon: "checkmark-circle-outline",
    color: COLORS.green,
  },
  DECLINED: {
    label: "Refusé",
    icon: "close-circle-outline",
    color: COLORS.red,
  },
  NO_SHOW: {
    label: "Absent",
    icon: "alert-circle-outline",
    color: COLORS.amber,
  },
  CANCELLED: {
    label: "Annulé",
    icon: "remove-circle-outline",
    color: COLORS.textMuted,
  },
};

// ─── SummaryCard ─────────────────────────────────────────────
function SummaryCard({
  confirmed,
  arrived,
  noShow,
  quantityNeeded,
}: {
  confirmed: number;
  arrived: number;
  noShow: number;
  quantityNeeded: number;
}) {
  const progressPct =
    quantityNeeded > 0 ? ((confirmed + arrived) / quantityNeeded) * 100 : 0;
  const isQuotaReached = confirmed + arrived >= quantityNeeded;

  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="walk-outline" size={18} color={COLORS.blue} />
          <Text style={[styles.summaryValue, { color: COLORS.blue }]}>
            {confirmed}
          </Text>
          <Text style={styles.summaryLabel}>En route</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={COLORS.green}
          />
          <Text style={[styles.summaryValue, { color: COLORS.green }]}>
            {arrived}
          </Text>
          <Text style={styles.summaryLabel}>Arrivés</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={COLORS.amber}
          />
          <Text style={[styles.summaryValue, { color: COLORS.amber }]}>
            {noShow}
          </Text>
          <Text style={styles.summaryLabel}>Absents</Text>
        </View>
      </View>
      <View style={styles.quotaRow}>
        <Text style={styles.quotaText}>
          Quota :{" "}
          <Text style={{ color: COLORS.white, fontWeight: "800" }}>
            {confirmed + arrived}
          </Text>{" "}
          / {quantityNeeded} donneurs
        </Text>
        <View style={styles.quotaBarBg}>
          <View
            style={[
              styles.quotaBarFill,
              {
                width: `${Math.min(progressPct, 100)}%` as any,
                backgroundColor: isQuotaReached ? COLORS.green : COLORS.red,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

// ─── DonorResponseRow ─────────────────────────────────────────
function DonorResponseRow({ response }: { response: any }) {
  const config =
    RESPONSE_CONFIG[response.status as AlertResponseStatus] ??
    RESPONSE_CONFIG.CONFIRMED;

  return (
    <View style={styles.donorRow}>
      <View style={styles.donorAvatar}>
        <Text style={styles.donorAvatarText}>
          {response.donor.firstName?.[0]}
          {response.donor.lastName?.[0]}
        </Text>
      </View>
      <View style={styles.donorInfo}>
        <Text style={styles.donorName}>
          {response.donor.firstName} {response.donor.lastName}
        </Text>
        {response.etaMinutes && response.status === "CONFIRMED" && (
          <Text style={styles.donorEta}>
            Arrive dans ~{response.etaMinutes} min
          </Text>
        )}
        {response.status === "ARRIVED" && response.arrivedAt && (
          <Text style={styles.donorArrived}>
            Arrivé il y a quelques instants
          </Text>
        )}
      </View>
      <View
        style={[
          styles.statusPill,
          {
            backgroundColor: config.color + "15",
            borderColor: config.color + "30",
          },
        ]}
      >
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function AlertDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id: alertId } = useLocalSearchParams<{ id: string }>();
  const { socketRef } = useSocket();

  const { data, isLoading } = useAlertResponses(alertId);
  const { mutateAsync: closeAlert, isPending: isClosing } = useCloseAlert();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useSocket();

  useEffect(() => {
    if (!alertId || !socketRef.current) return;
    const socket = socketRef.current;
    socket.emit("join:alert", { alertId });
    return () => {
      socket.emit("leave:alert", { alertId });
    };
  }, [alertId, socketRef]);

  const handleCloseAlert = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Fermer l'alerte ?",
      "Le quota est-il atteint ou l'urgence est-elle résolue ? Les donneurs en route seront notifiés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Fermer",
          style: "destructive",
          onPress: async () => {
            try {
              await closeAlert(alertId);
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible de fermer l'alerte.");
            }
          },
        },
      ],
    );
  };

  if (isLoading || !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  const { alert, responses, summary } = data;
  const isVital = alert.urgencyLevel === "VITAL";
  const isActive = alert.status === "ACTIVE";

  return (
    // edges={["top","bottom"]} — SafeAreaView gère la home indicator iOS
    // Le footer est dans le flux, jamais masqué
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
          {/* ── Header Alerte ── */}
          <View style={styles.alertHeader}>
            <View
              style={[
                styles.bloodBadge,
                isVital ? styles.badgeVital : styles.badgeStd,
              ]}
            >
              <Text style={styles.bloodBadgeText}>
                {BLOOD_TYPE_LABELS[alert.bloodType] ??
                  alert.bloodType.replace("_", "")}
              </Text>
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>
                {isVital ? "Urgence Vitale" : "Alerte Standard"}
              </Text>
              <Text style={styles.alertSub}>{alert.healthStructure.name}</Text>
            </View>
            <View
              style={[
                styles.liveDot,
                {
                  backgroundColor: isActive
                    ? isVital
                      ? COLORS.red
                      : COLORS.green
                    : COLORS.textSubtle,
                },
              ]}
            />
          </View>

          {/* ── Résumé ── */}
          <SummaryCard
            confirmed={summary.confirmed}
            arrived={summary.arrived}
            noShow={summary.noShow}
            quantityNeeded={alert.quantityNeeded}
          />

          {/* ── Alerte expirée / clôturée ── */}
          {!isActive && (
            <View style={styles.closedBanner}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={20}
                color={alert.status === "EXPIRED" ? COLORS.amber : COLORS.green}
              />
              <Text
                style={[
                  styles.closedBannerText,
                  {
                    color:
                      alert.status === "EXPIRED" ? COLORS.amber : COLORS.green,
                  },
                ]}
              >
                Alerte {alert.status === "EXPIRED" ? "expirée" : "clôturée"} —
                lecture seule
              </Text>
            </View>
          )}

          {/* ── Titre Liste ── */}
          <View style={styles.listHeader}>
            <Ionicons name="people-outline" size={16} color={COLORS.white} />
            <Text style={styles.listTitle}>RÉPONSES EN TEMPS RÉEL</Text>
          </View>

          {/* ── Liste des réponses ── */}
          {responses.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={COLORS.textSubtle} size="small" />
              <Text style={styles.emptyText}>
                En attente de réponses des donneurs...
              </Text>
            </View>
          ) : (
            <View style={styles.responsesList}>
              {responses.map((resp: any) => (
                <DonorResponseRow key={resp.id} response={resp} />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Footer — uniquement si l'alerte est active ── */}
      {isActive && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.closeBtn, isClosing && styles.closeBtnDisabled]}
            onPress={handleCloseAlert}
            disabled={isClosing}
            activeOpacity={0.8}
          >
            {isClosing ? (
              <ActivityIndicator color={COLORS.red} size="small" />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={20}
                  color={COLORS.red}
                />
                <Text style={styles.closeBtnText}>Fermer l&apos;alerte</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },

  // Header Alerte
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 16,
  },
  bloodBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeVital: {
    backgroundColor: "rgba(220,30,30,0.15)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.40)",
  },
  badgeStd: {
    backgroundColor: "rgba(250,199,117,0.10)",
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.30)",
  },
  bloodBadgeText: { color: COLORS.white, fontSize: 18, fontWeight: "900" },
  alertInfo: { flex: 1, gap: 4 },
  alertTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  alertSub: { color: COLORS.textMuted, fontSize: 13 },
  liveDot: { width: 10, height: 10, borderRadius: 5 },

  // Closed banner
  closedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 13,
  },
  closedBannerText: { fontSize: 13, fontWeight: "600" },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 18,
    gap: 16,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryItem: { flex: 1, alignItems: "center", gap: 6 },
  summaryValue: { fontSize: 24, fontWeight: "900" },
  summaryLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600" },
  summaryDivider: {
    width: 0.5,
    height: 40,
    backgroundColor: COLORS.cardBorder,
  },
  quotaRow: { gap: 8 },
  quotaText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  quotaBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  quotaBarFill: { height: "100%", borderRadius: 3 },

  // List
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  listTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  responsesList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  donorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.cardBorder,
  },
  donorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  donorAvatarText: { color: COLORS.white, fontSize: 14, fontWeight: "800" },
  donorInfo: { flex: 1, gap: 3 },
  donorName: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  donorEta: { color: COLORS.blue, fontSize: 12 },
  donorArrived: { color: COLORS.green, fontSize: 12 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 0.5,
  },
  statusText: { fontSize: 11, fontWeight: "700" },

  // Empty
  emptyState: { alignItems: "center", padding: 40, gap: 12 },
  emptyText: { color: COLORS.textSubtle, fontSize: 13, textAlign: "center" },

  // Footer dans le flux — visible seulement si isActive
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.cardBorder,
  },
  closeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.30)",
    backgroundColor: "rgba(220,30,30,0.05)",
    borderRadius: 16,
    paddingVertical: 16,
  },
  closeBtnDisabled: { opacity: 0.5 },
  closeBtnText: { color: COLORS.red, fontSize: 16, fontWeight: "700" },
});
