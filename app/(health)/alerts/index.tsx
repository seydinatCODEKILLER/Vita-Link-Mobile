import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { alertsApi } from "@/src/api/alerts.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { Alert as AlertType } from "@/src/types/alert.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { AlertOrigin, AlertStatus } from "@/src/types/shared.types";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

dayjs.extend(relativeTime);
dayjs.locale("fr");

type FilterType = "ALL" | AlertStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "ACTIVE", label: "Actives" },
  { key: "QUOTA_REACHED", label: "Quota atteint" },
  { key: "EXPIRED", label: "Expirées" },
  { key: "CANCELLED", label: "Annulées" },
];

const getStatusConfig = (
  colors: AppColors,
): Record<
  AlertStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  ACTIVE: { label: "En cours", color: colors.red, icon: "pulse" },
  QUOTA_REACHED: {
    label: "Quota atteint",
    color: colors.success,
    icon: "checkmark-done-circle",
  },
  EXPIRED: { label: "Expirée", color: colors.amber, icon: "time" },
  CANCELLED: {
    label: "Annulée",
    color: colors.textMuted,
    icon: "close-circle",
  },
});

// Ajoute cette config pour l'origine
const getOriginConfig = (
  colors: AppColors,
): Record<
  AlertOrigin,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  CNTS_DIRECT: {
    label: "Direct",
    color: colors.red,
    icon: "flash",
  },
  CNTS_ESCALATION: {
    label: "Escalade",
    color: colors.amber,
    icon: "arrow-up-circle",
  },
  HOSPITAL_DIRECT: {
    label: "Hôpital",
    color: colors.textMuted,
    icon: "business",
  },
});

// ─── Alert Card ────────────────────────────────────────────────
function StructureAlertCard({
  alert,
  onPress,
  colors,
  statusConfig,
}: {
  alert: AlertType;
  onPress: (id: string) => void;
  colors: AppColors;
  statusConfig: ReturnType<typeof getStatusConfig>;
}) {
  const config = statusConfig[alert.status];
  const originConfig = getOriginConfig(colors); // ✅ Nouveau
  const bloodLabel =
    BLOOD_TYPE_LABELS[alert.bloodType] ?? alert.bloodType.replace("_", "");
  const isVital = alert.urgencyLevel === "VITAL";
  const progressPct =
    alert.quantityNeeded > 0
      ? Math.min((alert.quantityConfirmed / alert.quantityNeeded) * 100, 100)
      : 0;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 14,
        marginBottom: 12,
        gap: 12,
      }}
      onPress={() => onPress(alert.id)}
      activeOpacity={0.7}
    >
      {/* Top Row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            ...(isVital
              ? {
                  backgroundColor: "rgba(220,30,30,0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(220,30,30,0.40)",
                }
              : {
                  backgroundColor: colors.amber + "1A",
                  borderWidth: 1,
                  borderColor: colors.amber + "4D",
                }),
          }}
        >
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: "900" }}
          >
            {bloodLabel}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text
            style={{ color: colors.white, fontSize: 15, fontWeight: "700" }}
            numberOfLines={1}
          >
            {isVital ? "Urgence Vitale" : "Alerte Standard"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {dayjs(alert.createdAt).fromNow()}
          </Text>
        </View>

        {/* ✅ NOUVEAU : Badge d'Origine (Escalade vs Direct) */}
        {alert.origin === "CNTS_ESCALATION" && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 3,
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 0.5,
              backgroundColor: originConfig.CNTS_ESCALATION.color + "14",
              borderColor: originConfig.CNTS_ESCALATION.color + "30",
              marginRight: 4,
            }}
          >
            <Ionicons
              name="arrow-up-circle"
              size={10}
              color={originConfig.CNTS_ESCALATION.color}
            />
            <Text
              style={{
                color: originConfig.CNTS_ESCALATION.color,
                fontSize: 9,
                fontWeight: "700",
              }}
            >
              Escalade
            </Text>
          </View>
        )}

        {/* Badge Statut */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            borderWidth: 0.5,
            backgroundColor: config.color + "14",
            borderColor: config.color + "30",
          }}
        >
          <Ionicons name={config.icon} size={12} color={config.color} />
          <Text
            style={{ color: config.color, fontSize: 10, fontWeight: "700" }}
          >
            {config.label}
          </Text>
        </View>
      </View>

      {/* Progress Row (Inchangé) */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text
            style={{ color: colors.textMuted, fontSize: 12, fontWeight: "500" }}
          >
            <Text style={{ color: colors.white, fontWeight: "700" }}>
              {alert.quantityConfirmed}
            </Text>
            /{alert.quantityNeeded} donneurs
          </Text>
        </View>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.cardBorder,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              borderRadius: 2,
              width: `${progressPct}%` as any,
              backgroundColor:
                alert.status === "QUOTA_REACHED" ? colors.success : colors.red,
            }}
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
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const isPending = useIsStructurePending();
  const statusConfig = getStatusConfig(colors);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    listContent: { paddingHorizontal: 20, paddingTop: 10 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 14,
    },
    eyebrow: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    headerTitle: {
      color: c.white,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    createBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    createBtnDisabled: { backgroundColor: c.cardBg, shadowOpacity: 0 },
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
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    filterPillActive: {
      backgroundColor: "rgba(220,30,30,0.12)",
      borderColor: "rgba(220,30,30,0.35)",
    },
    filterText: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    filterTextActive: { color: c.white },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyTitle: { color: c.white, fontSize: 18, fontWeight: "700" },
    emptySub: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    loaderMore: { paddingVertical: 20, alignItems: "center" },
    fab: {
      position: "absolute",
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 14,
      elevation: 10,
    },
    fabDisabled: { backgroundColor: c.cardBg, shadowOpacity: 0 },
  }));

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
      if (lastPage.pagination.page < lastPage.pagination.totalPages)
        return lastPage.pagination.page + 1;
      return undefined;
    },
    staleTime: 15_000,
  });

  const alerts: AlertType[] = data?.pages.flatMap((p) => p.alerts) ?? [];

  const handleAlertPress = useCallback(
    (alertId: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(health)/alerts/${alertId}/dashboard` as any);
    },
    [router],
  );

  const handleCreate = () => {
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
    router.push("/(health)/alerts/create" as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ gap: 2 }}>
          <Text style={styles.eyebrow}>CENTRE DE COMMANDEMENT</Text>
          <Text style={styles.headerTitle}>
            Nos <Text style={{ color: colors.red }}>Alertes</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createBtn, isPending && styles.createBtnDisabled]}
          onPress={handleCreate}
          activeOpacity={isPending ? 0.6 : 0.8}
        >
          <Ionicons
            name="add"
            size={22}
            color={isPending ? colors.textSubtle : "#FFFFFF"}
          />
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
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StructureAlertCard
              alert={item}
              onPress={handleAlertPress}
              colors={colors}
              statusConfig={statusConfig}
            />
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
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.loaderMore}>
                <ActivityIndicator color={colors.red} size="small" />
              </View>
            ) : null
          }
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={48}
                color={colors.textSubtle}
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

      {/* ── FAB ── */}
      <TouchableOpacity
        style={[
          styles.fab,
          { bottom: tabBarHeight + 24 },
          isPending && styles.fabDisabled,
        ]}
        onPress={handleCreate}
        activeOpacity={isPending ? 0.6 : 0.85}
      >
        <Ionicons
          name="alert-circle-outline"
          size={24}
          color={isPending ? colors.textSubtle : "#FFFFFF"}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
