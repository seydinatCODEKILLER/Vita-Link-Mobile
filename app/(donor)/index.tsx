import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { Href, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import {
  useActiveEngagement,
  useCancelConfirmation,
  useNearbyAlerts,
} from "@/src/hooks/useAlerts";
import { useUpdateAvailability } from "@/src/hooks/useAvailability";
import { AlertCard } from "@/src/components/alerts/AlertCard";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { ActiveEngagement, Alert as AlertType } from "@/src/types/alert.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { getPendingQr, PendingQr } from "@/src/utils/qr.utils";
import { isNetworkError } from "@/src/utils/error.utils";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { useBloodTypeBanner } from "@/src/hooks/usebloodtypebanner";
import { useIsEligible } from "@/src/hooks/useAuthStore";

type FilterType = "ALL" | "VITAL" | "STANDARD";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "VITAL", label: "Vital" },
  { key: "STANDARD", label: "Standard" },
];

// ─── Skeleton card ─────────────────────────────────────────────
function SkeletonCard({ colors }: { colors: AppColors }) {
  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 14,
        marginBottom: 12,
        opacity: 0.6,
      }}
    >
      <View style={{ flexDirection: "row", gap: 14, marginBottom: 10 }}>
        <View
          style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            backgroundColor: colors.cardBorder,
          }}
        />
        <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
          <View
            style={{
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.cardBorder,
              width: "90%",
            }}
          />
          <View
            style={{
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.cardBorder,
              width: "60%",
              opacity: 0.4,
            }}
          />
          <View
            style={{
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.cardBorder,
              width: "80%",
              opacity: 0.3,
            }}
          />
        </View>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.cardBorder,
          marginTop: 4,
        }}
      />
    </View>
  );
}

// ─── AlertsStats ───────────────────────────────────────────────
function AlertsStats({
  total,
  vital,
  colors,
}: {
  total: number;
  vital: number;
  colors: AppColors;
}) {
  if (total === 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 20,
        marginBottom: 14,
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        paddingVertical: 10,
      }}
    >
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ color: colors.white, fontSize: 20, fontWeight: "800" }}>
          {total}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
          alerte{total > 1 ? "s" : ""}
        </Text>
      </View>
      <View
        style={{ width: 1, height: 28, backgroundColor: colors.cardBorder }}
      />
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text
          style={{
            color: vital > 0 ? colors.red : colors.success,
            fontSize: 20,
            fontWeight: "800",
          }}
        >
          {vital}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
          vitale{vital > 1 ? "s" : ""}
        </Text>
      </View>
    </View>
  );
}

// ─── BloodTypeBanner ───────────────────────────────────────────
function BloodTypeBanner({
  onPress,
  colors,
}: {
  onPress: () => void;
  colors: AppColors;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginHorizontal: 20,
        marginBottom: 14,
        backgroundColor: colors.amber + "12",
        borderWidth: 1.5,
        borderColor: colors.amber + "40",
        borderRadius: 16,
        paddingVertical: 13,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: colors.amber + "20",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name="water-outline" size={20} color={colors.amber} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={{ color: colors.amber, fontSize: 13, fontWeight: "700" }}>
          Groupe sanguin manquant
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, lineHeight: 16 }}>
          Renseignez-le pour recevoir les alertes compatibles.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.amber} />
    </TouchableOpacity>
  );
}

