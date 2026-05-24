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
import { useAlertResponses, useCloseAlert } from "@/src/hooks/useAlerts";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { AlertResponseStatus } from "@/src/types/shared.types";
import { useSocket } from "@/src/hooks/useSocket";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";

const getResponseConfig = (
  colors: AppColors,
): Record<
  AlertResponseStatus,
  { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> => ({
  CONFIRMED: { label: "En route", icon: "walk-outline", color: colors.blue },
  ARRIVED: {
    label: "Arrivé",
    icon: "checkmark-circle-outline",
    color: colors.success,
  },
  DECLINED: {
    label: "Refusé",
    icon: "close-circle-outline",
    color: colors.red,
  },
  NO_SHOW: {
    label: "Absent",
    icon: "alert-circle-outline",
    color: colors.amber,
  },
  CANCELLED: {
    label: "Annulé",
    icon: "remove-circle-outline",
    color: colors.textMuted,
  },
});

// ─── Skeleton Dashboard ────────────────────────────────────────
function DashboardSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    line: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
  }));

  return (
    <View
      style={{ paddingHorizontal: 20, paddingTop: 10, gap: 20, opacity: 0.6 }}
    >
      <View
        style={[
          styles.cardBg,
          { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
        ]}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: colors.cardBorder,
          }}
        />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={[styles.line, { width: "50%" }]} />
          <View style={[styles.line, { width: "70%", height: 8 }]} />
        </View>
      </View>
      <View style={[styles.cardBg, { height: 120 }]} />
      <View style={{ gap: 8 }}>
        <View style={[styles.line, { width: "40%", height: 8 }]} />
        <View style={[styles.cardBg, { height: 200 }]} />
      </View>
    </View>
  );
}

