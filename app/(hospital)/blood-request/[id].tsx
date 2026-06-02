import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  useBloodRequestDetail,
  useCancelBloodRequest,
} from "@/src/hooks/useBloodRequests";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export default function BloodRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const {
    data: request,
    isLoading,
    isError,
    error,
    refetch,
  } = useBloodRequestDetail(id);
  const { mutateAsync: cancelRequest, isPending: isCancelling } =
    useCancelBloodRequest();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCancel = () => {
    if (!request) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Annuler la demande ?",
      "Cette action est irréversible. La CNTS sera notifiée de votre annulation.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelRequest(request.id);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              router.back();
            } catch (err: any) {
              Alert.alert(
                "Erreur",
                err?.response?.data?.message || "Impossible d'annuler.",
              );
            }
          },
        },
      ],
    );
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 10,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    heroCard: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 0.5,
      padding: 18,
      gap: 14,
      overflow: "hidden",
      position: "relative",
    },
    heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
    bloodBadge: {
      width: 58,
      height: 58,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    infoCard: {
      flex: 1,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
      gap: 6,
    },
    infoLabel: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    infoValue: {
      color: c.white,
      fontSize: 18,
      fontWeight: "900",
      letterSpacing: -0.3,
    },
    alertBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "30",
      borderRadius: 12,
      padding: 12,
    },
    alertIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.red + "1F",
      alignItems: "center",
      justifyContent: "center",
    },
    alertBannerTitle: { color: c.red, fontSize: 12, fontWeight: "700" },
    alertBannerSub: { color: c.textMuted, fontSize: 11 },
    notesCard: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
      gap: 8,
    },
    notesTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1,
    },
    notesText: { color: c.white, fontSize: 13, lineHeight: 20 },
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 0.5,
      borderColor: c.red + "4D",
      backgroundColor: c.red + "0D",
      borderRadius: 16,
      paddingVertical: 16,
      marginTop: 8,
    },
    cancelBtnDisabled: { opacity: 0.4 },
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.red} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError && isNetworkError(error)) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={[styles.header, { paddingHorizontal: 20 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={colors.textMuted}
        />
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>
          Demande introuvable
        </Text>
      </View>
    );
  }

  const isVital = request.urgencyLevel === "VITAL";
  const isPending = request.status === "PENDING";
  const isEscalated = request.status === "ESCALATED_TO_ALERT";
  const bloodLabel =
    BLOOD_TYPE_LABELS[request.bloodType] ??
    request.bloodType.replaceAll("_", " ");
  const escalatedAlert = request.escalatedAlert;

  // Config Statut
  const statusConfig: Record<string, { label: string; color: string }> = {
    PENDING: { label: "En attente CNTS", color: colors.amber },
    FULFILLED: { label: "Demande Comblée", color: colors.success },
    PARTIALLY_FULFILLED: { label: "Partiellement Comblée", color: colors.blue },
    ESCALATED_TO_ALERT: { label: "Alerte Lancée", color: colors.red },
    REJECTED: { label: "Refusée", color: colors.textMuted },
    CANCELLED: { label: "Annulée", color: colors.textMuted },
  };
  const currentStatus = statusConfig[request.status] ?? statusConfig.PENDING;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: tabBarHeight + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, gap: 12 }}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={19} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Détail Demande</Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Hero Card */}
          <View
            style={[
              styles.heroCard,
              {
                borderColor: isVital
                  ? "rgba(220,30,30,0.30)"
                  : colors.amber + "38",
              },
            ]}
          >
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.bloodBadge,
                  isVital
                    ? {
                        backgroundColor: "rgba(220,30,30,0.14)",
                        borderWidth: 0.5,
                        borderColor: "rgba(220,30,30,0.40)",
                      }
                    : {
                        backgroundColor: colors.amber + "1A",
                        borderWidth: 0.5,
                        borderColor: colors.amber + "4D",
                      },
                ]}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 20,
                    fontWeight: "900",
                  }}
                >
                  {bloodLabel}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  {request.quantityNeeded} Poches
                </Text>
                <Text
                  style={{
                    color: currentStatus.color,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {currentStatus.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Info Grid */}
          <View style={{ flexDirection: "row", gap: 9 }}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>FOURNI</Text>
              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      request.quantityProvided > 0
                        ? colors.success
                        : colors.textMuted,
                  },
                ]}
              >
                {request.quantityProvided ?? 0}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>URGENCE</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isVital ? colors.red : colors.amber, fontSize: 14 },
                ]}
              >
                {isVital ? "VITALE" : "STANDARD"}
              </Text>
            </View>
          </View>

          {/* Bannière Escalade Alerte */}
          {isEscalated && escalatedAlert && (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(hospital)/alerts/${escalatedAlert.id}` as any)
              }
              activeOpacity={0.7}
            >
              <View style={styles.alertIconWrap}>
                <Ionicons
                  name="megaphone-outline"
                  size={16}
                  color={colors.red}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.alertBannerTitle}>
                  Alerte Donneurs Active
                </Text>
                <Text style={styles.alertBannerSub}>
                  La CNTS a lancé un appel d&apos;urgence. Cliquez pour suivre.
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={colors.textSubtle}
              />
            </TouchableOpacity>
          )}

          {/* Notes CNTS */}
          {request.cntsNotes && (
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>NOTES DE LA CNTS</Text>
              <Text style={styles.notesText}>{request.cntsNotes}</Text>
            </View>
          )}

          {/* Contexte Clinique */}
          {request.clinicalContext && (
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>VOTRE CONTEXTE CLINIQUE</Text>
              <Text style={styles.notesText}>{request.clinicalContext}</Text>
            </View>
          )}

          {/* Bouton Annuler */}
          {isPending && (
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                isCancelling && styles.cancelBtnDisabled,
              ]}
              onPress={handleCancel}
              disabled={isCancelling}
              activeOpacity={0.8}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.red} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={colors.red}
                  />
                  <Text
                    style={{
                      color: colors.red,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Annuler la demande
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
