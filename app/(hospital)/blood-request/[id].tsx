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
import { useSmartBack } from "@/src/hooks/useSmartBack";
import dayjs from "dayjs";

// ─── Status Config ─────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap; colorKey: "success" | "red" | "amber" | "blue" | "textMuted" }
> = {
  PENDING: { label: "En attente CNTS", icon: "time-outline", colorKey: "amber" },
  FULFILLED: { label: "Demande comblée", icon: "checkmark-circle-outline", colorKey: "success" },
  PARTIALLY_FULFILLED: { label: "Partiellement comblée", icon: "git-compare-outline", colorKey: "blue" },
  ESCALATED_TO_ALERT: { label: "Alerte lancée", icon: "alert-circle-outline", colorKey: "red" },
  REJECTED: { label: "Refusée", icon: "close-circle-outline", colorKey: "textMuted" },
  CANCELLED: { label: "Annulée", icon: "remove-circle-outline", colorKey: "textMuted" },
};

// ─── Skeleton ──────────────────────────────────────────────────
function RequestDetailSkeleton() {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    line: { borderRadius: 5, backgroundColor: c.cardBorder },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 10, opacity: 0.55 }}>
      <View style={[styles.cardBg, { padding: 16, gap: 12 }]}>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View style={{ width: 62, height: 62, borderRadius: 16, backgroundColor: styles.line.backgroundColor }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={[styles.line, { height: 14, width: "55%" }]} />
            <View style={[styles.line, { height: 9, width: "35%" }]} />
          </View>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 9 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.cardBg, { flex: 1, height: 80, borderRadius: 14 }]} />
        ))}
      </View>
      <View style={[styles.cardBg, { height: 70, borderRadius: 13 }]} />
    </View>
  );
}

