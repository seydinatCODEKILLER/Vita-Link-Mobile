import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { alertsApi } from "@/src/api/alerts.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { Alert } from "@/src/types/alert.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { AlertStatus } from "@/src/types/shared.types";

dayjs.extend(relativeTime);
dayjs.locale("fr");

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

// ─── Filtres & Config ─────────────────────────────────────────
type FilterType = "ALL" | AlertStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "ACTIVE", label: "Actives" },
  { key: "QUOTA_REACHED", label: "Quota atteint" },
  { key: "EXPIRED", label: "Expirées" },
  { key: "CANCELLED", label: "Annulées" },
];

const STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  ACTIVE: { label: "En cours", color: COLORS.red, icon: "pulse" },
  QUOTA_REACHED: {
    label: "Quota atteint",
    color: COLORS.green,
    icon: "checkmark-done-circle",
  },
  EXPIRED: { label: "Expirée", color: COLORS.amber, icon: "time" },
  CANCELLED: {
    label: "Annulée",
    color: COLORS.textMuted,
    icon: "close-circle",
  },
};

// ─── Composant Alerte Card ────────────────────────────────────
function StructureAlertCard({
  alert,
  onPress,
}: {
  alert: Alert;
  onPress: (id: string) => void;
}) {
  const config = STATUS_CONFIG[alert.status];
  const bloodLabel =
    BLOOD_TYPE_LABELS[alert.bloodType] ?? alert.bloodType.replace("_", "");
  const isVital = alert.urgencyLevel === "VITAL";
  const progressPct =
    alert.quantityNeeded > 0
      ? Math.min((alert.quantityConfirmed / alert.quantityNeeded) * 100, 100)
      : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(alert.id)}
      activeOpacity={0.7}
    >
      {/* Top Row */}
      <View style={styles.cardTop}>
        <View
          style={[
            styles.bloodBadge,
            isVital ? styles.badgeVital : styles.badgeStd,
          ]}
        >
          <Text style={styles.bloodBadgeText}>{bloodLabel}</Text>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {isVital ? "Urgence Vitale" : "Alerte Standard"}
          </Text>
          <Text style={styles.cardSub}>{dayjs(alert.createdAt).fromNow()}</Text>
        </View>

        {/* Status Pill */}
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: config.color + "14",
              borderColor: config.color + "30",
            },
          ]}
        >
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.statusPillText, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
      </View>

      {/* Progress Row */}
      <View style={styles.progressRow}>
        <View style={styles.progressInfo}>
          <Ionicons name="people-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.progressText}>
            <Text style={{ color: COLORS.white, fontWeight: "700" }}>
              {alert.quantityConfirmed}
            </Text>
            /{alert.quantityNeeded} donneurs
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPct}%`,
                backgroundColor:
                  alert.status === "QUOTA_REACHED" ? COLORS.green : COLORS.red,
              },
            ]}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function HealthAlertsScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
    refetch,
  } = useInfiniteQuery({
    queryKey: [...QUERY_KEYS.myAlerts, activeFilter],
    queryFn: ({ pageParam = 1 }) =>
      alertsApi.getMyStructure({
        page: pageParam,
        limit: 15,
        status: activeFilter === "ALL" ? undefined : activeFilter,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 15_000,
  });

  // Aplatir les pages en une seule liste
  const alerts: Alert[] = data?.pages.flatMap((p) => p.alerts) ?? [];

  const handleAlertPress = useCallback(
    (alertId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(health)/alerts/${alertId}/dashboard` as any);
    },
    [router],
  );

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(health)/alerts/create" as any);
  };

  const renderFooter = () =>
    isFetchingNextPage ? (
      <View style={styles.loaderMore}>
        <ActivityIndicator color={COLORS.red} size="small" />
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ gap: 2 }}>
          <Text style={styles.eyebrow}>CENTRE DE COMMANDEMENT</Text>
          <Text style={styles.headerTitle}>
            Nos <Text style={{ color: COLORS.red }}>Alertes</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* ── Filtres ── */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                setActiveFilter(f.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.filterText, isActive && styles.filterTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Liste ── */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.red} size="large" />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StructureAlertCard alert={item} onPress={handleAlertPress} />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={48}
                color={COLORS.textSubtle}
              />
              <Text style={styles.emptyTitle}>Aucune alerte</Text>
              <Text style={styles.emptySub}>
                {activeFilter !== "ALL"
                  ? "Aucune alerte avec ce statut."
                  : "Créez votre première alerte d'urgence."}
              </Text>
            </View>
          }
        />
      )}

      {/* ── FAB Créer (au cas où l'utilisateur scrolle vite) ── */}
      <TouchableOpacity
        style={[styles.fab, { bottom: tabBarHeight + 24 }]}
        onPress={handleCreate}
        activeOpacity={0.85}
      >
        <Ionicons name="alert-circle-outline" size={24} color={COLORS.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  eyebrow: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  // Filters
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
  },
  filterPillActive: {
    backgroundColor: "rgba(220,30,30,0.12)",
    borderColor: "rgba(220,30,30,0.35)",
  },
  filterText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: COLORS.white,
  },

  // Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bloodBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  bloodBadgeText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
  },
  cardInfo: { flex: 1, gap: 2 },
  cardTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  cardSub: { color: COLORS.textMuted, fontSize: 12 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  statusPillText: { fontSize: 10, fontWeight: "700" },

  // Progress
  progressRow: { gap: 8 },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 2 },

  // Empty
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  emptySub: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Loader
  loaderMore: { paddingVertical: 20, alignItems: "center" },

  // FAB
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 10,
  },
});
