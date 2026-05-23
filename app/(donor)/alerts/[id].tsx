import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Haptics from "expo-haptics";
import { useIsEligible } from "@/src/hooks/useAuthStore";
import {
  useActiveEngagement,
  useAlert,
  useCancelConfirmation,
  useConfirmAlert,
  useDeclineAlert,
  useHasActiveConfirmation,
} from "@/src/hooks/useAlerts";
import {
  formatBloodType,
  formatServiceUnit,
  formatDistance,
  getTimeRemaining,
  formatRelative,
} from "@/src/utils/format.utils";
import { savePendingQr } from "@/src/utils/qr.utils";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";
// ✅ AJOUT : Imports pour la gestion d'erreur réseau
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";

// ─── InfoRow ───────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  valueColor,
  colors,
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
  colors: AppColors;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          backgroundColor: colors.cardBg,
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name={icon} size={16} color={colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{ color: colors.textMuted, fontSize: 11, marginBottom: 2 }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: valueColor ?? colors.white,
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

// ─── Modal ETA ─────────────────────────────────────────────────
function EtaModal({
  visible,
  onClose,
  onConfirm,
  isLoading,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (eta?: number) => void;
  isLoading: boolean;
  colors: AppColors;
}) {
  const [etaText, setEtaText] = useState("");

  const handleConfirm = () => {
    const eta = etaText.trim() ? parseInt(etaText) : undefined;
    onConfirm(eta && !isNaN(eta) ? eta : undefined);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingBottom: Platform.OS === "ios" ? 40 : 28,
            paddingTop: 12,
            borderTopWidth: 1,
            borderColor: colors.cardBorder,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.textSubtle,
              marginBottom: 24,
            }}
          />

          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: "rgba(220,30,30,0.12)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 1,
              borderColor: "rgba(220,30,30,0.25)",
            }}
          >
            <Ionicons name="heart" size={28} color={colors.red} />
          </View>

          <Text
            style={{
              color: colors.white,
              fontSize: 20,
              fontWeight: "800",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Confirmer votre venue
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              textAlign: "center",
              lineHeight: 20,
              marginBottom: 24,
              maxWidth: 280,
            }}
          >
            Un QR Code sera généré. Présentez-le à l&apos;accueil de
            l&apos;hôpital.
          </Text>

          <View style={{ alignSelf: "stretch", marginBottom: 20 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Temps d&apos;arrivée estimé{" "}
              <Text style={{ color: colors.textSubtle, fontWeight: "400" }}>
                (optionnel)
              </Text>
            </Text>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TextInput
                style={{
                  flex: 1,
                  height: 48,
                  backgroundColor: colors.inputBg,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: colors.cardBorder,
                  color: colors.white,
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                }}
                value={etaText}
                onChangeText={setEtaText}
                placeholder="ex: 15"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                minutes
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isLoading}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              backgroundColor: colors.red,
              borderRadius: 16,
              paddingVertical: 17,
              alignSelf: "stretch",
              marginBottom: 12,
              opacity: isLoading ? 0.55 : 1,
              shadowColor: colors.red,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="heart" size={18} color="#FFFFFF" />
                <Text
                  style={{ color: "#FFFFFF", fontSize: 17, fontWeight: "800" }}
                >
                  J&apos;y vais !
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={{ paddingVertical: 10 }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 14,
                fontWeight: "500",
              }}
            >
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isEligible, daysLeft } = useIsEligible();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  // ✅ AJOUT : Extraction de `error` et `refetch` pour le NetworkErrorScreen
  const { data: alert, isLoading, isError, error, refetch } = useAlert(id);

  const { data: activeEngagement } = useActiveEngagement();
  const { mutateAsync: cancelConfirmation, isPending: isCancelling } =
    useCancelConfirmation();
  const hasConfirmedThisAlert = activeEngagement?.alert?.id === id;
  const { mutateAsync: confirmAlert, isPending: isConfirming } =
    useConfirmAlert();
  const { mutateAsync: declineAlert, isPending: isDeclining } =
    useDeclineAlert();
  const { data: hasActiveConfirmation = false } = useHasActiveConfirmation();

  const [showEtaModal, setShowEtaModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const confirmAnim = useRef(new Animated.Value(1)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    centered: { alignItems: "center", justifyContent: "center", gap: 16 },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    vitalHalo: {
      position: "absolute",
      top: -80,
      left: "50%",
      marginLeft: -100,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.redGlow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: { flex: 1, alignItems: "center" },
    vitalBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(220,30,30,0.15)",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.30)",
    },
    vitalDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.red },
    vitalBadgeText: {
      color: c.red,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 1.5,
    },
    timerBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: c.cardBg,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    timerBadgeVital: {
      backgroundColor: "rgba(220,30,30,0.10)",
      borderColor: "rgba(220,30,30,0.25)",
    },
    timerText: { color: c.textMuted, fontSize: 12, fontWeight: "600" },
    timerTextVital: { color: c.red },
    ineligibleBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.amber + "14",
      borderWidth: 1,
      borderColor: c.amber + "40",
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
    },
    ineligibleTitle: { color: c.amber, fontSize: 14, fontWeight: "700" },
    ineligibleSub: { color: c.textMuted, fontSize: 12, lineHeight: 17 },
    heroBlock: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
    },
    bloodHero: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: "rgba(220,30,30,0.10)",
      borderWidth: 2,
      borderColor: "rgba(220,30,30,0.30)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    bloodHeroVital: { backgroundColor: c.red, borderColor: c.red },
    bloodHeroText: {
      color: c.red,
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -1,
    },
    bloodHeroTextVital: { color: "#FFFFFF" },
    rareBadge: {
      position: "absolute",
      bottom: -8,
      backgroundColor: c.amber + "30",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: c.amber + "50",
    },
    rareText: { color: c.amber, fontSize: 9, fontWeight: "700" },
    heroInfo: { flex: 1, gap: 6 },
    hospitalName: {
      color: c.white,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    heroMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
    heroMetaText: { color: c.textMuted, fontSize: 12 },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: c.textSubtle,
      marginHorizontal: 2,
    },
    mapContainer: {
      borderRadius: 16,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      position: "relative",
    },
    map: { height: 160 },
    markerPin: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: c.red,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: "#FFFFFF",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 6,
    },
    mapAddressOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(8,8,8,0.85)",
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    mapAddressText: { color: c.textMuted, fontSize: 11, flex: 1 },
    section: { marginBottom: 16 },
    sectionTitle: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    infoCard: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    separator: { height: 1, backgroundColor: c.cardBorder, marginLeft: 58 },
    quotaCard: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 16,
      gap: 12,
    },
    quotaNumbers: { flexDirection: "row", alignItems: "baseline", gap: 4 },
    quotaConfirmed: { color: c.red, fontSize: 32, fontWeight: "800" },
    quotaSeparator: { color: c.textSubtle, fontSize: 24, fontWeight: "300" },
    quotaNeeded: { color: c.white, fontSize: 32, fontWeight: "800" },
    quotaUnit: { color: c.textMuted, fontSize: 14, marginLeft: 6 },
    quotaBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },
    quotaBarFill: { height: "100%", borderRadius: 3 },
    quotaHint: { color: c.textMuted, fontSize: 12 },
    actionsBlock: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: c.cardBorder,
    },
    confirmBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 18,
    },
    confirmBtnVital: {
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    confirmBtnDisabled: { opacity: 0.45 },
    confirmIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    confirmBtnText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    confirmBtnSub: {
      color: "rgba(255,255,255,0.55)",
      fontSize: 11,
      marginTop: 1,
    },
    declineBtn: {
      width: 104,
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      backgroundColor: c.cardBg,
      borderWidth: 1.5,
      borderColor: c.cardBorder,
      borderRadius: 16,
      paddingVertical: 14,
    },
    declineBtnDisabled: { opacity: 0.4 },
    declineBtnText: { color: c.textMuted, fontSize: 14, fontWeight: "600" },
    relayBtn: {
      backgroundColor: c.amber + "1A",
      borderWidth: 1.5,
      borderColor: c.amber + "59",
      shadowColor: c.amber,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
      flex: 1,
    },
    errorText: { color: c.textMuted, fontSize: 16 },
    errorBack: {
      backgroundColor: c.red,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    errorBackText: { color: "#FFFFFF", fontWeight: "700" },
  }));

  // ── Confirmer ──
  const handleConfirm = useCallback(
    async (etaMinutes?: number) => {
      if (!id) return;
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const result = await confirmAlert({ alertId: id, etaMinutes });
        setQrCode(result.qrCode);
        setShowEtaModal(false);
        setConfirmed(true);
        Animated.sequence([
          Animated.timing(confirmAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(confirmAnim, { toValue: 1, useNativeDriver: true }),
        ]).start();
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        if (alert) {
          await savePendingQr({
            qrCode: result.qrCode,
            alertId: id,
            hospitalName: alert.healthStructure.name,
            bloodType: alert.bloodType,
            confirmedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          });
        }
        router.push({
          pathname: "/(donor)/qrcode" as any,
          params: { qrCode: result.qrCode, alertId: id, isExpired: "false" },
        });
      } catch {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowEtaModal(false);
      }
    },
    [id, confirmAlert, router, alert],
  );

  const handleRelay = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!alert) return;
    try {
      await Share.share({
        message: `🚨 URGENCE : L'hôpital ${alert.healthStructure.name} a besoin de sang ${formatBloodType(alert.bloodType)} ! Si tu es disponible, aide-nous.`,
      });
    } catch {}
  };

  const handleDecline = useCallback(async () => {
    if (!id) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await declineAlert(id);
      router.back();
    } catch {}
  }, [id, declineAlert, router]);

  const handleCancel = useCallback(async () => {
    if (!id) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await cancelConfirmation(id);
      setConfirmed(false);
    } catch {}
  }, [id, cancelConfirmation]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  // ✅ NOUVEAU : Gestion robuste des erreurs
  if (isError || !alert) {
    // 1. Si c'est une erreur réseau → NetworkErrorScreen avec bouton Réessayer
    if (isNetworkError(error)) {
      return (
        <View style={styles.container}>
          <NetworkErrorScreen onRetry={refetch} />
        </View>
      );
    }

    // 2. Si c'est une erreur API (ex: 404 Alerte expirée/supprimée) → Message d'erreur classique
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.red} />
        <Text style={styles.errorText}>Alerte introuvable</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorBack}
        >
          <Text style={styles.errorBackText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isVital = alert.urgencyLevel === "VITAL";
  const bloodLabel = formatBloodType(alert.bloodType);
  const serviceLabel = formatServiceUnit(alert.serviceUnit);
  const distanceText = formatDistance(alert.distance_km);
  const timeRemaining = getTimeRemaining(alert.expiresAt);
  const isRare = alert.bloodType === "O_NEG" || alert.bloodType === "AB_NEG";
  const quotaPct = Math.min(
    (alert.quantityConfirmed / alert.quantityNeeded) * 100,
    100,
  );
  const hasCoords =
    alert.healthStructure.latitude != null &&
    alert.healthStructure.longitude != null;

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {isVital && <View style={styles.vitalHalo} />}

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            {isVital && (
              <View style={styles.vitalBadge}>
                <View style={styles.vitalDot} />
                <Text style={styles.vitalBadgeText}>URGENCE VITALE</Text>
              </View>
            )}
          </View>
          <View style={[styles.timerBadge, isVital && styles.timerBadgeVital]}>
            <Ionicons
              name="time-outline"
              size={12}
              color={isVital ? colors.red : colors.textMuted}
            />
            <Text style={[styles.timerText, isVital && styles.timerTextVital]}>
              {timeRemaining}
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Bannière inéligibilité ── */}
          {!isEligible && (
            <View style={styles.ineligibleBanner}>
              <Ionicons name="time-outline" size={22} color={colors.amber} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.ineligibleTitle}>
                  Période de repos en cours
                </Text>
                <Text style={styles.ineligibleSub}>
                  Vous pourrez donner à nouveau dans {daysLeft} jour
                  {daysLeft > 1 ? "s" : ""}. En attendant, relayez l&apos;alerte
                  pour sauver des vies !
                </Text>
              </View>
            </View>
          )}

          {/* ── Hero ── */}
          <View style={styles.heroBlock}>
            <View style={[styles.bloodHero, isVital && styles.bloodHeroVital]}>
              <Text
                style={[
                  styles.bloodHeroText,
                  isVital && styles.bloodHeroTextVital,
                ]}
              >
                {bloodLabel}
              </Text>
              {isRare && (
                <View style={styles.rareBadge}>
                  <Text style={styles.rareText}>Groupe Rare</Text>
                </View>
              )}
            </View>
            <View style={styles.heroInfo}>
              <Text style={styles.hospitalName} numberOfLines={2}>
                {alert.healthStructure.name}
              </Text>
              <View style={styles.heroMeta}>
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={colors.textMuted}
                />
                <Text style={styles.heroMetaText}>{distanceText}</Text>
                <View style={styles.metaDot} />
                <Ionicons
                  name="medkit-outline"
                  size={13}
                  color={colors.textMuted}
                />
                <Text style={styles.heroMetaText}>{serviceLabel}</Text>
              </View>
            </View>
          </View>

          {/* ── Carte ── */}
          {hasCoords && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: alert.healthStructure.latitude!,
                  longitude: alert.healthStructure.longitude!,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: alert.healthStructure.latitude!,
                    longitude: alert.healthStructure.longitude!,
                  }}
                  title={alert.healthStructure.name}
                >
                  <View style={styles.markerPin}>
                    <Ionicons name="heart" size={14} color="#FFFFFF" />
                  </View>
                </Marker>
                <Circle
                  center={{
                    latitude: alert.healthStructure.latitude!,
                    longitude: alert.healthStructure.longitude!,
                  }}
                  radius={alert.radiusKm * 1000}
                  fillColor="rgba(220,30,30,0.08)"
                  strokeColor="rgba(220,30,30,0.25)"
                  strokeWidth={1}
                />
              </MapView>
              <View style={styles.mapAddressOverlay}>
                <Ionicons name="location" size={12} color={colors.red} />
                <Text style={styles.mapAddressText} numberOfLines={1}>
                  {alert.healthStructure.address}
                </Text>
              </View>
            </View>
          )}

          {/* ── Infos ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails de l&apos;alerte</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="water-outline"
                label="Groupe sanguin requis"
                value={bloodLabel}
                valueColor={colors.red}
                colors={colors}
              />
              <View style={styles.separator} />
              <InfoRow
                icon="analytics-outline"
                label="Niveau d'urgence"
                value={isVital ? "VITAL" : "Standard"}
                valueColor={isVital ? colors.red : colors.success}
                colors={colors}
              />
              <View style={styles.separator} />
              <InfoRow
                icon="medkit-outline"
                label="Service"
                value={serviceLabel}
                colors={colors}
              />
              <View style={styles.separator} />
              <InfoRow
                icon="time-outline"
                label="Émise"
                value={formatRelative(alert.createdAt)}
                colors={colors}
              />
            </View>
          </View>

          {/* ── Quota ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Poches nécessaires</Text>
            <View style={styles.quotaCard}>
              <View style={styles.quotaNumbers}>
                <Text style={styles.quotaConfirmed}>
                  {alert.quantityConfirmed}
                </Text>
                <Text style={styles.quotaSeparator}>/</Text>
                <Text style={styles.quotaNeeded}>{alert.quantityNeeded}</Text>
                <Text style={styles.quotaUnit}>poches</Text>
              </View>
              <View style={styles.quotaBarBg}>
                <View
                  style={[
                    styles.quotaBarFill,
                    {
                      width: `${quotaPct}%` as any,
                      backgroundColor: isVital ? colors.red : colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.quotaHint}>
                {alert.quantityNeeded - alert.quantityConfirmed > 0
                  ? `${alert.quantityNeeded - alert.quantityConfirmed} donneur(s) encore nécessaire(s)`
                  : "Quota atteint — merci !"}
              </Text>
            </View>
          </View>

          <View style={{ height: 80 + tabBarHeight }} />
        </ScrollView>

        {/* ── Actions fixes ── */}
        <View
          style={[styles.actionsBlock, { paddingBottom: 12 + tabBarHeight }]}
        >
          {hasConfirmedThisAlert ? (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(donor)/qrcode" as any,
                    params: { qrCode: activeEngagement?.qrCode },
                  })
                }
                style={[styles.confirmBtn, styles.confirmBtnVital, { flex: 1 }]}
                activeOpacity={0.85}
              >
                <View style={styles.confirmIcon}>
                  <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.confirmBtnText}>Mon QR Code</Text>
                  <Text style={styles.confirmBtnSub}>
                    Présentez à l&apos;accueil
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                activeOpacity={0.75}
                disabled={isCancelling}
                style={[
                  styles.declineBtn,
                  isCancelling && styles.declineBtnDisabled,
                  { borderColor: colors.amber + "40" },
                ]}
              >
                {isCancelling ? (
                  <ActivityIndicator color={colors.amber} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={colors.amber}
                    />
                    <Text
                      style={[styles.declineBtnText, { color: colors.amber }]}
                    >
                      Annuler
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : hasActiveConfirmation ? (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(donor)/qrcode" as any,
                  params: { qrCode: activeEngagement?.qrCode },
                })
              }
              activeOpacity={0.7}
              style={[
                styles.confirmBtn,
                styles.confirmBtnDisabled,
                { flex: 1 },
              ]}
            >
              <View style={styles.confirmIcon}>
                <Ionicons name="lock-closed" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.confirmBtnText}>Déjà engagé ailleurs</Text>
                <Text style={styles.confirmBtnSub}>
                  Voir mon QR Code en cours
                </Text>
              </View>
            </TouchableOpacity>
          ) : isEligible ? (
            <>
              <Animated.View
                style={[{ flex: 1 }, { transform: [{ scale: confirmAnim }] }]}
              >
                <TouchableOpacity
                  onPress={() => setShowEtaModal(true)}
                  activeOpacity={0.85}
                  style={[styles.confirmBtn, isVital && styles.confirmBtnVital]}
                >
                  <View style={styles.confirmIcon}>
                    <Ionicons name="heart" size={18} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={styles.confirmBtnText}>J&apos;y vais !</Text>
                    <Text style={styles.confirmBtnSub}>Don de sang</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity
                onPress={handleDecline}
                activeOpacity={0.75}
                disabled={isDeclining}
                style={[
                  styles.declineBtn,
                  isDeclining && styles.declineBtnDisabled,
                ]}
              >
                {isDeclining ? (
                  <ActivityIndicator color={colors.textMuted} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={colors.textMuted}
                    />
                    <Text style={styles.declineBtnText}>Indisponible</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={handleRelay}
              activeOpacity={0.8}
              style={[styles.confirmBtn, styles.relayBtn]}
            >
              <View
                style={[
                  styles.confirmIcon,
                  { backgroundColor: colors.amber + "30" },
                ]}
              >
                <Ionicons name="share-outline" size={18} color={colors.amber} />
              </View>
              <View>
                <Text style={[styles.confirmBtnText, { color: colors.amber }]}>
                  Relayer cette alerte
                </Text>
                <Text style={styles.confirmBtnSub}>
                  Aidez en partageant autour de vous
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <EtaModal
        visible={showEtaModal}
        onClose={() => setShowEtaModal(false)}
        onConfirm={handleConfirm}
        isLoading={isConfirming}
        colors={colors}
      />
    </View>
  );
}
