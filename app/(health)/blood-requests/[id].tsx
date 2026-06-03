import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import {
  useBloodRequestDetail,
  useCancelBloodRequest,
} from "@/src/hooks/useBloodRequests";
import { useIsCnts } from "@/src/hooks/useAuthStore";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";
import BloodRequestHandleSheet from "@/src/components/ui/BloodRequestHandleSheet";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

// ─── Skeleton Détail ──────────────────────────────────────
function DetailSkeleton({ colors }: { colors: any }) {
  return (
    <View style={{ paddingHorizontal: 20, gap: 12, opacity: 0.5 }}>
      {/* Mimic Hero Card */}
      <View
        style={{
          height: 240,
          borderRadius: 20,
          borderWidth: 1.5,
          borderColor: colors.cardBorder,
          backgroundColor: colors.cardBg,
          overflow: "hidden",
        }}
      >
        <View style={{ height: 3, backgroundColor: colors.cardBorder }} />
      </View>
      {/* Mimic Info Card */}
      <View
        style={{
          height: 150,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: colors.cardBorder,
          backgroundColor: colors.cardBg,
        }}
      />
    </View>
  );
}

// ─── Écran Principal ──────────────────────────────────────
export default function BloodRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const isCnts = useIsCnts();
  const tabBarHeight = useBottomTabBarHeight();
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const goBack = useSmartBack({
    defaultRoute: "/(health)/blood-requests",
    routeMap: {
      list: "/(health)/blood-requests",
      dashboard: "/(health)",
    },
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useBloodRequestDetail(id);
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelBloodRequest();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCancel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Annuler la demande ?", "Cette action est irréversible.", [
      { text: "Non", style: "cancel" },
      {
        text: "Oui, annuler",
        style: "destructive",
        onPress: async () => {
          await cancelRequest(id);
          router.back();
        },
      },
    ]);
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    navHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 12,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    navTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: -0.3,
      flex: 1,
    },
    heroCard: {
      marginHorizontal: 20,
      marginBottom: 14,
      borderRadius: 20,
      backgroundColor: c.cardBg,
      borderWidth: 1.5,
      borderColor: c.red + "28",
      overflow: "hidden",
    },
    infoCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 18,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    infoSection: { padding: 16 },
    infoLabel: {
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.8,
      color: c.textSubtle,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    infoValue: {
      color: c.white,
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 3,
    },
    infoSub: { color: c.textSubtle, fontSize: 12 },
    separator: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginHorizontal: 16,
    },
    contextCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 14,
      backgroundColor: c.red + "08",
      borderWidth: 1,
      borderColor: c.red + "18",
      padding: 14,
    },
    notesCard: {
      marginHorizontal: 20,
      marginBottom: 12,
      borderRadius: 14,
      backgroundColor: c.success + "07",
      borderWidth: 1,
      borderColor: c.success + "18",
      padding: 14,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.9,
      textTransform: "uppercase",
      marginBottom: 7,
    },
    sectionText: {
      color: c.textMuted,
      fontSize: 13,
      lineHeight: 20,
    },
    cancelBtn: {
      marginHorizontal: 20,
      marginTop: 4,
      marginBottom: 20, // ✅ AJOUT : marge basse pour le bouton annuler
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: c.red + "0D",
      borderWidth: 1,
      borderColor: c.red + "28",
    },
    fab: {
      position: "absolute",
      right: 22,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 18,
      backgroundColor: c.red,
      shadowColor: c.red,
      shadowOpacity: 0.35,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    emptyText: { color: c.white, textAlign: "center", marginTop: 40 },
  }));

  // ── 1. Erreur réseau SANS data en cache ──
  if (isError && isNetworkError(error) && !request) {
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
  if (isError && !request) {
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

  // ── 3. Chargement initial SANS data en cache ──
  const showSkeleton = isLoading && !request;

  // Si on a la data, on la prépare
  const isPending = request?.status === "PENDING";
  const canHandle = isCnts && isPending;
  const isVital = request?.urgencyLevel === "VITAL";
  const progressPct = request
    ? request.quantityProvided > 0
      ? Math.min(
          Math.round((request.quantityProvided / request.quantityNeeded) * 100),
          100,
        )
      : 0
    : 0;
  const statusLabel = isPending
    ? "En attente"
    : request?.status.replace(/_/g, " ");
  const statusColor = isPending ? colors.amber : colors.success;

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
          <DetailSkeleton colors={colors} />
        ) : (
          request && (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* ── Hero card ── */}
              <View style={styles.heroCard}>
                <View style={{ height: 3, backgroundColor: colors.red }} />
                <View style={{ padding: 18 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.red,
                        fontSize: 52,
                        fontWeight: "900",
                        letterSpacing: -3,
                        lineHeight: 52,
                      }}
                    >
                      {request.bloodType.replace("_", "")}
                    </Text>
                    <View style={{ alignItems: "flex-end", gap: 8 }}>
                      {isVital && (
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: colors.red + "14",
                            borderWidth: 1,
                            borderColor: colors.red + "30",
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            borderRadius: 9,
                          }}
                        >
                          <Ionicons name="flash" size={11} color={colors.red} />
                          <Text
                            style={{
                              color: colors.red,
                              fontSize: 10,
                              fontWeight: "900",
                              letterSpacing: 0.8,
                            }}
                          >
                            VITAL
                          </Text>
                        </View>
                      )}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          backgroundColor: statusColor + "14",
                          paddingHorizontal: 11,
                          paddingVertical: 5,
                          borderRadius: 20,
                        }}
                      >
                        <View
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: statusColor,
                          }}
                        />
                        <Text
                          style={{
                            color: statusColor,
                            fontSize: 10,
                            fontWeight: "700",
                          }}
                        >
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: 28,
                        fontWeight: "900",
                        letterSpacing: -1,
                      }}
                    >
                      {request.quantityNeeded}
                    </Text>
                    <Text
                      style={{
                        color: colors.textSubtle,
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      poches nécessaires
                    </Text>
                  </View>

                  {request.quantityProvided > 0 && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 14,
                      }}
                    >
                      <View
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: 4,
                          backgroundColor: colors.success,
                        }}
                      />
                      <Text
                        style={{
                          color: colors.success,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {request.quantityProvided} poches déjà fournies
                      </Text>
                    </View>
                  )}

                  {request.quantityProvided > 0 && (
                    <View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            letterSpacing: 0.6,
                            color: colors.textSubtle,
                            textTransform: "uppercase",
                          }}
                        >
                          Progression
                        </Text>
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: "700",
                            color: colors.success,
                          }}
                        >
                          {progressPct}%
                        </Text>
                      </View>
                      <View
                        style={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: colors.cardBorder,
                          overflow: "hidden",
                        }}
                      >
                        <View
                          style={{
                            height: "100%",
                            width: `${progressPct}%`,
                            borderRadius: 3,
                            backgroundColor: colors.success,
                          }}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </View>

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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsSheetVisible(true);
          }}
          style={[styles.fab, { bottom: tabBarHeight + 20 }]}
        >
          <Ionicons name="construct-outline" size={20} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
            Traiter
          </Text>
        </TouchableOpacity>
      )}

      {/* ✅ CORRECTION : On ne monte le Sheet QUE si request est défini */}
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
