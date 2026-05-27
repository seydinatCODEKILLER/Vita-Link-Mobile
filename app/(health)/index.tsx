import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useStructureStats } from "@/src/hooks/useHealthStructure";
import { useMyStructureAlerts } from "@/src/hooks/useAlerts";
import { useAuthStore } from "@/src/store/auth.store";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { BloodStockLevel, BloodType } from "@/src/types/shared.types";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

// ─── Config Niveaux de Stock (Dynamique) ──────────────────────
const getLevelConfig = (
  colors: AppColors,
): Record<BloodStockLevel, { label: string; color: string }> => ({
  CRITICAL: { label: "Critique", color: colors.red },
  LOW: { label: "Bas", color: colors.amber },
  ADEQUATE: { label: "Ok", color: colors.success },
  SURPLUS: { label: "Surplus", color: "#60A5FA" },
});

// ─── StatCard ─────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}) {
  const styles = useThemedStyles((c) => ({
    statCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 12,
      gap: 9,
    },
    statIcon: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    statBody: { gap: 2 },
    statUnit: { fontSize: 11, fontWeight: "600" },
    statLabel: {
      color: c.textMuted,
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 0.4,
    },
  }));

  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View style={styles.statBody}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            letterSpacing: -0.5,
            color,
          }}
        >
          {value}
          {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ─── BloodStockRow ────────────────────────────────────────────
function BloodStockRow({
  bloodType,
  quantity,
  level,
  colors,
}: {
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel;
  colors: AppColors;
}) {
  const LEVEL_CONFIG = getLevelConfig(colors);
  const { label, color } = LEVEL_CONFIG[level];
  const typeLabel = BLOOD_TYPE_LABELS[bloodType] ?? bloodType.replace("_", "");

  const styles = useThemedStyles((c) => ({
    stockRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 13,
      borderBottomWidth: 0.5,
      borderBottomColor: c.cardBorder,
    },
    stockLeft: { flexDirection: "row", alignItems: "center", gap: 11 },
    bloodChip: {
      minWidth: 38,
      height: 38,
      borderRadius: 10,
      borderWidth: 0.5,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
    },
    bloodChipText: { fontSize: 13, fontWeight: "900" },
    levelLabel: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    stockRight: { flexDirection: "row", alignItems: "baseline", gap: 4 },
    stockQty: { fontSize: 19, fontWeight: "900" },
    stockUnit: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
  }));

  return (
    <View style={styles.stockRow}>
      <View style={styles.stockLeft}>
        <View
          style={[
            styles.bloodChip,
            { backgroundColor: color + "12", borderColor: color + "28" },
          ]}
        >
          <Text style={[styles.bloodChipText, { color }]}>{typeLabel}</Text>
        </View>
        <Text style={styles.levelLabel}>{label}</Text>
      </View>
      <View style={styles.stockRight}>
        <Text style={[styles.stockQty, { color }]}>{quantity}</Text>
        <Text style={styles.stockUnit}>poches</Text>
      </View>
    </View>
  );
}

