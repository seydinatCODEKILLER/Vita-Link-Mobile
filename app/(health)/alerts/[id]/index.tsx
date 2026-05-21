import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAlert } from "@/src/hooks/useAlerts";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { useAuthStore } from "@/src/store/auth.store";
import dayjs from "dayjs";

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

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id: alertId } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const tabBarHeight = useBottomTabBarHeight();

  const { data: alert, isLoading } = useAlert(alertId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.textMuted}
        />
        <Text style={styles.notFoundText}>Alerte introuvable</Text>
      </View>
    );
  }

  const isVital = alert.urgencyLevel === "VITAL";
  const isActive = alert.status === "ACTIVE";
  const isExpired = alert.status === "EXPIRED";

  const bloodLabel =
    BLOOD_TYPE_LABELS[alert.bloodType] ?? alert.bloodType.replaceAll("_", "");
  const formattedExpiresAt = alert.expiresAt
    ? dayjs(alert.expiresAt).format("HH:mm")
    : "—";
  const progressPct = Math.min(
    (alert.quantityConfirmed / alert.quantityNeeded) * 100,
    100,
  );

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGoToDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(health)/alerts/${alertId}/dashboard`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            gap: 12,
          }}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={19} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Détails Alerte</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* ── Hero Card ── */}
          <View
            style={[
              styles.heroCard,
              {
                borderColor: isVital
                  ? "rgba(220,30,30,0.30)"
                  : "rgba(250,199,117,0.22)",
              },
            ]}
          >
            {/* Glow décoratif */}
            <View
              style={[
                styles.heroGlow,
                {
                  backgroundColor: isVital
                    ? "rgba(220,30,30,0.10)"
                    : "rgba(250,199,117,0.08)",
                },
              ]}
            />

            {/* Identité */}
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.bloodBadge,
                  isVital ? styles.badgeVital : styles.badgeStd,
                ]}
              >
                <Text style={styles.bloodBadgeText}>{bloodLabel}</Text>
              </View>

              <View style={styles.heroInfo}>
                <Text style={styles.hospitalName} numberOfLines={2}>
                  {alert.healthStructure?.name ?? "Structure"}
                </Text>
                <Text style={styles.serviceUnit}>
                  {alert.serviceUnit?.replaceAll("_", " ") ?? "Urgence"}
                </Text>
                {isVital && (
                  <View style={styles.vitalPill}>
                    <Ionicons name="flash" size={10} color={COLORS.red} />
                    <Text style={styles.vitalPillText}>VITAL</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Statut */}
            <View
              style={[
                styles.statusRow,
                isActive
                  ? styles.statusActive
                  : isExpired
                    ? styles.statusExpired
                    : styles.statusClosed,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isActive
                      ? COLORS.green
                      : isExpired
                        ? COLORS.amber
                        : COLORS.textSubtle,
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: isActive
                      ? COLORS.green
                      : isExpired
                        ? COLORS.amber
                        : COLORS.textMuted,
                  },
                ]}
              >
                {isActive
                  ? "Alerte active"
                  : isExpired
                    ? "Expirée"
                    : "Clôturée"}
              </Text>
            </View>
          </View>

          {/* ── Info Grid ── */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: "rgba(220,30,30,0.13)" },
                ]}
              >
                <Ionicons name="water-outline" size={15} color={COLORS.red} />
              </View>
              <Text style={styles.infoLabel}>BESOIN</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{alert.quantityNeeded}</Text>
                <Text style={styles.infoUnit}>poches</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: "rgba(250,199,117,0.13)" },
                ]}
              >
                <Ionicons name="time-outline" size={15} color={COLORS.amber} />
              </View>
              <Text style={styles.infoLabel}>EXPIRE À</Text>
              <Text style={styles.infoValue}>{formattedExpiresAt}</Text>
            </View>
          </View>

          {/* ── Barre de progression donneurs ── */}
          <View style={styles.progressCard}>
            <View style={styles.progressHead}>
              <Text style={styles.progressLabel}>Donneurs confirmés</Text>
              <Text
                style={[
                  styles.progressCount,
                  { color: progressPct >= 100 ? COLORS.green : COLORS.white },
                ]}
              >
                {alert.quantityConfirmed} / {alert.quantityNeeded}
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPct}%` as any,
                    backgroundColor:
                      progressPct >= 100 ? COLORS.green : COLORS.red,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressSub}>
              {progressPct >= 100
                ? "Quota atteint ✓"
                : `${alert.quantityNeeded - alert.quantityConfirmed} donneur${alert.quantityNeeded - alert.quantityConfirmed > 1 ? "s" : ""} manquant${alert.quantityNeeded - alert.quantityConfirmed > 1 ? "s" : ""}`}
            </Text>
          </View>

          {/* ── Bouton Dashboard ── */}
          {isActive && user?.isStructureAdmin && (
            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={handleGoToDashboard}
              activeOpacity={0.85}
            >
              <View style={styles.dashboardBtnIcon}>
                <Ionicons name="pulse-outline" size={19} color={COLORS.white} />
              </View>
              <Text style={styles.dashboardBtnText}>Dashboard Temps Réel</Text>
              <Ionicons
                name="chevron-forward"
                size={15}
                color="rgba(255,255,255,0.45)"
              />
            </TouchableOpacity>
          )}

          {/* ── Alerte terminée ── */}
          {!isActive && (
            <View style={styles.closedCard}>
              <View style={styles.closedIconWrap}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={22}
                  color={COLORS.green}
                />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.closedTitle}>
                  Alerte {isExpired ? "expirée" : "clôturée"}
                </Text>
                <Text style={styles.closedSub}>
                  {alert.quantityConfirmed} donneur
                  {alert.quantityConfirmed > 1 ? "s" : ""} se
                  {alert.quantityConfirmed > 1 ? " sont" : " s'est"} présenté
                  {alert.quantityConfirmed > 1 ? "s" : ""}.
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { alignItems: "center", justifyContent: "center", gap: 12 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  notFoundText: { color: COLORS.textMuted, fontSize: 15, marginTop: 8 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },

  // Hero Card
  heroCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 0.5,
    padding: 18,
    gap: 14,
    overflow: "hidden",
    position: "relative",
  },
  heroGlow: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.6,
  },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  bloodBadge: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeVital: {
    backgroundColor: "rgba(220,30,30,0.14)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.40)",
  },
  badgeStd: {
    backgroundColor: "rgba(250,199,117,0.10)",
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.30)",
  },
  bloodBadgeText: { color: COLORS.white, fontSize: 20, fontWeight: "900" },
  heroInfo: { flex: 1, gap: 5 },
  hospitalName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  serviceUnit: {
    color: COLORS.textMuted,
    fontSize: 13,
    textTransform: "capitalize",
  },
  vitalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: "rgba(220,30,30,0.13)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.35)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    marginTop: 2,
  },
  vitalPillText: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // Status
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 11,
  },
  statusActive: {
    backgroundColor: "rgba(29,158,117,0.07)",
    borderWidth: 0.5,
    borderColor: "rgba(29,158,117,0.20)",
  },
  statusExpired: {
    backgroundColor: "rgba(250,199,117,0.07)",
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.20)",
  },
  statusClosed: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  statusText: { fontSize: 12, fontWeight: "700" },

  // Info Grid
  infoGrid: { flexDirection: "row", gap: 9 },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 14,
    gap: 6,
  },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  infoValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  infoValue: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  infoUnit: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600" },

  // Progress
  progressCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 15,
    gap: 10,
  },
  progressHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  progressCount: { fontSize: 14, fontWeight: "800" },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  progressSub: { color: COLORS.textMuted, fontSize: 11, fontWeight: "500" },

  // Dashboard Button
  dashboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.red,
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 16,
  },
  dashboardBtnIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardBtnText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Closed
  closedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 15,
  },
  closedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(29,158,117,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  closedTitle: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  closedSub: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
});
