import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert as RNAlert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useBloodRequests } from "@/src/hooks/useBloodRequests";
import { BloodRequestStatus } from "@/src/types/shared.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";

dayjs.extend(relativeTime);
dayjs.locale("fr");

type FilterType = "ALL" | BloodRequestStatus;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "FULFILLED", label: "Comblées" },
  { key: "ESCALATED_TO_ALERT", label: "Alertes" },
  { key: "CANCELLED", label: "Annulées" },
];

const getStatusConfig = (
  colors: AppColors,
): Record<
  BloodRequestStatus,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  PENDING: { label: "En attente", color: colors.amber, icon: "time-outline" },
  FULFILLED: {
    label: "Comblée",
    color: colors.success,
    icon: "checkmark-circle",
  },
  PARTIALLY_FULFILLED: {
    label: "Partielle",
    color: colors.blue,
    icon: "pie-chart-outline",
  },
  ESCALATED_TO_ALERT: {
    label: "Alerte lancée",
    color: colors.red,
    icon: "megaphone-outline",
  },
  REJECTED: {
    label: "Refusée",
    color: colors.textMuted,
    icon: "close-circle-outline",
  },
  CANCELLED: {
    label: "Annulée",
    color: colors.textMuted,
    icon: "close-circle",
  },
});

export default function HospitalBloodRequestsScreen() {
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const statusConfig = getStatusConfig(colors);
  const isPending = useIsStructurePending();

  const { data, isLoading, isRefetching, refetch } = useBloodRequests({
    status: activeFilter === "ALL" ? undefined : activeFilter,
    limit: 20,
  });

  const requests = data?.requests ?? [];

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
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
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
      marginBottom: 12,
      gap: 12,
    },
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
  }));

  const handleCreate = () => {
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      RNAlert.alert(
        "Structure en attente",
        "Votre établissement n'est pas encore approuvé.",
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(hospital)/blood-request/create" as any);
  };

  const renderItem = ({ item }: any) => {
    const config = statusConfig[item.status as BloodRequestStatus];
    const bloodLabel =
      BLOOD_TYPE_LABELS[item.bloodType] ?? item.bloodType.replace("_", "");
    const isVital = item.urgencyLevel === "VITAL";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/(hospital)/blood-request/${item.id}` as any);
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isVital
                ? "rgba(220,30,30,0.15)"
                : colors.amber + "1A",
              borderWidth: 1,
              borderColor: isVital
                ? "rgba(220,30,30,0.40)"
                : colors.amber + "4D",
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
            >
              {item.quantityNeeded} poches
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              {dayjs(item.createdAt).fromNow()}
            </Text>
          </View>

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

        {(item.status === "PARTIALLY_FULFILLED" ||
          item.status === "FULFILLED") && (
          <View style={{ gap: 6 }}>
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
                  width: `${Math.min(
                    (item.quantityProvided / item.quantityNeeded) * 100,
                    100,
                  )}%` as any,
                  backgroundColor:
                    item.status === "FULFILLED" ? colors.success : colors.blue,
                }}
              />
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              Fourni : {item.quantityProvided}/{item.quantityNeeded}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ gap: 2 }}>
          <Text style={styles.eyebrow}>APPROVISIONNEMENT</Text>
          <Text style={styles.headerTitle}>
            Demandes <Text style={{ color: colors.red }}>de sang</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filtres */}
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
                style={[styles.filterText, isActive && { color: colors.white }]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: tabBarHeight + 40,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="water-outline"
                size={48}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyTitle}>Aucune demande</Text>
              <Text style={styles.emptySub}>
                {activeFilter !== "ALL"
                  ? "Aucune demande avec ce statut."
                  : "Créez votre première demande de sang."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
