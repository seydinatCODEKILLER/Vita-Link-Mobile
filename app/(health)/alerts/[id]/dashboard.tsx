import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";

import { DashboardSkeleton } from "@/src/components/alerts/DashboardSkeleton";
import { DonorResponseRow } from "@/src/components/alerts/DonorResponseRow";
import { SummaryCard } from "@/src/components/alerts/SummaryCard";
import { useAlertDashboardScreen } from "@/src/hooks/useAlertDashboardScreen";
import { useAlertDashboardStyles } from "@/src/styles/useAlertDashboardStyles";

const VITAL_COLOR = {
  bg: "rgba(220,30,30,0.15)",
  border: "rgba(220,30,30,0.40)",
} as const;

export default function AlertDashboardScreen() {
  const {
    data,
    isLoading,
    isError,
    hasNetworkError,
    refetch,
    isClosing,
    fadeAnim,
    goBack,
    handleCloseAlert,
    isVital,
    isActive,
    closedColor,
  } = useAlertDashboardScreen();

  const { styles, footerPaddingBottom, colors } = useAlertDashboardStyles();

  // ── 1. Chargement initial (Skeleton) ────────────────────────
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ──────────────────────────────
  if (hasNetworkError && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Erreur API ou données indisponibles ───────────────────
  if (isError || !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.red} />
        <Text style={styles.errorText}>Données indisponibles</Text>
        <TouchableOpacity onPress={goBack} style={styles.errorBack}>
          <Text style={styles.errorBackText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── 4. Rendu normal ──────────────────────────────────────────
  const { alert, responses, summary } = data;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 20 }}>
          {/* ── Header Alerte ── */}
          <View style={styles.alertHeader}>
            <View
              style={[
                styles.bloodBadge,
                isVital
                  ? {
                      backgroundColor: VITAL_COLOR.bg,
                      borderWidth: 0.5,
                      borderColor: VITAL_COLOR.border,
                    }
                  : {
                      backgroundColor: colors.amber + "1A",
                      borderWidth: 0.5,
                      borderColor: colors.amber + "4D",
                    },
              ]}
            >
              <Text style={styles.bloodBadgeText}>
                {BLOOD_TYPE_LABELS[alert.bloodType] ??
                  alert.bloodType.replace("_", "")}
              </Text>
            </View>

            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>
                {isVital ? "Urgence Vitale" : "Alerte Standard"}
              </Text>
              <Text style={styles.alertSub}>{alert.healthStructure.name}</Text>
            </View>

            {/* Indicateur actif */}
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: isActive
                  ? isVital
                    ? colors.red
                    : colors.success
                  : colors.textSubtle,
              }}
            />
          </View>

          {/* ── Résumé ── */}
          <SummaryCard
            confirmed={summary.confirmed}
            arrived={summary.arrived}
            noShow={summary.noShow}
            quantityNeeded={alert.quantityNeeded}
          />

          {/* ── Bannière clôture ── */}
          {!isActive && (
            <View style={styles.closedBanner}>
              <Ionicons
                name="checkmark-done-circle-outline"
                size={20}
                color={closedColor}
              />
              <Text style={[styles.closedBannerText, { color: closedColor }]}>
                Alerte {alert.status === "EXPIRED" ? "expirée" : "clôturée"} —
                lecture seule
              </Text>
            </View>
          )}

          {/* ── Titre liste ── */}
          <View style={styles.listHeader}>
            <Ionicons name="people-outline" size={16} color={colors.white} />
            <Text style={styles.listTitle}>RÉPONSES EN TEMPS RÉEL</Text>
          </View>

          {/* ── Réponses ── */}
          {responses.length === 0 ? (
            <View style={styles.emptyState}>
              {isActive && (
                <ActivityIndicator color={colors.textSubtle} size="small" />
              )}
              <Ionicons
                name={
                  isActive ? "time-outline" : "checkmark-done-circle-outline"
                }
                size={24}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyText}>
                {isActive
                  ? "En attente de réponses des donneurs..."
                  : "Aucun donneur ne s'est présenté pour cette alerte."}
              </Text>
            </View>
          ) : (
            <View style={styles.responsesList}>
              {responses.map((resp) => (
                <DonorResponseRow key={resp.id} response={resp} />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { paddingBottom: footerPaddingBottom }]}>
        <TouchableOpacity
          style={[
            styles.closeBtn,
            (!isActive || isClosing) && styles.closeBtnDisabled,
          ]}
          onPress={() => {
            if (!isActive) {
              return;
            }
            handleCloseAlert();
          }}
          disabled={!isActive || isClosing}
          activeOpacity={0.8}
        >
          {isClosing ? (
            <ActivityIndicator color={colors.red} size="small" />
          ) : (
            <>
              <Ionicons
                name={isActive ? "close-circle-outline" : "lock-closed-outline"}
                size={20}
                color={isActive ? colors.red : colors.textMuted}
              />
              <Text
                style={[
                  styles.closeBtnText,
                  !isActive && { color: colors.textMuted },
                ]}
              >
                {isActive
                  ? "Fermer l'alerte"
                  : alert.status === "EXPIRED"
                    ? "Alerte expirée"
                    : "Alerte clôturée"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