// ─── NOUVEAU : Skeleton Dashboard ─────────────────────────────
function DashboardSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
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
    <View style={{ paddingHorizontal: 20, gap: 22, opacity: 0.6 }}>
      {/* Fake Stats */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.cardBg, { flex: 1, height: 80, padding: 12 }]}
          />
        ))}
      </View>
      {/* Fake Stocks */}
      <View style={{ gap: 10 }}>
        <View style={[styles.line, { width: "30%" }]} />
        <View style={[styles.cardBg, { height: 120 }]} />
      </View>
      {/* Fake Alerts */}
      <View style={{ gap: 10 }}>
        <View style={[styles.line, { width: "40%" }]} />
        <View style={[styles.cardBg, { height: 90 }]} />
      </View>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function HealthHomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const isPending = useIsStructurePending();

  const tabBarHeight = useBottomTabBarHeight();

  // ─── RÉCUPÉRATION DES DONNées ET ERREURS ────────────────────
  const {
    data: stats,
    isLoading: statsLoading,
    isError: isStatsError,
    error: statsError,
    refetch: refetchStats,
  } = useStructureStats();

  const {
    data: alertsData,
    isLoading: alertsLoading,
    isError: isAlertsError,
    error: alertsError,
    refetch: refetchAlerts,
  } = useMyStructureAlerts({
    status: "ACTIVE",
  });

  const fabScale = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const activeAlerts = alertsData?.alerts ?? [];
  const activeAlertsCount = stats?.alerts?.ACTIVE ?? 0;

  // ─── LOGIQUE D'ERREUR RÉSEAU ────────────────────────────────
  const hasNetworkError =
    (isStatsError && isNetworkError(statsError)) ||
    (isAlertsError && isNetworkError(alertsError));

  const handleRetryNetwork = () => {
    refetchStats();
    refetchAlerts();
  };

  const handleCreateAlert = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente de validation",
        "Votre structure n'est pas encore approuvée par nos équipes. Vous pourrez créer des alertes dès que votre dossier sera validé.",
        [{ text: "Compris", style: "default" }],
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/alerts/create?from=dashboard" as any);
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    scrollContent: { paddingHorizontal: 20 },

    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingTop: 8,
      paddingBottom: 22,
    },
    greeting: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "500",
      marginBottom: 3,
    },
    headerTitle: {
      color: c.white,
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    notifWrap: { position: "relative" },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 4,
    },
    notifDot: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: c.red,
      borderWidth: 1.5,
      borderColor: c.bg,
    },

    // Stats
    statsGrid: { flexDirection: "row", gap: 8, marginBottom: 24 },

    // Sections
    sectionHead: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 10,
      marginTop: 4,
    },
    sectionLabel: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
      marginBottom: 22,
    },

    // Empty
    empty: { alignItems: "center", padding: 24, gap: 8 },
    emptyText: { color: c.textMuted, fontSize: 13 },

    // Alert Row
    alertRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 13,
      borderBottomWidth: 0.5,
      borderBottomColor: c.cardBorder,
    },
    alertBadge: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    badgeVital: {
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "40",
    },
    badgeStd: {
      backgroundColor: c.amber + "10",
      borderWidth: 0.5,
      borderColor: c.amber + "28",
    },
    alertBadgeText: { color: c.white, fontSize: 13, fontWeight: "900" },
    alertInfo: { flex: 1, gap: 3 },
    alertTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    alertQty: { color: c.white, fontSize: 13, fontWeight: "700" },
    vitalPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "30",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    vitalText: {
      color: c.red,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    alertService: {
      color: c.textMuted,
      fontSize: 11,
      textTransform: "capitalize",
    },

    // FAB
    fabWrap: {
      position: "absolute",
      right: 22,
    },
    fab: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    fabDisabled: {
      backgroundColor: c.cardBorder,
      shadowOpacity: 0,
      elevation: 0,
    },
  }));

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if ((statsLoading || alertsLoading) && !stats && !alertsData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Tableau <Text style={{ color: colors.red }}>de bord</Text>
            </Text>
          </View>
        </View>
        <DashboardSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !stats && !alertsData) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Tableau <Text style={{ color: colors.red }}>de bord</Text>
            </Text>
          </View>
        </View>
        <NetworkErrorScreen onRetry={handleRetryNetwork} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 70 },
        ]}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Tableau <Text style={{ color: colors.red }}>de bord</Text>
            </Text>
          </View>

          {/* ✅ MODIFICATION : ThemeToggle + bouton notif côte à côte */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <ThemeToggle size={40} />

            <View style={styles.notifWrap}>
              <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={colors.white}
                />
              </TouchableOpacity>
              {activeAlertsCount > 0 && <View style={styles.notifDot} />}
            </View>
          </View>
        </Animated.View>

        {/* ── Stats ── */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          <StatCard
            icon="alert-circle-outline"
            label="Alertes actives"
            value={activeAlertsCount}
            color={colors.red}
          />
          <StatCard
            icon="water-outline"
            label="Dons validés"
            value={stats?.totalDonations ?? 0}
            color={colors.success}
          />
          <StatCard
            icon="time-outline"
            label="Tps réponse"
            value={stats?.avgResponseTimeMinutes ?? "—"}
            unit={stats?.avgResponseTimeMinutes ? "min" : ""}
            color={colors.amber}
          />
        </Animated.View>

        {/* ── Stock de sang ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHead}>
            <Ionicons name="flask-outline" size={14} color={colors.red} />
            <Text style={styles.sectionLabel}>RÉSERVES DE SANG</Text>
          </View>
          <View style={styles.card}>
            {stats?.bloodStocks && stats.bloodStocks.length > 0 ? (
              stats.bloodStocks.map((stock) => (
                <BloodStockRow
                  key={stock.bloodType}
                  bloodType={stock.bloodType}
                  quantity={stock.quantity}
                  level={stock.level}
                  colors={colors}
                />
              ))
            ) : (
              <View style={styles.empty}>
                <Ionicons
                  name="water-outline"
                  size={24}
                  color={colors.textSubtle}
                />
                <Text style={styles.emptyText}>Aucun stock configuré</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* ── Alertes actives ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHead}>
            <Ionicons
              name="radio-button-on-outline"
              size={14}
              color={colors.amber}
            />
            <Text style={styles.sectionLabel}>ALERTES EN COURS</Text>
          </View>
          <View style={styles.card}>
            {activeAlerts.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.emptyText}>Aucune urgence en cours</Text>
              </View>
            ) : (
              activeAlerts.map((alert) => {
                const isVital = alert.urgencyLevel === "VITAL";
                return (
                  <TouchableOpacity
                    key={alert.id}
                    style={styles.alertRow}
                    onPress={() =>
                      router.push(`/(health)/alerts/${alert.id}` as any)
                    }
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.alertBadge,
                        isVital ? styles.badgeVital : styles.badgeStd,
                      ]}
                    >
                      <Text style={styles.alertBadgeText}>
                        {BLOOD_TYPE_LABELS[alert.bloodType] ??
                          alert.bloodType.replace("_", "")}
                      </Text>
                    </View>
                    <View style={styles.alertInfo}>
                      <View style={styles.alertTitleRow}>
                        <Text style={styles.alertQty}>
                          {alert.quantityConfirmed}/{alert.quantityNeeded}{" "}
                          donneurs
                        </Text>
                        {isVital && (
                          <View style={styles.vitalPill}>
                            <Ionicons
                              name="flash"
                              size={9}
                              color={colors.red}
                            />
                            <Text style={styles.vitalText}>VITAL</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.alertService}>
                        {alert.serviceUnit.replace("_", " ")}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={colors.textSubtle}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── FAB ── */}
      <Animated.View
        style={[
          styles.fabWrap,
          { bottom: tabBarHeight + 20, transform: [{ scale: fabScale }] },
        ]}
      >
        <TouchableOpacity
          style={[styles.fab, isPending && styles.fabDisabled]}
          onPress={handleCreateAlert}
          activeOpacity={isPending ? 0.6 : 0.85}
        >
          <Ionicons
            name="add"
            size={28}
            color={isPending ? colors.textSubtle : colors.white}
          />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
