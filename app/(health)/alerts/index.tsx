import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

import { useColors } from "@/src/theme/useTheme";
import { FILTERS, getStatusConfig } from "@/src/constants/alertsList";
import { StructureAlertCard } from "@/src/components/alerts/StructureAlertCard";
import { useStructureAlerts } from "@/src/hooks/useStructureAlerts";
import { useAlertsListStyles } from "@/src/hooks/useAlertsListStyles";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function HealthAlertsScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();
  const statusConfig = getStatusConfig(colors);
  const styles = useAlertsListStyles();

  const {
    alerts,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
    activeFilter,
    handleFilterChange,
    handleAlertPress,
    handleCreate,
    isPending,
  } = useStructureAlerts();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
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

      {/* ── Filtres ─────────────────────────────────────────────────────────── */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => handleFilterChange(f.key)}
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

      {/* ── Liste ───────────────────────────────────────────────────────────── */}
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

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
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
