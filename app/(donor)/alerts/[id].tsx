import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Haptics from "expo-haptics";
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

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.15)",
  green: "#1D9E75",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.08)",
  amber: "#FAC775",
  inputBg: "#141414",
  inputBorder: "rgba(255,255,255,0.10)",
} as const;

// ─── Composant InfoRow ─────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: any;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={16} color={COLORS.textMuted} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text
          style={[styles.infoValue, valueColor ? { color: valueColor } : {}]}
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
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (eta?: number) => void;
  isLoading: boolean;
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Icône */}
          <View style={styles.modalIconWrap}>
            <Ionicons name="heart" size={28} color={COLORS.red} />
          </View>

          <Text style={styles.modalTitle}>Confirmer votre venue</Text>
          <Text style={styles.modalSubtitle}>
            Un QR Code sera généré. Présentez-le à l&apos;accueil de
            l&apos;hôpital.
          </Text>

          {/* ETA optionnel */}
          <View style={styles.etaBlock}>
            <Text style={styles.etaLabel}>
              Temps d&apos;arrivée estimé{" "}
              <Text style={styles.etaOptional}>(optionnel)</Text>
            </Text>
            <View style={styles.etaInputRow}>
              <TextInput
                style={styles.etaInput}
                value={etaText}
                onChangeText={setEtaText}
                placeholder="ex: 15"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.etaUnit}>minutes</Text>
            </View>
          </View>

          {/* Boutons */}
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.85}
            style={[styles.modalCta, isLoading && styles.modalCtaDisabled]}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="heart" size={18} color={COLORS.white} />
                <Text style={styles.modalCtaText}>J&apos;y vais !</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={styles.modalCancel}
          >
            <Text style={styles.modalCancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();

  const { data: alert, isLoading, isError } = useAlert(id);
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

  console.log(hasConfirmedThisAlert);

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

        // Animation de succès sur le bouton
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

        // Naviguer vers l'écran QR Code
        router.push({
          pathname: "/(donor)/qrcode" as any,
          params: { qrCode: result.qrCode },
        });
      } catch {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setShowEtaModal(false);
      }
    },
    [id, confirmAlert, router],
  );

  // ── Décliner ──
  const handleDecline = useCallback(async () => {
    if (!id) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await declineAlert(id);
      router.back();
    } catch {
      // Silencieux
    }
  }, [id, declineAlert, router]);

  const handleCancel = useCallback(async () => {
    if (!id) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await cancelConfirmation(id);
      setConfirmed(false);
    } catch {
      // Silencieux, le toast est géré par le hook si tu ajoutes onError
    }
  }, [id, cancelConfirmation]);

  // ── Loading ──
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  // ── Erreur ──
  if (isError || !alert) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={COLORS.red} />
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
      <StatusBar style="light" />

      {/* Halo décoratif VITAL */}
      {isVital && <View style={styles.vitalHalo} />}

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            {isVital && (
              <View style={styles.vitalBadge}>
                <View style={styles.vitalDot} />
                <Text style={styles.vitalBadgeText}>URGENCE VITALE</Text>
              </View>
            )}
          </View>

          {/* Timer */}
          <View style={[styles.timerBadge, isVital && styles.timerBadgeVital]}>
            <Ionicons
              name="time-outline"
              size={12}
              color={isVital ? COLORS.red : COLORS.textMuted}
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
          {/* ── Hero groupe sanguin ── */}
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
                  color={COLORS.textMuted}
                />
                <Text style={styles.heroMetaText}>{distanceText}</Text>
                <View style={styles.metaDot} />
                <Ionicons
                  name="medkit-outline"
                  size={13}
                  color={COLORS.textMuted}
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
                    <Ionicons name="heart" size={14} color={COLORS.white} />
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

              {/* Overlay adresse */}
              <View style={styles.mapAddressOverlay}>
                <Ionicons name="location" size={12} color={COLORS.red} />
                <Text style={styles.mapAddressText} numberOfLines={1}>
                  {alert.healthStructure.address}
                </Text>
              </View>
            </View>
          )}

          {/* ── Infos détaillées ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails de l&apos;alerte</Text>
            <View style={styles.infoCard}>
              <InfoRow
                icon="water-outline"
                label="Groupe sanguin requis"
                value={bloodLabel}
                valueColor={COLORS.red}
              />
              <View style={styles.separator} />
              <InfoRow
                icon="analytics-outline"
                label="Niveau d'urgence"
                value={isVital ? "VITAL" : "Standard"}
                valueColor={isVital ? COLORS.red : COLORS.green}
              />
              <View style={styles.separator} />
              <InfoRow
                icon="medkit-outline"
                label="Service"
                value={serviceLabel}
              />
              <View style={styles.separator} />
              <InfoRow
                icon="time-outline"
                label="Émise"
                value={formatRelative(alert.createdAt)}
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
                      backgroundColor: isVital ? COLORS.red : COLORS.green,
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

          {/* Espaceur pour les boutons fixes */}
          <View style={{ height: 80 + tabBarHeight }} />
        </ScrollView>

        {/* ── Boutons fixes en bas ── */}
        <View
          style={[styles.actionsBlock, { paddingBottom: 12 + tabBarHeight }]}
        >
          {hasConfirmedThisAlert ? (
            // ── CAS 1 : Donnéur engagé sur CETTE alerte ──
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
                  <Ionicons
                    name="qr-code-outline"
                    size={18}
                    color={COLORS.white}
                  />
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
                style={[
                  styles.declineBtn,
                  isCancelling && styles.declineBtnDisabled,
                  { borderColor: "rgba(250,199,117,0.25)" },
                ]}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <ActivityIndicator color={COLORS.amber} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={COLORS.amber}
                    />
                    <Text
                      style={[styles.declineBtnText, { color: COLORS.amber }]}
                    >
                      Annuler
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : hasActiveConfirmation ? (
            // ── CAS 2 : Donnéur engagé sur une AUTRE alerte (Bouton pleine largeur) ──
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
                <Ionicons name="lock-closed" size={18} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.confirmBtnText}>Déjà engagé ailleurs</Text>
                <Text style={styles.confirmBtnSub}>
                  Voir mon QR Code en cours
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            // ── CAS 3 : Aucun engagement (Layout normal J'y vais + Indisponible) ──
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
                    <Ionicons name="heart" size={18} color={COLORS.white} />
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
                  <ActivityIndicator color={COLORS.textMuted} size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle-outline"
                      size={20}
                      color={COLORS.textMuted}
                    />
                    <Text style={styles.declineBtnText}>Indisponible</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>

      {/* ── Modal ETA ── */}
      <EtaModal
        visible={showEtaModal}
        onClose={() => setShowEtaModal(false)}
        onConfirm={handleConfirm}
        isLoading={isConfirming}
      />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center", gap: 16 },

  vitalHalo: {
    position: "absolute",
    top: -80,
    left: "50%",
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.redGlow,
  },

  // ── Header ──
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
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
  vitalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.red,
  },
  vitalBadgeText: {
    color: COLORS.red,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  timerBadgeVital: {
    backgroundColor: "rgba(220,30,30,0.10)",
    borderColor: "rgba(220,30,30,0.25)",
  },
  timerText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  timerTextVital: { color: COLORS.red },

  // ── Scroll ──
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  // ── Hero ──
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
    position: "relative",
    flexShrink: 0,
  },
  bloodHeroVital: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  bloodHeroText: {
    color: COLORS.red,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  bloodHeroTextVital: { color: COLORS.white },
  rareBadge: {
    position: "absolute",
    bottom: -8,
    backgroundColor: "rgba(250,199,117,0.20)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(250,199,117,0.30)",
  },
  rareText: { color: COLORS.amber, fontSize: 9, fontWeight: "700" },
  heroInfo: { flex: 1, gap: 6 },
  hospitalName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  heroMetaText: { color: COLORS.textMuted, fontSize: 12 },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSubtle,
    marginHorizontal: 2,
  },

  // ── Carte ──
  mapContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: "relative",
  },
  map: { height: 160 },
  markerPin: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: COLORS.red,
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
  mapAddressText: { color: COLORS.textMuted, fontSize: 11, flex: 1 },

  // ── Section ──
  section: { marginBottom: 16 },
  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  // ── Info card ──
  infoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoContent: { flex: 1 },
  infoLabel: { color: COLORS.textMuted, fontSize: 11, marginBottom: 2 },
  infoValue: { color: COLORS.white, fontSize: 14, fontWeight: "600" },
  separator: { height: 1, backgroundColor: COLORS.cardBorder, marginLeft: 58 },

  // ── Quota ──
  quotaCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    gap: 12,
  },
  quotaNumbers: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  quotaConfirmed: { color: COLORS.red, fontSize: 32, fontWeight: "800" },
  quotaSeparator: { color: COLORS.textSubtle, fontSize: 24, fontWeight: "300" },
  quotaNeeded: { color: COLORS.white, fontSize: 32, fontWeight: "800" },
  quotaUnit: { color: COLORS.textMuted, fontSize: 14, marginLeft: 6 },
  quotaBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.07)",
    overflow: "hidden",
  },
  quotaBarFill: { height: "100%", borderRadius: 3 },
  quotaHint: { color: COLORS.textMuted, fontSize: 12 },

  // ── Actions block ──
  actionsBlock: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
  },

  declineBtnText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Bouton J'y vais ──
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  confirmBtnVital: {
    // Léger boost visuel sur VITAL — géré via shadow uniquement
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtnLoading: {
    backgroundColor: "rgba(220,30,30,0.55)",
  },
  confirmBtnDone: {
    backgroundColor: "rgba(29,158,117,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(29,158,117,0.40)",
  },
  confirmIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCheckIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(29,158,117,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  confirmBtnTextDone: {
    color: "#1D9E75",
  },
  confirmBtnDisabled: {
    opacity: 0.45,
  },
  confirmBtnSub: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    marginTop: 1,
  },

  // ── Bouton Indisponible ──
  declineBtn: {
    width: 104,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 16,
    paddingVertical: 14,
  },
  declineBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.06)",
  },
  declineBtnTextDisabled: {
    color: "rgba(255,255,255,0.15)",
  },

  // ── Modal ETA ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginBottom: 24,
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(220,30,30,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(220,30,30,0.25)",
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  etaBlock: { alignSelf: "stretch", marginBottom: 20 },
  etaLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  etaOptional: { color: COLORS.textSubtle, fontWeight: "400" },
  etaInputRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  etaInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  etaUnit: { color: COLORS.textMuted, fontSize: 14 },
  modalCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 17,
    alignSelf: "stretch",
    marginBottom: 12,
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalCtaDisabled: { opacity: 0.55 },
  modalCtaText: { color: COLORS.white, fontSize: 17, fontWeight: "800" },
  modalCancel: { paddingVertical: 10 },
  modalCancelText: { color: COLORS.textMuted, fontSize: 14, fontWeight: "500" },

  // ── Erreur ──
  errorText: { color: COLORS.textMuted, fontSize: 16 },
  errorBack: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBackText: { color: COLORS.white, fontWeight: "700" },
});