// ─── Notes Card ────────────────────────────────────────────────
function NotesCard({
  title,
  content,
  iconName,
  iconColor,
  iconBg,
  colors,
}: {
  title: string;
  content: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  colors: any;
}) {
  const styles = useThemedStyles((c) => ({
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
      gap: 9,
    },
    header: { flexDirection: "row", alignItems: "center", gap: 9 },
    iconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    label: { color: c.textMuted, fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
    divider: { height: 0.5, backgroundColor: c.cardBorder },
    text: { color: c.white, fontSize: 12, lineHeight: 19, opacity: 0.8 },
  }));

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={14} color={iconColor} />
        </View>
        <Text style={styles.label}>{title}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.text}>{content}</Text>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function BloodRequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();

  const goBack = useSmartBack({
    defaultRoute: "/(hospital)",
    routeMap: {
      dashboard: "/(hospital)",
      blood_request: "/(hospital)/blood-request",
    },
  });

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
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
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
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              goBack();
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
    centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 12,
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
    headerTitle: { color: c.white, fontSize: 17, fontWeight: "700" },
    // ── Hero Card ──
    heroCard: {
      borderRadius: 20,
      borderWidth: 0.5,
      padding: 18,
      overflow: "hidden",
      position: "relative",
    },
    heroGlow: {
      position: "absolute",
      top: -36,
      right: -36,
      width: 130,
      height: 130,
      borderRadius: 65,
      opacity: 0.5,
    },
    heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
    bloodBadge: {
      width: 62,
      height: 62,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    bloodBadgeText: { color: c.white, fontSize: 22, fontWeight: "900", lineHeight: 25 },
    bloodBadgeSub: { fontSize: 9, fontWeight: "700", letterSpacing: 0.6, marginTop: 2 },
    heroQty: { color: c.white, fontSize: 20, fontWeight: "800", letterSpacing: -0.5 },
    heroDesc: { color: c.textMuted, fontSize: 12, marginTop: 2 },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 0.5,
      marginTop: 9,
    },
    statusPillText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
    // ── Info Grid ──
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
    },
    infoCard: {
      width: "47.5%",
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 13,
    },
    infoIcon: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 9,
    },
    infoLabel: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.5,
      marginBottom: 5,
    },
    infoValueRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
    infoValue: { color: c.white, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
    infoValueSm: { fontSize: 14, fontWeight: "700" },
    infoUnit: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
    // ── Alert Banner ──
    alertBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      borderRadius: 13,
      borderWidth: 0.5,
      padding: 12,
    },
    alertIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    alertTitle: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
    alertSub: { color: c.textMuted, fontSize: 11, lineHeight: 16 },
    // ── Cancel Button ──
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      borderWidth: 0.5,
      borderColor: c.red + "4D",
      backgroundColor: c.red + "0D",
      borderRadius: 16,
      paddingVertical: 16,
      marginTop: 4,
    },
    cancelBtnDisabled: { opacity: 0.4 },
    cancelBtnText: { color: c.red, fontSize: 15, fontWeight: "700" },
  }));

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          goBack();
        }}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={19} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Détail demande</Text>
      <View style={{ width: 38 }} />
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          {renderHeader()}
        </View>
        <RequestDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (isError && isNetworkError(error)) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          {renderHeader()}
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!request) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={{ color: colors.textMuted, fontSize: 15 }}>
          Demande introuvable
        </Text>
      </View>
    );
  }

  const isVital = request.urgencyLevel === "VITAL";
  const isPending = request.status === "PENDING";
  const isEscalated = request.status === "ESCALATED_TO_ALERT";
  const isFulfilled = request.status === "FULFILLED";

  const bloodLabel =
    BLOOD_TYPE_LABELS[request.bloodType] ??
    request.bloodType.replaceAll("_", " ");

  const escalatedAlert = request.escalatedAlert;

  const statusEntry = STATUS_CONFIG[request.status] ?? STATUS_CONFIG.PENDING;
  const statusColor = colors[statusEntry.colorKey] ?? colors.textMuted;

  // Accent color based on urgency
  const accentColor = isVital ? "rgba(220,30,30,1)" : colors.amber;
  const accentBg = isVital ? "rgba(220,30,30,0.07)" : colors.amber + "0D";
  const accentBorder = isVital ? "rgba(220,30,30,0.28)" : colors.amber + "38";
  const accentBadgeBg = isVital ? "rgba(220,30,30,0.14)" : colors.amber + "1A";
  const accentBadgeBorder = isVital ? "rgba(220,30,30,0.38)" : colors.amber + "4D";

  const formattedDate = request.createdAt
    ? dayjs(request.createdAt).format("DD MMM")
    : "—";

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
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            gap: 10,
          }}
        >
          {renderHeader()}

          {/* ── Hero Card ── */}
          <View
            style={[
              styles.heroCard,
              { backgroundColor: accentBg, borderColor: accentBorder },
            ]}
          >
            <View style={[styles.heroGlow, { backgroundColor: accentBg }]} />
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.bloodBadge,
                  { backgroundColor: accentBadgeBg, borderWidth: 0.5, borderColor: accentBadgeBorder },
                ]}
              >
                <Text style={styles.bloodBadgeText}>{bloodLabel}</Text>
                {isVital && (
                  <Text style={[styles.bloodBadgeSub, { color: accentColor }]}>
                    RARE
                  </Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroQty}>
                  {request.quantityNeeded} Poches
                </Text>
                <Text style={styles.heroDesc}>
                  {request.bloodType.replaceAll("_", " ")}
                </Text>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: statusColor + "14",
                      borderColor: statusColor + "38",
                    },
                  ]}
                >
                  <Ionicons name={statusEntry.icon} size={11} color={statusColor} />
                  <Text style={[styles.statusPillText, { color: statusColor }]}>
                    {statusEntry.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── Info Grid 2×2 ── */}
          <View style={styles.infoGrid}>
            {/* Demandé */}
            <View style={styles.infoCard}>
              <View style={[styles.infoIcon, { backgroundColor: colors.red + "20" }]}>
                <Ionicons name="water-outline" size={15} color={colors.red} />
              </View>
              <Text style={styles.infoLabel}>DEMANDÉ</Text>
              <View style={styles.infoValueRow}>
                <Text style={styles.infoValue}>{request.quantityNeeded}</Text>
                <Text style={styles.infoUnit}>poches</Text>
              </View>
            </View>

            {/* Fourni */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      (request.quantityProvided ?? 0) > 0
                        ? colors.success + "20"
                        : colors.textMuted + "20",
                  },
                ]}
              >
                <Ionicons
                  name="checkmark-done-outline"
                  size={15}
                  color={
                    (request.quantityProvided ?? 0) > 0
                      ? colors.success
                      : colors.textMuted
                  }
                />
              </View>
              <Text style={styles.infoLabel}>FOURNI</Text>
              <View style={styles.infoValueRow}>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color:
                        (request.quantityProvided ?? 0) > 0
                          ? colors.success
                          : colors.textMuted,
                    },
                  ]}
                >
                  {request.quantityProvided ?? 0}
                </Text>
                <Text style={styles.infoUnit}>poches</Text>
              </View>
            </View>

            {/* Urgence */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: (isVital ? colors.red : colors.amber) + "20" },
                ]}
              >
                <Ionicons
                  name="flash-outline"
                  size={15}
                  color={isVital ? colors.red : colors.amber}
                />
              </View>
              <Text style={styles.infoLabel}>URGENCE</Text>
              <Text
                style={[
                  styles.infoValueSm,
                  { color: isVital ? colors.red : colors.amber },
                ]}
              >
                {isVital ? "VITALE" : "STANDARD"}
              </Text>
            </View>

            {/* Date */}
            <View style={styles.infoCard}>
              <View
                style={[
                  styles.infoIcon,
                  { backgroundColor: (colors.blue ?? "#0A84FF") + "20" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={colors.blue ?? "#0A84FF"}
                />
              </View>
              <Text style={styles.infoLabel}>CRÉÉE LE</Text>
              <Text style={{ color: colors.white, fontSize: 14, fontWeight: "600" }}>
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* ── Bannière Escalade Alerte ── */}
          {isEscalated && escalatedAlert && (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(hospital)/alerts/${escalatedAlert.id}?from=blood_request_detail` as any,
                )
              }
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.alertBanner,
                  {
                    backgroundColor: colors.red + "0D",
                    borderColor: colors.red + "28",
                  },
                ]}
              >
                <View
                  style={[
                    styles.alertIconWrap,
                    { backgroundColor: colors.red + "1A" },
                  ]}
                >
                  <Ionicons name="megaphone-outline" size={17} color={colors.red} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.alertTitle, { color: colors.red }]}>
                    Alerte donneurs active
                  </Text>
                  <Text style={styles.alertSub}>
                    La CNTS a lancé un appel d&apos;urgence. Touchez pour suivre.
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          )}

          {/* ── Notes CNTS ── */}
          {request.cntsNotes && (
            <NotesCard
              title="NOTES DE LA CNTS"
              content={request.cntsNotes}
              iconName="document-text-outline"
              iconColor={colors.blue ?? "#0A84FF"}
              iconBg={(colors.blue ?? "#0A84FF") + "1A"}
              colors={colors}
            />
          )}

          {/* ── Contexte Clinique ── */}
          {request.clinicalContext && (
            <NotesCard
              title="CONTEXTE CLINIQUE"
              content={request.clinicalContext}
              iconName="fitness-outline"
              iconColor={colors.amber}
              iconBg={colors.amber + "1A"}
              colors={colors}
            />
          )}

          {/* ── Bouton Annuler ── */}
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
                  <Text style={styles.cancelBtnText}>Annuler la demande</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}