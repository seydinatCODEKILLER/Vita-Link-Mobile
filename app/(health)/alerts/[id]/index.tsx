import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { useIsCnts } from "@/src/hooks/useAuthStore";
import { useColors } from "@/src/theme/useTheme";

import { AlertDetailHeader } from "@/src/components/alerts/AlertDetailHeader";
import { AlertDetailSkeleton } from "@/src/components/alerts/AlertDetailSkeleton";
import { AlertHeroCard } from "@/src/components/alerts/AlertHeroCard";
import { AlertInfoGrid } from "@/src/components/alerts/AlertInfoGrid";
import { AlertProgressCard } from "@/src/components/alerts/AlertProgressCard";
import { EscalationBanner } from "@/src/components/alerts/EscalationBanner";
import { useAlertDetailScreen } from "@/src/hooks/useAlertDetailScreen";
import { useAlertDetailStyles } from "@/src/styles/useAlertDetailStyles";

export default function AlertDetailScreen() {
  const { id: alertId } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();
  const isCnts = useIsCnts();
  const styles = useAlertDetailStyles();

  const {
    alert,
    isLoading,
    hasNetworkError,
    refetch,
    fadeAnim,
    slideAnim,
    isVital,
    isActive,
    isExpired,
    bloodLabel,
    formattedExpiresAt,
    progressPct,
    statusColor,
    handleGoToDashboard,
  } = useAlertDetailScreen(alertId);

  // ── 1. Chargement initial (Skeleton) ────────────────────────
  if (isLoading && !alert) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AlertDetailHeader />
        <AlertDetailSkeleton />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ──────────────────────────────
  if (hasNetworkError && !alert) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <AlertDetailHeader />
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Alerte introuvable ────────────────────────────────────
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

  // ── 4. Rendu normal ──────────────────────────────────────────
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
          <AlertDetailHeader />

          <AlertHeroCard
            bloodLabel={bloodLabel}
            hospitalName={alert.healthStructure?.name ?? "Structure"}
            serviceUnit={alert.serviceUnit}
            isVital={isVital}
            isActive={isActive}
            isExpired={isExpired}
            statusColor={statusColor}
          />

          {alert.origin === "CNTS_ESCALATION" && <EscalationBanner />}

          <AlertInfoGrid
            quantityNeeded={alert.quantityNeeded}
            formattedExpiresAt={formattedExpiresAt}
          />

          <AlertProgressCard
            quantityConfirmed={alert.quantityConfirmed}
            quantityNeeded={alert.quantityNeeded}
            progressPct={progressPct}
          />

          {/* Dashboard temps réel (CNTS uniquement) */}
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

          {/* Alerte terminée */}
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
