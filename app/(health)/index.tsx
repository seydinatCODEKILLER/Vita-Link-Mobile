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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useCntsDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/auth.store";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { BloodStockLevel, BloodType } from "@/src/types/shared.types";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { AppColors } from "@/src/theme/colors";
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

dayjs.extend(relativeTime);
dayjs.locale("fr");

// ─── Config Niveaux de Stock ──────────────────────────────
const getLevelConfig = (
  colors: AppColors,
): Record<BloodStockLevel, { label: string; color: string }> => ({
  CRITICAL: { label: "Critique", color: colors.red },
  LOW: { label: "Bas", color: colors.amber },
  ADEQUATE: { label: "Ok", color: colors.success },
  SURPLUS: { label: "Surplus", color: "#60A5FA" },
});

// ─── Calcul du niveau basé sur la quantité ──────────────────
const calculateStockLevel = (quantity: number): BloodStockLevel => {
  if (quantity === 0) return "CRITICAL";
  if (quantity <= 5) return "LOW"; // Ajustez ces seuils selon vos besoins
  if (quantity <= 30) return "ADEQUATE";
  return "SURPLUS";
};

// ─── StatCard ─────────────────────────────────────────────
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
      <View style={{ gap: 2 }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "900",
            letterSpacing: -0.5,
            color,
          }}
        >
          {value}
          {unit ? (
            <Text style={{ fontSize: 11, fontWeight: "600" }}> {unit}</Text>
          ) : null}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ─── BloodStockRow ────────────────────────────────────────
function BloodStockRow({
  bloodType,
  quantity,
  level: _serverLevel, // On renomme pour ignorer la valeur du serveur
  colors,
}: {
  bloodType: BloodType;
  quantity: number;
  level: BloodStockLevel;
  colors: AppColors;
}) {
  // ✅ On calcule le niveau localement en fonction de la quantité
  const level = calculateStockLevel(quantity);

  const LEVEL_CONFIG = getLevelConfig(colors);
  const { label, color } = LEVEL_CONFIG[level];
  const typeLabel = BLOOD_TYPE_LABELS[bloodType] ?? bloodType.replace("_", "");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 13,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.cardBorder,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
        <View
          style={{
            minWidth: 38,
            height: 38,
            borderRadius: 10,
            borderWidth: 0.5,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 6,
            backgroundColor: color + "12",
            borderColor: color + "28",
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: "900", color }}>
            {typeLabel}
          </Text>
        </View>
        <Text
          style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}
        >
          {label}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
        <Text style={{ fontSize: 19, fontWeight: "900", color }}>
          {quantity}
        </Text>
        <Text
          style={{ color: colors.textMuted, fontSize: 11, fontWeight: "500" }}
        >
          poches
        </Text>
      </View>
    </View>
  );
}

// ─── Skeleton Dashboard ──────────────────────────────────
function DashboardSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={{ paddingHorizontal: 20, gap: 22, opacity: 0.6 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 80,
              borderRadius: 14,
              borderWidth: 0.5,
              borderColor: colors.cardBorder,
              backgroundColor: colors.cardBg,
              padding: 12,
            }}
          />
        ))}
      </View>
      <View style={{ gap: 10 }}>
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.cardBorder,
            width: "30%",
          }}
        />
        <View
          style={{
            height: 120,
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: colors.cardBorder,
            backgroundColor: colors.cardBg,
          }}
        />
      </View>
    </View>
  );
}