// ─── EngagementBanner ─────────────────────────────────────────
function EngagementBanner({
  engagement,
  isExpired = false,
  onPress,
  colors,
}: {
  engagement: ActiveEngagement | PendingQr;
  isExpired?: boolean;
  onPress: () => void;
  colors: AppColors;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const isLocalQr = "hospitalName" in engagement;
  const hospitalName = isLocalQr
    ? (engagement as PendingQr).hospitalName
    : (engagement as ActiveEngagement).alert.healthStructure.name;
  const bloodLabel = isLocalQr
    ? (engagement as PendingQr).bloodType
    : (BLOOD_TYPE_LABELS[(engagement as ActiveEngagement).alert.bloodType] ??
      (engagement as ActiveEngagement).alert.bloodType.replace("_", ""));

  const accentColor = isExpired ? colors.amber : colors.red;

  return (
    <Animated.View
      style={{
        marginHorizontal: 20,
        marginBottom: 16,
        transform: [{ scale: pulseAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          borderRadius: 18,
          borderWidth: 1.5,
          overflow: "hidden",
          borderColor: accentColor + "30",
          backgroundColor: accentColor + "07",
          shadowColor: colors.red,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 14,
          elevation: 8,
        }}
      >
        <View
          style={{ height: 3, backgroundColor: accentColor, opacity: 0.85 }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <View style={{ position: "relative", flexShrink: 0 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: accentColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="qr-code-outline" size={26} color="#FFFFFF" />
            </View>
            <View
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                borderRadius: 7,
                borderWidth: 2,
                borderColor: colors.bg,
                paddingHorizontal: 5,
                paddingVertical: 1,
                backgroundColor: isExpired ? colors.amber : colors.success,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 9,
                  fontWeight: "800",
                  letterSpacing: 0.5,
                }}
              >
                {isExpired ? "RETARD" : "LIVE"}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, gap: 4, minWidth: 0 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{ color: accentColor, fontSize: 14, fontWeight: "700" }}
              >
                {isExpired ? "Retard — Pass Classique" : "Vous êtes attendu !"}
              </Text>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: accentColor,
                }}
              />
            </View>
            <Text
              style={{ color: colors.textMuted, fontSize: 12 }}
              numberOfLines={1}
            >
              {hospitalName} • {bloodLabel}
            </Text>
          </View>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: "rgba(255,255,255,0.07)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color="rgba(255,255,255,0.60)"
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function DonorHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const colors = useColors();
  const { showBanner } = useBloodTypeBanner();
  const { isEligible, daysLeft } = useIsEligible();

  const {
    data: alerts,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useNearbyAlerts();
  const { mutate: toggleAvailability, isPending: isTogglingAvail } =
    useUpdateAvailability();
  const { data: activeEngagement } = useActiveEngagement();
  const { mutateAsync: cancelConfirmation } = useCancelConfirmation();

  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");
  const [localQr, setLocalQr] = useState<PendingQr | null>(null);
  const [isLocalExpired, setIsLocalExpired] = useState(false);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 100 : 80,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    greeting: { color: c.textMuted, fontSize: 13, fontWeight: "500" },
    headerTitle: {
      color: c.white,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    bellBtn: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    bellBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: c.bg,
      paddingHorizontal: 3,
    },
    bellBadgeText: { color: c.white, fontSize: 10, fontWeight: "800" },
    availRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 20,
      marginBottom: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
    },
    availRowOn: {
      backgroundColor: "rgba(29,158,117,0.08)",
      borderColor: "rgba(29,158,117,0.22)",
    },
    availRowOff: { backgroundColor: c.cardBg, borderColor: c.cardBorder },
    availLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    availDot: { width: 8, height: 8, borderRadius: 4 },
    availDotOn: { backgroundColor: c.success },
    availDotOff: { backgroundColor: c.textSubtle },
    availTitle: { color: c.white, fontSize: 13, fontWeight: "700" },
    availSub: { color: c.textMuted, fontSize: 11, marginTop: 1 },
    ghostBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: "rgba(220,30,30,0.08)",
      borderWidth: 1.5,
      borderColor: "rgba(220,30,30,0.30)",
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    ghostTextBlock: { flex: 1, gap: 4 },
    ghostTitle: { color: c.red, fontSize: 14, fontWeight: "700" },
    ghostSub: { color: c.textMuted, fontSize: 12, lineHeight: 16 },
    ghostCancelBtn: {
      backgroundColor: c.red,
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 10,
      flexShrink: 0,
    },
    ghostCancelText: { color: c.white, fontSize: 12, fontWeight: "700" },
    filtersRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 14,
      gap: 8,
    },
    filterPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    filterPillActive: {
      backgroundColor: "rgba(220,30,30,0.12)",
      borderColor: "rgba(220,30,30,0.35)",
    },
    filterPillVital: {
      backgroundColor: "rgba(220,30,30,0.15)",
      borderColor: "rgba(220,30,30,0.40)",
    },
    filterDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.textSubtle,
    },
    filterDotActive: { backgroundColor: c.red },
    filterText: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    filterTextActive: { color: c.white },
    filterTextVital: { color: c.red },
    filterCount: { marginLeft: "auto" },
    filterCountText: { color: c.textSubtle, fontSize: 11 },
  }));

  useEffect(() => {
    const loadLocalQr = async () => {
      const qr = await getPendingQr();
      if (qr) {
        setLocalQr(qr);
        setIsLocalExpired(false);
      } else {
        setLocalQr(null);
        setIsLocalExpired(!!(activeEngagement?.alert?.id && user?.id));
      }
    };
    loadLocalQr();
  }, [activeEngagement, user?.id]);

  const displayedEngagement = activeEngagement
    ? { type: "active" as const, data: activeEngagement }
    : localQr
      ? { type: "expired" as const, data: localQr }
      : null;

  const filteredAlerts: AlertType[] =
    alerts?.filter(
      (a) => activeFilter === "ALL" || a.urgencyLevel === activeFilter,
    ) ?? [];

  const vitalCount =
    alerts?.filter((a) => a.urgencyLevel === "VITAL").length ?? 0;

  const handleOpenQrCode = useCallback(
    (qrCode: string, alertId: string, isExpired: boolean) =>
      router.push({
        pathname: "/(donor)/qrcode" as any,
        params: { qrCode, alertId, isExpired: isExpired ? "true" : "false" },
      }),
    [router],
  );

  const handleAlertPress = useCallback(
    (alertId: string) => router.push(`/(donor)/alerts/${alertId}` as Href),
    [router],
  );

  const handleCancelDirect = async (alertId: string) => {
    Alert.alert(
      "Annuler cet engagement ?",
      "Votre pass a expiré. Si vous n'êtes pas à l'hôpital, annulez pour redevenir disponible.",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            await cancelConfirmation(alertId);
            setIsLocalExpired(false);
          },
        },
      ],
    );
  };

  const handleQuickConfirm = useCallback(
    (alertId: string) => router.push(`/(donor)/alerts/${alertId}` as Href),
    [router],
  );

  // ── 1. Loading skeleton ───────────────────────────────────────
  if (isLoading && !alerts) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Alertes <Text style={{ color: colors.red }}>proches</Text>
            </Text>
          </View>
        </View>
        <View style={styles.listContent}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} colors={colors} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ───────────────────────────────
  if (isError && !alerts && isNetworkError(error)) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View style={{ gap: 3 }}>
            <Text style={styles.greeting}>Bonjour {user?.firstName} 👋</Text>
            <Text style={styles.headerTitle}>
              Alertes <Text style={{ color: colors.red }}>proches</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
            <Ionicons
              name="notifications-outline"
              size={21}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ───────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
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
        ListHeaderComponent={
          <View>
            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={{ gap: 3 }}>
                <Text style={styles.greeting}>
                  Bonjour {user?.firstName} 👋
                </Text>
                <Text style={styles.headerTitle}>
                  Alertes <Text style={{ color: colors.red }}>proches</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color={colors.white}
                />
                {vitalCount > 0 && (
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{vitalCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* ── Disponibilité ── */}
            <TouchableOpacity
              activeOpacity={isEligible ? 0.85 : 1}
              style={[
                styles.availRow,
                !isEligible
                  ? styles.availRowOff
                  : user?.isAvailable
                    ? styles.availRowOn
                    : styles.availRowOff,
                !isEligible && { opacity: 0.55 },
              ]}
              onPress={() =>
                isEligible && toggleAvailability(!user?.isAvailable)
              }
              disabled={isTogglingAvail || !isEligible}
            >
              <View style={styles.availLeft}>
                <View
                  style={[
                    styles.availDot,
                    isEligible && user?.isAvailable
                      ? styles.availDotOn
                      : styles.availDotOff,
                  ]}
                />
                <View>
                  <Text style={styles.availTitle}>
                    {!isEligible
                      ? "Période de repos"
                      : user?.isAvailable
                        ? "Disponible pour donner"
                        : "Non disponible"}
                  </Text>
                  <Text style={styles.availSub}>
                    {!isEligible
                      ? `Éligible dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""} — toggle désactivé`
                      : user?.isAvailable
                        ? "Vous recevez les alertes push"
                        : "Les alertes sont suspendues"}
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: colors.cardBorder, true: colors.success }}
                thumbColor={colors.cardBg}
                value={isEligible && (user?.isAvailable ?? true)}
                onValueChange={(val) => toggleAvailability(val)}
                disabled={!isEligible}
              />
            </TouchableOpacity>

            {/* ── Bannière groupe sanguin manquant ── */}
            {showBanner && (
              <BloodTypeBanner
                colors={colors}
                onPress={() => router.push("/(donor)/profile/edit" as any)}
              />
            )}

            {/* ── Engagement actif ── */}
            {displayedEngagement && !isLocalExpired && (
              <EngagementBanner
                engagement={displayedEngagement.data}
                isExpired={displayedEngagement.type === "expired"}
                colors={colors}
                onPress={() => {
                  const alertId =
                    displayedEngagement.type === "active"
                      ? (displayedEngagement.data as ActiveEngagement).alert.id
                      : (displayedEngagement.data as PendingQr).alertId;
                  handleOpenQrCode(
                    displayedEngagement.data.qrCode,
                    alertId,
                    displayedEngagement.type === "expired",
                  );
                }}
              />
            )}

            {/* ── Ghost banner ── */}
            {isLocalExpired && activeEngagement?.alert?.id && (
              <View style={styles.ghostBanner}>
                <View style={styles.ghostTextBlock}>
                  <Text style={styles.ghostTitle}>Engagement non validé</Text>
                  <Text style={styles.ghostSub}>
                    Votre pass a expiré. Annulez pour redevenir disponible.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.ghostCancelBtn}
                  onPress={() => handleCancelDirect(activeEngagement.alert.id)}
                >
                  <Text style={styles.ghostCancelText}>Libérer</Text>
                </TouchableOpacity>
              </View>
            )}

            <AlertsStats
              total={alerts?.length ?? 0}
              vital={vitalCount}
              colors={colors}
            />

            {/* ── Filtres ── */}
            <View style={styles.filtersRow}>
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.key;
                const isVitalFilter = f.key === "VITAL";
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setActiveFilter(f.key)}
                    activeOpacity={0.75}
                    style={[
                      styles.filterPill,
                      isActive && styles.filterPillActive,
                      isActive && isVitalFilter && styles.filterPillVital,
                    ]}
                  >
                    {isVitalFilter && (
                      <View
                        style={[
                          styles.filterDot,
                          isActive && styles.filterDotActive,
                        ]}
                      />
                    )}
                    <Text
                      style={[
                        styles.filterText,
                        isActive && styles.filterTextActive,
                        isActive && isVitalFilter && styles.filterTextVital,
                      ]}
                    >
                      {f.label}
                      {f.key === "VITAL" && vitalCount > 0
                        ? ` (${vitalCount})`
                        : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>
                  {filteredAlerts.length} résultat
                  {filteredAlerts.length > 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          isError ? (
            <EmptyState
              icon="cloud-offline-outline"
              title="Erreur de chargement"
              subtitle="Tirez vers le bas pour réessayer."
            />
          ) : (
            <EmptyState
              icon="heart-outline"
              title="Aucune alerte dans votre zone"
              subtitle="Vous serez notifié dès qu'un hôpital a besoin de votre groupe sanguin."
            />
          )
        }
      />
    </SafeAreaView>
  );
}
