import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAlert } from "@/src/hooks/useAlerts";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import dayjs from "dayjs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { useIsCnts } from "@/src/hooks/useAuthStore";

// ─── Skeleton Détail Alerte ────────────────────────────────────
function AlertDetailSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    line: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 12, opacity: 0.6 }}>
      {/* Fake Hero */}
      <View style={[styles.cardBg, { padding: 18, gap: 14 }]}>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <View
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
            <View style={[styles.line, { width: "70%" }]} />
            <View style={[styles.line, { width: "40%", height: 8 }]} />
          </View>
        </View>
        <View
          style={{
            height: 30,
            borderRadius: 11,
            backgroundColor: colors.cardBorder,
          }}
        />
      </View>
      {/* Fake Info Grid */}
      <View style={{ flexDirection: "row", gap: 9 }}>
        <View
          style={[styles.cardBg, { flex: 1, height: 90, borderRadius: 14 }]}
        />
        <View
          style={[styles.cardBg, { flex: 1, height: 90, borderRadius: 14 }]}
        />
      </View>
      {/* Fake Progress */}
      <View style={[styles.cardBg, { height: 80, borderRadius: 14 }]} />
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function AlertDetailScreen() {
  const router = useRouter();
  const { id: alertId } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const isCnts = useIsCnts();
  // ─── RÉCUPÉRATION DES DONNées ET ERREURS ────────────────────
  const { data: alert, isLoading, isError, error, refetch } = useAlert(alertId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  // ─── LOGIQUE D'ERREUR RÉSEAU ────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center", gap: 12 },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
    notFoundText: { color: c.textMuted, fontSize: 15, marginTop: 8 },
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
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    heroCard: {
      backgroundColor: c.cardBg,
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
    bloodBadgeText: { color: c.white, fontSize: 20, fontWeight: "900" },
    heroInfo: { flex: 1, gap: 5 },
    hospitalName: {
      color: c.white,
      fontSize: 16,
      fontWeight: "800",
      letterSpacing: -0.2,
    },
    serviceUnit: {
      color: c.textMuted,
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
      color: c.red,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      borderRadius: 11,
    },
    statusActive: {
      backgroundColor: c.success + "12",
      borderWidth: 0.5,
      borderColor: c.success + "33",
    },
    statusExpired: {
      backgroundColor: c.amber + "12",
      borderWidth: 0.5,
      borderColor: c.amber + "33",
    },
    statusClosed: {
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    statusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
    statusText: { fontSize: 12, fontWeight: "700" },
    infoGrid: { flexDirection: "row", gap: 9 },
    infoCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
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
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    infoValueRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
    infoValue: {
      color: c.white,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    infoUnit: { color: c.textMuted, fontSize: 11, fontWeight: "600" },
    progressCard: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 15,
      gap: 10,
    },
    progressHead: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    progressCount: { fontSize: 14, fontWeight: "800" },
    progressBg: { height: 6, borderRadius: 3, backgroundColor: c.cardBorder },
    progressFill: { height: "100%", borderRadius: 3 },
    progressSub: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
    dashboardBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.red,
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
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    closedCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 15,
    },
    closedIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.success + "1A",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    closedTitle: { color: c.white, fontSize: 14, fontWeight: "700" },
    closedSub: { color: c.textMuted, fontSize: 12, lineHeight: 18 },
  }));

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

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.back();
        }}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={19} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Détails Alerte</Text>
      <View style={{ width: 38 }} />
    </View>
  );

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if (isLoading && !alert) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <AlertDetailSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !alert) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Alerte introuvable (Erreur 404 légitime) ────────────
  if (!alert) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={styles.notFoundText}>Alerte introuvable</Text>
      </View>
    );
  }

  // ── 4. Rendu normal ─────────────────────────────────────────
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

  const handleGoToDashboard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/(health)/alerts/${alertId}/dashboard?from=detail` as any);
  };

  const statusColor = isActive
    ? colors.success
    : isExpired
      ? colors.amber
      : colors.textMuted;

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
          {renderHeader()}

          {/* ── Hero Card ── */}
          <View
            style={[
              styles.heroCard,
              {
                borderColor: isVital
                  ? "rgba(220,30,30,0.30)"
                  : colors.amber + "38",
              },
            ]}
          >
            <View
              style={[
                styles.heroGlow,
                {
                  backgroundColor: isVital
                    ? "rgba(220,30,30,0.10)"
                    : colors.amber + "14",
                },
              ]}
            />

            <View style={styles.heroTop}>
              <View
                style={[
                  styles.bloodBadge,
                  isVital
                    ? {
                        backgroundColor: "rgba(220,30,30,0.14)",
                        borderWidth: 0.5,
                        borderColor: "rgba(220,30,30,0.40)",
                      }
                    : {
                        backgroundColor: colors.amber + "1A",
                        borderWidth: 0.5,
                        borderColor: colors.amber + "4D",
                      },
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
                    <Ionicons name="flash" size={10} color={colors.red} />
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
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {isActive
                  ? "Alerte active"
                  : isExpired
                    ? "Expirée"
                    : "Clôturée"}
              </Text>
            </View>
          </View>

          {/* ── Bannière d'Origine (Escalade Hôpital) ── */}
          {alert.origin === "CNTS_ESCALATION" && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: colors.amber + "12",
                borderWidth: 0.5,
                borderColor: colors.amber + "30",
                borderRadius: 12,
                padding: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: colors.amber + "1F",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={colors.amber}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text
                  style={{
                    color: colors.amber,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  Escalade Hôpital
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  Alerte créée suite à une demande de sang critique d&apos;un
                  hôpital affilié.
                </Text>
              </View>
            </View>
          )}

          {/* ── Info Grid ── */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: colors.red + "20" },
                ]}
              >
                <Ionicons name="water-outline" size={15} color={colors.red} />
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
                  { backgroundColor: colors.amber + "20" },
                ]}
              >
                <Ionicons name="time-outline" size={15} color={colors.amber} />
              </View>
              <Text style={styles.infoLabel}>EXPIRE À</Text>
              <Text style={styles.infoValue}>{formattedExpiresAt}</Text>
            </View>
          </View>

          {/* ── Progression ── */}
          <View style={styles.progressCard}>
            <View style={styles.progressHead}>
              <Text style={styles.progressLabel}>Donneurs confirmés</Text>
              <Text
                style={[
                  styles.progressCount,
                  { color: progressPct >= 100 ? colors.success : colors.white },
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
                      progressPct >= 100 ? colors.success : colors.red,
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

          {/* ── Dashboard ── */}
          {isActive && isCnts && (
            <TouchableOpacity
              style={styles.dashboardBtn}
              onPress={handleGoToDashboard}
              activeOpacity={0.85}
            >
              <View style={styles.dashboardBtnIcon}>
                <Ionicons name="pulse-outline" size={19} color="#FFFFFF" />
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
                  color={colors.success}
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
