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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useStructureStats } from "@/src/hooks/useHealthStructure";
import { useMyStructureAlerts } from "@/src/hooks/useAlerts";
import { useAuthStore } from "@/src/store/auth.store";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { BloodStockLevel, BloodType } from "@/src/types/shared.types";

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

// ─── Config Niveaux de Stock ──────────────────────────────────
const LEVEL_CONFIG: Record<BloodStockLevel, { label: string; color: string }> =
  {
    CRITICAL: { label: "Critique", color: COLORS.red },
    LOW: { label: "Bas", color: COLORS.amber },
    ADEQUATE: { label: "Ok", color: COLORS.green },
    SURPLUS: { label: "Surplus", color: COLORS.blue },
  };

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
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={15} color={color} />
      </View>
      <View style={styles.statBody}>
        <Text style={[styles.statValue, { color }]}>
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
}: {
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel;
}) {
  const { label, color } = LEVEL_CONFIG[level];
  const typeLabel = BLOOD_TYPE_LABELS[bloodType] ?? bloodType.replace("_", "");

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

// ─── Écran Principal ───────────────────────────────────────────
export default function HealthHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  
  const tabBarHeight = useBottomTabBarHeight();

  const { data: stats, isLoading: statsLoading } = useStructureStats();
  const { data: alertsData, isLoading: alertsLoading } = useMyStructureAlerts({
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

  const handleCreateAlert = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/alerts/create" as any);
  };

  if (statsLoading || alertsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 70 },
        ]} // ✅ Espace pour FAB + TabBar
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Tableau <Text style={{ color: COLORS.red }}>de bord</Text>
            </Text>
          </View>
          <View style={styles.notifWrap}>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>
            {activeAlertsCount > 0 && <View style={styles.notifDot} />}
          </View>
        </Animated.View>

        {/* ── Stats ── */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          <StatCard
            icon="alert-circle-outline"
            label="Alertes actives"
            value={activeAlertsCount}
            color={COLORS.red}
          />
          <StatCard
            icon="water-outline"
            label="Dons validés"
            value={stats?.totalDonations ?? 0}
            color={COLORS.green}
          />
          <StatCard
            icon="time-outline"
            label="Tps réponse"
            value={stats?.avgResponseTimeMinutes ?? "—"}
            unit={stats?.avgResponseTimeMinutes ? "min" : ""}
            color={COLORS.amber}
          />
        </Animated.View>

        {/* ── Stock de sang ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHead}>
            <Ionicons name="flask-outline" size={14} color={COLORS.red} />
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
                />
              ))
            ) : (
              <View style={styles.empty}>
                <Ionicons
                  name="water-outline"
                  size={24}
                  color={COLORS.textSubtle}
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
              color={COLORS.amber}
            />
            <Text style={styles.sectionLabel}>ALERTES EN COURS</Text>
          </View>
          <View style={styles.card}>
            {activeAlerts.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={COLORS.green}
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
                              color={COLORS.red}
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
                      color={COLORS.textSubtle}
                    />
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── FAB ── ✅ POSITIONNEMENT DYNAMIQUE PARFAIT ── */}
      <Animated.View
        style={[
          styles.fabWrap,
          { bottom: tabBarHeight + 20, transform: [{ scale: fabScale }] }, // ✅ 20px au-dessus de la TabBar
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateAlert}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
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
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 3,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  notifWrap: { position: "relative" },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
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
    backgroundColor: COLORS.red,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },

  // Stats
  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
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
  statValue: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  statUnit: { fontSize: 11, fontWeight: "600" },
  statLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // Sections
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
    marginBottom: 22,
  },

  // Blood Stock
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.cardBorder,
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
  levelLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  stockRight: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  stockQty: { fontSize: 19, fontWeight: "900" },
  stockUnit: { color: COLORS.textMuted, fontSize: 11, fontWeight: "500" },

  // Empty
  empty: { alignItems: "center", padding: 24, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },

  // Alert Row
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.cardBorder,
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
    backgroundColor: "rgba(220,30,30,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.40)",
  },
  badgeStd: {
    backgroundColor: "rgba(250,199,117,0.10)",
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.28)",
  },
  alertBadgeText: { color: COLORS.white, fontSize: 13, fontWeight: "900" },
  alertInfo: { flex: 1, gap: 3 },
  alertTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  alertQty: { color: COLORS.white, fontSize: 13, fontWeight: "700" },
  vitalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(220,30,30,0.12)",
    borderWidth: 0.5,
    borderColor: "rgba(220,30,30,0.30)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vitalText: {
    color: COLORS.red,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  alertService: {
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
});
