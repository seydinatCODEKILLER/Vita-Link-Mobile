import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

import { useCntsDashboard } from "@/src/hooks/useDashboard";
import { useAuthStore } from "@/src/store/auth.store";
import { useColors } from "@/src/theme/useTheme";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { isNetworkError } from "@/src/utils/error.utils";

import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { StatCard } from "@/src/components/dashboard/StatCard";
import {
  BloodStockRow,
  DashboardSkeleton,
} from "@/src/components/dashboard/BloodStockRow";
import { useDashboardScreen } from "@/src/hooks/useDashboardScreen";
import { useDashboardStyles } from "@/src/styles/useDashboardStyles";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function CntsDashboardScreen() {
  const router = useRouter();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const tabBarHeight = useBottomTabBarHeight();

  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
  } = useCntsDashboard(5);
  const { fabScale, fadeAnim, handleCreateAlert } = useDashboardScreen();

  const styles = useDashboardStyles();

  // ── Header commun (réutilisé dans les états loading/error) ─────────────────
  const Header = (
    <View>
      <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
      <Text style={styles.headerTitle}>
        Tableau <Text style={{ color: colors.red }}>de bord</Text>
      </Text>
    </View>
  );

  if (isLoading && !dashboard) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>{Header}</View>
        <DashboardSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  if (isError && isNetworkError(error) && !dashboard) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>{Header}</View>
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
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          {Header}
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

        {/* ── KPIs ────────────────────────────────────────────────────────── */}
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

        {/* ── Réserves de sang ─────────────────────────────────────────────── */}
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

        {/* ── Demandes en attente ──────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.sectionHead}>
            <Ionicons name="business-outline" size={14} color={colors.amber} />
            <Text style={styles.sectionLabel}>DEMANDES EN ATTENTE</Text>
            <TouchableOpacity
              onPress={() => router.push("/(health)/blood-requests" as any)}
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

      {/* ── FAB ─────────────────────────────────────────────────────────────── */}
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