// ─── SummaryCard ───────────────────────────────────────────────
function SummaryCard({
  confirmed,
  arrived,
  noShow,
  quantityNeeded,
  colors,
}: {
  confirmed: number;
  arrived: number;
  noShow: number;
  quantityNeeded: number;
  colors: AppColors;
}) {
  const progressPct =
    quantityNeeded > 0 ? ((confirmed + arrived) / quantityNeeded) * 100 : 0;
  const isQuotaReached = confirmed + arrived >= quantityNeeded;

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 18,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {[
          {
            icon: "walk-outline" as const,
            value: confirmed,
            label: "En route",
            color: colors.blue,
          },
          {
            icon: "checkmark-circle-outline" as const,
            value: arrived,
            label: "Arrivés",
            color: colors.success,
          },
          {
            icon: "alert-circle-outline" as const,
            value: noShow,
            label: "Absents",
            color: colors.amber,
          },
        ].map((item, i, arr) => (
          <React.Fragment key={item.label}>
            <View style={{ flex: 1, alignItems: "center", gap: 6 }}>
              <Ionicons name={item.icon} size={18} color={item.color} />
              <Text
                style={{ fontSize: 24, fontWeight: "900", color: item.color }}
              >
                {item.value}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </View>
            {i < arr.length - 1 && (
              <View
                style={{
                  width: 0.5,
                  height: 40,
                  backgroundColor: colors.cardBorder,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      <View style={{ gap: 8 }}>
        <Text
          style={{ color: colors.textMuted, fontSize: 13, fontWeight: "600" }}
        >
          Quota :{" "}
          <Text style={{ color: colors.white, fontWeight: "800" }}>
            {confirmed + arrived}
          </Text>{" "}
          / {quantityNeeded} donneurs
        </Text>
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
              borderRadius: 3,
              width: `${Math.min(progressPct, 100)}%` as any,
              backgroundColor: isQuotaReached ? colors.success : colors.red,
            }}
          />
        </View>
      </View>
    </View>
  );
}

// ─── DonorResponseRow ──────────────────────────────────────────
function DonorResponseRow({
  response,
  colors,
  responseConfig,
}: {
  response: any;
  colors: AppColors;
  responseConfig: ReturnType<typeof getResponseConfig>;
}) {
  const config =
    responseConfig[response.status as AlertResponseStatus] ??
    responseConfig.CONFIRMED;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.cardBorder,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.cardBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.white, fontSize: 14, fontWeight: "800" }}>
          {response.donor.firstName?.[0]}
          {response.donor.lastName?.[0]}
        </Text>
      </View>

      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: colors.white, fontSize: 14, fontWeight: "700" }}>
          {response.donor.firstName} {response.donor.lastName}
        </Text>
        {response.etaMinutes && response.status === "CONFIRMED" && (
          <Text style={{ color: colors.blue, fontSize: 12 }}>
            Arrive dans ~{response.etaMinutes} min
          </Text>
        )}
        {response.status === "ARRIVED" && response.arrivedAt && (
          <Text style={{ color: colors.success, fontSize: 12 }}>
            Arrivé il y a quelques instants
          </Text>
        )}
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 20,
          borderWidth: 0.5,
          backgroundColor: config.color + "26",
          borderColor: config.color + "4D",
        }}
      >
        <Ionicons name={config.icon} size={14} color={config.color} />
        <Text style={{ color: config.color, fontSize: 11, fontWeight: "700" }}>
          {config.label}
        </Text>
      </View>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function AlertDashboardScreen() {
  const router = useRouter();
  const { id: alertId } = useLocalSearchParams<{ id: string }>();
  const { socketRef } = useSocket();
  const colors = useColors();
  const responseConfig = getResponseConfig(colors);
  

  const { data, isLoading, isError, error, refetch } =
    useAlertResponses(alertId);

  const { mutateAsync: closeAlert, isPending: isClosing } = useCloseAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const hasNetworkError = isError && isNetworkError(error);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
    alertHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 16,
    },
    bloodBadge: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    bloodBadgeText: { color: c.white, fontSize: 18, fontWeight: "900" },
    alertInfo: { flex: 1, gap: 4 },
    alertTitle: { color: c.white, fontSize: 18, fontWeight: "800" },
    alertSub: { color: c.textMuted, fontSize: 13 },
    closedBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: 13,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 13,
    },
    closedBannerText: { fontSize: 13, fontWeight: "600" },
    listHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    listTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    responsesList: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    emptyState: { alignItems: "center", padding: 40, gap: 12 },
    emptyText: { color: c.textSubtle, fontSize: 13, textAlign: "center" },
    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: c.bg,
      borderTopWidth: 0.5,
      borderTopColor: c.cardBorder,
    },
    closeBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderWidth: 0.5,
      borderColor: c.red + "4D",
      backgroundColor: c.red + "0D",
      borderRadius: 16,
      paddingVertical: 16,
    },
    closeBtnDisabled: {
      opacity: 0.4,
      backgroundColor: "transparent",
      borderColor: colors.cardBorder,
    },
    closeBtnText: { color: c.red, fontSize: 16, fontWeight: "700" },
    errorText: { color: c.textMuted, fontSize: 16 },
    errorBack: {
      backgroundColor: c.red,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    errorBackText: { color: "#FFFFFF", fontWeight: "700" },
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useSocket();

  useEffect(() => {
    if (!alertId || !socketRef.current) return;
    const socket = socketRef.current;
    socket.emit("join:alert", { alertId });
    return () => {
      socket.emit("leave:alert", { alertId });
    };
  }, [alertId, socketRef]);

  const handleCloseAlert = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Fermer l'alerte ?",
      "Le quota est-il atteint ou l'urgence est-elle résolue ? Les donneurs en route seront notifiés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Fermer",
          style: "destructive",
          onPress: async () => {
            try {
              await closeAlert(alertId);
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible de fermer l'alerte.");
            }
          },
        },
      ],
    );
  };

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <DashboardSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Erreur API (404, etc.) ou données indisponibles ─────
  if (isError || !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.red} />
        <Text style={styles.errorText}>Données indisponibles</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorBack}
        >
          <Text style={styles.errorBackText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── 4. Rendu normal ─────────────────────────────────────────
  const { alert, responses, summary } = data;
  const isVital = alert.urgencyLevel === "VITAL";
  const isActive = alert.status === "ACTIVE";
  const closedColor =
    alert.status === "EXPIRED" ? colors.amber : colors.success;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
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
                      backgroundColor: "rgba(220,30,30,0.15)",
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
            colors={colors}
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
              {/* On ne montre le loader QUE si l'alerte est encore active */}
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
              {responses.map((resp: any) => (
                <DonorResponseRow
                  key={resp.id}
                  response={resp}
                  colors={colors}
                  responseConfig={responseConfig}
                />
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.closeBtn,
            (!isActive || isClosing) && styles.closeBtnDisabled,
          ]}
          onPress={() => {
            if (!isActive) {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
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
                color={colors.red}
              />
              <Text style={styles.closeBtnText}>
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