// ─── Écran Principal ──────────────────────────────────────
export default function CntsDashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const isPending = useIsStructurePending();
  const tabBarHeight = useBottomTabBarHeight();

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useCntsDashboard(5);

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

  const handleCreateAlert = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Structure en attente",
        "Votre CNTS n'est pas encore approuvée. Vous pourrez créer des alertes dès validation.",
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/alerts/create?from=dashboard" as any);
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 20 },
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
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    statsGrid: { flexDirection: "row", gap: 6, marginBottom: 24 },
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
    empty: { alignItems: "center", padding: 24, gap: 8 },
    emptyText: { color: c.textMuted, fontSize: 13 },
    requestRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 13,
      borderBottomWidth: 0.5,
      borderBottomColor: c.cardBorder,
    },
    requestBadge: {
      width: 42,
      height: 42,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "40",
    },
    requestBadgeText: { color: c.white, fontSize: 13, fontWeight: "900" },
    requestInfo: { flex: 1, gap: 3 },
    requestHospital: { color: c.white, fontSize: 13, fontWeight: "700" },
    requestMeta: { color: c.textMuted, fontSize: 11 },
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
    fabWrap: { position: "absolute", right: 22 },
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
  }));

  if (isLoading && !dashboard) {
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

  if (isError && isNetworkError(error) && !dashboard) {
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
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  const kpis = dashboard?.kpis;
  const bloodStocks = dashboard?.bloodStocks ?? [];
  const recentRequests = dashboard?.recentRequests ?? [];

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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <ThemeToggle size={40} />
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.white}
              />
              {(kpis?.pendingRequests ?? 0) > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.red,
                    borderWidth: 1.5,
                    borderColor: colors.bg,
                  }}
                />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── KPIs Spécifiques CNTS ── */}
        <Animated.View style={[styles.statsGrid, { opacity: fadeAnim }]}>
          <StatCard
            icon="document-text-outline"
            label="Demandes"
            value={kpis?.pendingRequests ?? 0}
            color={colors.amber}
          />
          <StatCard
            icon="alert-circle-outline"
            label="Stock Critique"
            value={kpis?.criticalStocks ?? 0}
            color={colors.red}
          />
          <StatCard
            icon="radio-button-on-outline"
            label="Alertes"
            value={kpis?.activeAlerts ?? 0}
            color="#60A5FA"
          />
          <StatCard
            icon="water-outline"
            label="Dons Total"
            value={kpis?.totalDonations ?? 0}
            color={colors.success}
          />
        </Animated.View>

        {/* ── Stock de sang ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHead}>
            <Ionicons name="flask-outline" size={14} color={colors.red} />
            <Text style={styles.sectionLabel}>RÉSERVES DE SANG</Text>
            <TouchableOpacity
              onPress={() => router.push("/(health)/stock" as any)}
              style={{ marginLeft: "auto" }}
            >
              <Text
                style={{ color: colors.red, fontSize: 11, fontWeight: "600" }}
              >
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {bloodStocks.length > 0 ? (
              bloodStocks.map((stock) => (
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

        {/* ── Demandes Récentes des Hôpitaux ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHead}>
            <Ionicons name="business-outline" size={14} color={colors.amber} />
            <Text style={styles.sectionLabel}>DEMANDES EN ATTENTE</Text>
            <TouchableOpacity
              onPress={() =>
                router.push("/(health)/blood-requests/index" as any)
              }
              style={{ marginLeft: "auto" }}
            >
              <Text
                style={{ color: colors.red, fontSize: 11, fontWeight: "600" }}
              >
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {recentRequests.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={colors.success}
                />
                <Text style={styles.emptyText}>Aucune demande en attente</Text>
              </View>
            ) : (
              recentRequests.map((req) => {
                const isVital = req.urgencyLevel === "VITAL";
                return (
                  <TouchableOpacity
                    key={req.id}
                    style={styles.requestRow}
                    onPress={() =>
                      router.push(`/(health)/blood-requests/${req.id}` as any)
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.requestBadge}>
                      <Text style={styles.requestBadgeText}>
                        {BLOOD_TYPE_LABELS[req.bloodType] ??
                          req.bloodType.replace("_", "")}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        <Text style={styles.requestHospital} numberOfLines={1}>
                          {req.requestingHospital.name}
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
                      <Text style={styles.requestMeta}>
                        {req.quantityNeeded} poches ·{" "}
                        {dayjs(req.createdAt).fromNow()}
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

      {/* ── FAB Créer Alerte Pénurie ── */}
      <Animated.View
        style={[
          styles.fabWrap,
          { bottom: tabBarHeight + 20, transform: [{ scale: fabScale }] },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateAlert}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}
