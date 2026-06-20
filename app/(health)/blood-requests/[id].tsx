import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import BloodRequestHandleSheet from "@/src/components/ui/BloodRequestHandleSheet";
import { RequestDetailSkeleton } from "@/src/components/blood-requests/RequestDetailSkeleton";
import { RequestDetailHero } from "@/src/components/blood-requests/RequestDetailHero";
import { useBloodRequestDetailScreen } from "@/src/hooks/useBloodRequestDetailScreen";
import { useBloodRequestDetailStyles } from "@/src/hooks/useBloodRequestDetailStyles";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function BloodRequestDetailScreen() {
  const {
    id,
    isCnts,
    isSheetVisible,
    setIsSheetVisible,
    goBack,
    fadeAnim,
    request,
    refetch,
    isCancelling,
    handleCancel,
    handleOpenSheet,
    hasNetworkError,
    isNotFound,
    showSkeleton,
    canHandle,
    isVital,
    isPending,
    progressPct,
  } = useBloodRequestDetailScreen();

  const { styles, colors, tabBarHeight } = useBloodRequestDetailStyles();

  // ── 1. Erreur réseau SANS data en cache ──
  if (hasNetworkError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            Détail de la demande
          </Text>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur 404 ou autre (non réseau) SANS data ──
  if (isNotFound) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            Détail de la demande
          </Text>
        </View>
        <Text style={styles.emptyText}>Demande introuvable</Text>
      </SafeAreaView>
    );
  }

  // ── 3. Rendu principal ──
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarHeight + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Nav header ── */}
        <Animated.View style={[styles.navHeader, { opacity: fadeAnim }]}>
          <TouchableOpacity onPress={() => goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.navTitle} numberOfLines={1}>
            Détail de la demande
          </Text>
        </Animated.View>

        {/* ── Skeleton ou Contenu ── */}
        {showSkeleton ? (
          <RequestDetailSkeleton />
        ) : (
          request && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ── Hero card ── */}
              <RequestDetailHero
                request={request}
                isVital={isVital}
                isPending={isPending}
                progressPct={progressPct}
              />

              {/* ── Info card: hospital + date ── */}
              <View style={styles.infoCard}>
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Hôpital demandeur</Text>
                  <Text style={styles.infoValue}>
                    {request.requestingHospital.name}
                  </Text>
                  {request.requestingHospital.address && (
                    <Text style={styles.infoSub}>
                      {request.requestingHospital.address}
                    </Text>
                  )}
                </View>
                <View style={styles.separator} />
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>Date de la demande</Text>
                  <Text style={styles.infoValue}>
                    {dayjs(request.createdAt).fromNow()}
                  </Text>
                  <Text style={styles.infoSub}>
                    {dayjs(request.createdAt).format("D MMM YYYY, HH[h]mm")}
                  </Text>
                </View>
              </View>

              {/* ── Contexte clinique ── */}
              {request.clinicalContext && (
                <View style={styles.contextCard}>
                  <Text style={[styles.sectionTitle, { color: colors.red }]}>
                    Contexte clinique
                  </Text>
                  <Text style={styles.sectionText}>
                    {request.clinicalContext}
                  </Text>
                </View>
              )}

              {/* ── Notes CNTS ── */}
              {request.cntsNotes && (
                <View style={styles.notesCard}>
                  <Text
                    style={[styles.sectionTitle, { color: colors.success }]}
                  >
                    Notes CNTS
                  </Text>
                  <Text style={styles.sectionText}>{request.cntsNotes}</Text>
                </View>
              )}

              {/* ── Cancel button ── */}
              {!isCnts && isPending && (
                <TouchableOpacity
                  onPress={handleCancel}
                  disabled={isCancelling}
                  activeOpacity={0.75}
                  style={styles.cancelBtn}
                >
                  {isCancelling ? (
                    <ActivityIndicator color={colors.red} size="small" />
                  ) : (
                    <Ionicons
                      name="close-circle-outline"
                      size={18}
                      color={colors.red}
                    />
                  )}
                  <Text
                    style={{
                      color: colors.red,
                      fontWeight: "700",
                      fontSize: 14,
                    }}
                  >
                    Annuler cette demande
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )
        )}
      </ScrollView>

      {/* ── FAB Traiter (CNTS) ── */}
      {canHandle && (
        <TouchableOpacity
          onPress={handleOpenSheet}
          style={[styles.fab, { bottom: tabBarHeight + 20 }]}
        >
          <Ionicons name="construct-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
            Traiter
          </Text>
        </TouchableOpacity>
      )}

      {/* ✅ On ne monte le Sheet QUE si request est défini */}
      {request && (
        <BloodRequestHandleSheet
          visible={isSheetVisible}
          onClose={() => setIsSheetVisible(false)}
          requestId={id}
          request={request}
        />
      )}
    </SafeAreaView>
  );
}
