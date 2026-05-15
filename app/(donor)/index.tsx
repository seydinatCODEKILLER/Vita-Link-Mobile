import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { useNearbyAlerts } from "@/src/hooks/useAlerts";
import { useUpdateAvailability } from "@/src/hooks/useAvailability";
import { AlertCard } from "@/src/components/alerts/AlertCard";
import { EmptyState } from "@/src/components/ui/EmptyState";

const COLORS = {
  bg: "#080808",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.50)",
  red: "#DC1E1E",
  filterBg: "rgba(255,255,255,0.06)",
  filterActiveBg: "rgba(220,30,30,0.15)",
  filterActiveBorder: "rgba(220,30,30,0.40)",
  filterBorder: "rgba(255,255,255,0.08)",
  green: "#1D9E75",
};

type FilterType = "ALL" | "VITAL" | "STANDARD";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "VITAL", label: "VITAL" },
  { key: "STANDARD", label: "Standard" },
];

export default function DonorHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const {
    data: alerts,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useNearbyAlerts();
  const { mutate: toggleAvailability } = useUpdateAvailability();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  // Filtrage côté client (les données arrivent déjà de React Query)
  const filteredAlerts = alerts?.filter((a) => {
    if (activeFilter === "ALL") return true;
    return a.urgencyLevel === activeFilter;
  });

  const handleAlertPress = useCallback(
    (alertId: string) => {
      router.push(`/(donor)/alerts/${alertId}` as any);
    },
    [router],
  );

  const handleQuickConfirm = useCallback(
    (alertId: string) => {
      // Pour l'instant on navigate vers le détail,
      // le bouton "J'y vais" complet sera géré à l'étape 11
      router.push(`/(donor)/alerts/${alertId}` as any);
    },
    [router],
  );

  if (isLoading && !alerts) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.red} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Bonjour {user?.firstName || ""} 👋
          </Text>
          <Text style={styles.subtitle}>Alertes proches</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* ── Disponibilité ── */}
      <View style={styles.availabilityRow}>
        <Ionicons name="heart-circle" size={20} color={COLORS.green} />
        <Text style={styles.availabilityText}>Disponible pour donner</Text>
        <Switch
          trackColor={{ false: "rgba(255,255,255,0.10)", true: COLORS.green }}
          thumbColor={
            user?.isAvailable ? COLORS.white : "rgba(255,255,255,0.40)"
          }
          value={user?.isAvailable ?? true}
          onValueChange={(val) => toggleAvailability(val)}
          style={{ marginLeft: "auto" }}
        />
      </View>

      {/* ── Filtres ── */}
      <View style={styles.filtersRow}>
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              style={[
                styles.filterPill,
                isActive && styles.filterPillActive,
                f.key === "VITAL" && isActive && styles.filterPillVital,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                  f.key === "VITAL" && isActive && styles.filterTextVital,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Liste ── */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={handleAlertPress}
            onConfirm={handleQuickConfirm}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        ListEmptyComponent={
          isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Erreur de connexion"
              subtitle="Tirez pour réessayer."
            />
          ) : (
            <EmptyState
              icon="heart-outline"
              title="Aucune alerte"
              subtitle="Vous serez notifié si un hôpital a besoin de vous."
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerLeft: { gap: 2 },
  greeting: { color: COLORS.white, fontSize: 22, fontWeight: "800" },
  subtitle: { color: COLORS.textMuted, fontSize: 14 },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Availability
  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(29,158,117,0.08)",
    borderWidth: 1,
    borderColor: "rgba(29,158,117,0.20)",
    gap: 10,
  },
  availabilityText: { color: COLORS.white, fontSize: 14, fontWeight: "600" },

  // Filters
  filtersRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.filterBorder,
    backgroundColor: COLORS.filterBg,
  },
  filterPillActive: {
    backgroundColor: COLORS.filterActiveBg,
    borderColor: COLORS.filterActiveBorder,
  },
  filterPillVital: {
    backgroundColor: "rgba(220,30,30,0.12)",
    borderColor: "rgba(220,30,30,0.35)",
  },
  filterText: { color: COLORS.textMuted, fontSize: 13, fontWeight: "600" },
  filterTextActive: { color: COLORS.white },
  filterTextVital: { color: COLORS.red },

  // List
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
});
