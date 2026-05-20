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

  // ⚠️ Les hooks doivent TOUJOURS être avant les conditions de retour (return)
  const { data: alert, isLoading } = useAlert(alertId);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // ─── Loading State ──
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  // ─── Error / Empty State ──
  if (!alert) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={COLORS.textMuted}
        />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>
          Alerte introuvable
        </Text>
      </View>
    );
  }

  // ─── Data Formatting ──
  const isVital = alert.urgencyLevel === "VITAL";
  const isActive = alert.status === "ACTIVE";
  const isExpired = alert.status === "EXPIRED";
  const bloodLabel =
    BLOOD_TYPE_LABELS[alert.bloodType] ?? alert.bloodType.replaceAll("_", "");
  const formattedExpiresAt = alert.expiresAt
    ? dayjs(alert.expiresAt).format("HH:mm")
    : "—";

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleGoBack}
              style={styles.backBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Retour"
            >
              <Ionicons name="arrow-back" size={19} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Détails Alerte</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* ── Carte Identité Alerte ── */}
          <View style={styles.identityCard}>
            <View
              style={[
                styles.bloodBadge,
                isVital ? styles.badgeVital : styles.badgeStd,
              ]}
            >
              <Text style={styles.bloodBadgeText}>{bloodLabel}</Text>
            </View>
            <View style={styles.identityInfo}>
              <Text style={styles.hospitalName}>
                {alert.healthStructure?.name ?? "Structure"}
              </Text>
              <Text style={styles.serviceUnit}>
                {alert.serviceUnit?.replaceAll("_", " ") ?? "Urgence"}
              </Text>
            </View>
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
          </View>

          {/* ── Infos Clés ── */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="water-outline" size={18} color={COLORS.red} />
              <Text style={styles.infoLabel}>Besoin</Text>
              <Text style={styles.infoValue}>
                {alert.quantityNeeded} poches
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={COLORS.green}
              />
              <Text style={styles.infoLabel}>Confirmés</Text>
              <Text style={styles.infoValue}>
                {alert.quantityConfirmed} / {alert.quantityNeeded}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="flash-outline" size={18} color={COLORS.amber} />
              <Text style={styles.infoLabel}>Urgence</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isVital ? COLORS.red : COLORS.amber },
                ]}
              >
                {isVital ? "Vitale" : "Standard"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color={COLORS.blue} />
              <Text style={styles.infoLabel}>Expire</Text>
              <Text style={styles.infoValue}>{formattedExpiresAt}</Text>
            </View>
          </View>

          {/* ── Bloc Action ── */}
          {isActive && user?.isStructureAdmin && (
            <View style={styles.actionsBlock}>
              <TouchableOpacity
                style={styles.dashboardBtn}
                onPress={handleGoToDashboard}
                activeOpacity={0.8}
                accessibilityRole="button"
              >
                <Ionicons name="pulse-outline" size={20} color={COLORS.white} />
                <Text style={styles.dashboardBtnText}>
                  Dashboard Temps Réel
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.textSubtle}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Alerte terminée ── */}
          {!isActive && (
            <View style={styles.closedCard}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={24}
                color={COLORS.green}
              />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.closedTitle}>
                  Alerte {isExpired ? "expirée" : "clôturée"}
                </Text>
                <Text style={styles.closedSub}>
                  {alert.quantityConfirmed} donneurs se sont présentés.
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
  centered: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },

  // Identity
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: "rgba(220,30,30,0.40)",
  },
  badgeStd: {
    backgroundColor: "rgba(250,199,117,0.10)",
    borderWidth: 1,
    borderColor: "rgba(250,199,117,0.30)",
  },
  bloodBadgeText: { color: COLORS.white, fontSize: 18, fontWeight: "900" },
  identityInfo: { flex: 1, gap: 4 },
  hospitalName: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  serviceUnit: {
    color: COLORS.textMuted,
    fontSize: 13,
    textTransform: "capitalize",
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },

  // Info Grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  infoItem: {
    width: "47%",
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 14,
    gap: 6,
  },
  infoLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: "600" },
  infoValue: { color: COLORS.white, fontSize: 16, fontWeight: "800" },

  // Actions
  actionsBlock: { gap: 10 },
  dashboardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.red,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
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
    padding: 16,
  },
  closedTitle: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  closedSub: { color: COLORS.textMuted, fontSize: 12 },
});
