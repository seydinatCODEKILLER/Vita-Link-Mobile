import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Brightness from "expo-brightness";
import * as Haptics from "expo-haptics";
import QRCode from "react-native-qrcode-svg";
import { StatusBar } from "expo-status-bar";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import dayjs from "dayjs";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// ─── Status Config ──────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PENDING: {
    label: "En attente de retrait",
    color: "amber",
    icon: "time-outline",
  },
  USED: {
    label: "Retrait confirmé",
    color: "success",
    icon: "checkmark-circle-outline",
  },
  EXPIRED: {
    label: "Bon expiré",
    color: "red",
    icon: "alert-circle-outline",
  },
  CANCELLED: {
    label: "Bon annulé",
    color: "textMuted",
    icon: "remove-circle-outline",
  },
};

export default function PurchaseOrderScreen() {
  const router = useRouter();
  const {
    code,
    status,
    expiresAt,
    quantity,
    bloodType,
    cntsName,
    cntsAddress,
  } = useLocalSearchParams<{
    code: string;
    bloodRequestId: string;
    status: string;
    expiresAt: string;
    quantity: string;
    bloodType: string;
    cntsName: string;
    cntsAddress: string;
  }>();

  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const [previousBrightness, setPreviousBrightness] = useState<number | null>(
    null,
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const statusEntry =
    STATUS_CONFIG[status ?? "PENDING"] ?? STATUS_CONFIG.PENDING;
  const statusColor =
    colors[statusEntry.color as keyof typeof colors] ?? colors.amber;

  const bloodLabel = bloodType
    ? (BLOOD_TYPE_LABELS[bloodType as keyof typeof BLOOD_TYPE_LABELS] ??
      bloodType.replaceAll("_", " "))
    : "—";

  const isUsed = status === "USED";
  const isExpired = status === "EXPIRED" || status === "CANCELLED";
  const isPending = status === "PENDING";

  const expiresAtFormatted = expiresAt
    ? dayjs(expiresAt).format("DD MMM YYYY [à] HH[h]mm")
    : "—";

  // Élever la luminosité pour la lisibilité du QR Code
  useEffect(() => {
    const setup = async () => {
      try {
        const { status: permStatus } =
          await Brightness.requestPermissionsAsync();
        if (permStatus !== "granted") return;
        const current = await Brightness.getBrightnessAsync();
        setPreviousBrightness(current);
        await Brightness.setBrightnessAsync(1);
      } catch {}
    };
    setup();
    return () => {
      const restore = async () => {
        try {
          if (previousBrightness !== null)
            await Brightness.setBrightnessAsync(previousBrightness);
        } catch {}
      };
      restore();
    };
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
    if (isPending) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `🩸 Bon de commande Vita-Link\nCode : ${code}\nSang : ${bloodLabel} — ${quantity} poche(s)\nÀ présenter à : ${cntsName}`,
      });
    } catch {
      Alert.alert("Erreur", "Impossible de partager le bon.");
    }
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    haloTop: {
      position: "absolute",
      top: -60,
      right: -40,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.success + "0A",
    },
    haloBottom: {
      position: "absolute",
      bottom: 80,
      left: -60,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: c.haloLight,
    },
    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerBtn: {
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
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusBadgeText: { fontSize: 11, fontWeight: "700" },
    // ── Titre ──
    titleBlock: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      alignItems: "center",
      gap: 6,
    },
    title: {
      color: c.white,
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: -0.5,
      textAlign: "center",
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 21,
    },
    // ── Carte QR ──
    qrCardWrapper: { paddingHorizontal: 24, marginBottom: 16 },
    qrCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 28,
      elevation: 16,
    },
    qrCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    qrLogoRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    qrLogoIcon: {
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: c.success,
      alignItems: "center",
      justifyContent: "center",
    },
    qrLogoText: {
      color: "#1A1A1A",
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    qrCardLabel: {
      color: "rgba(0,0,0,0.35)",
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 0.5,
    },
    dottedLine: {
      height: 1,
      marginHorizontal: 20,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.10)",
    },
    qrWrapper: {
      alignItems: "center",
      paddingVertical: 24,
      backgroundColor: "#FFFFFF",
    },
    qrExpiredOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.85)",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    qrExpiredText: {
      color: "#CC0000",
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    // ── Infos sang ──
    bloodInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 12,
    },
    bloodBadge: {
      alignItems: "center",
      justifyContent: "center",
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "rgba(220,30,30,0.08)",
      borderWidth: 1,
      borderColor: "rgba(220,30,30,0.18)",
    },
    bloodBadgeText: {
      color: "#CC0000",
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 20,
    },
    bloodDetails: { flex: 1 },
    bloodDetailsQty: { color: "#1A1A1A", fontSize: 16, fontWeight: "800" },
    bloodDetailsType: {
      color: "rgba(0,0,0,0.45)",
      fontSize: 12,
      marginTop: 2,
    },
    codeBlock: {
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 20,
      gap: 4,
    },
    codeLabel: {
      color: "rgba(0,0,0,0.35)",
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 2,
    },
    codeValue: {
      color: "#1A1A1A",
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: 2.5,
      textAlign: "center",
    },
    // ── Bas ──
    bottomBlock: {
      paddingHorizontal: 24,
      gap: 12,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      borderRadius: 14,
      borderWidth: 0.5,
      padding: 13,
    },
    infoCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    infoCardTitle: { fontSize: 12, fontWeight: "700", marginBottom: 2 },
    infoCardSub: { color: c.textMuted, fontSize: 11, lineHeight: 16 },
    shareBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 15,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    shareBtnText: { color: c.white, fontSize: 15, fontWeight: "600" },
    securityRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    securityText: {
      color: c.textSubtle,
      fontSize: 11,
      textAlign: "center",
      lineHeight: 16,
    },
  }));

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 + tabBarHeight }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="arrow-back" size={20} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: statusColor + "12",
                    borderColor: statusColor + "28",
                  },
                ]}
              >
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {statusEntry.label}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="share-outline" size={20} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>

          {/* ── Titre ── */}
          <Animated.View
            style={[
              styles.titleBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.title}>Bon de Commande 🏥</Text>
            <Text style={styles.subtitle}>
              Présentez ce bon à la{"\n"}
              <Text style={{ color: colors.white, fontWeight: "700" }}>
                {cntsName}
              </Text>{" "}
              pour récupérer le sang
            </Text>
          </Animated.View>

          {/* ── Carte QR ── */}
          <Animated.View
            style={[
              styles.qrCardWrapper,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.qrCard}>
              {/* Header carte */}
              <View style={styles.qrCardHeader}>
                <View style={styles.qrLogoRow}>
                  <View style={styles.qrLogoIcon}>
                    <Ionicons name="medkit" size={13} color="#FFFFFF" />
                  </View>
                  <Text style={styles.qrLogoText}>
                    Vita<Text style={{ color: "#1D9E75" }}>Link</Text>
                  </Text>
                </View>
                <Text style={styles.qrCardLabel}>BON DE COMMANDE</Text>
              </View>

              <View style={styles.dottedLine} />

              {/* Infos sang */}
              <View style={styles.bloodInfoRow}>
                <View style={styles.bloodBadge}>
                  <Text style={styles.bloodBadgeText}>{bloodLabel}</Text>
                </View>
                <View style={styles.bloodDetails}>
                  <Text style={styles.bloodDetailsQty}>
                    {quantity} poche{Number(quantity) > 1 ? "s" : ""}
                  </Text>
                  <Text style={styles.bloodDetailsType}>
                    Groupe sanguin {bloodType?.replaceAll("_", " ")}
                  </Text>
                </View>
              </View>

              <View style={styles.dottedLine} />

              {/* QR Code */}
              <View style={styles.qrWrapper}>
                <QRCode
                  value={code ?? "INVALID"}
                  size={200}
                  color={isExpired ? "#AAAAAA" : "#1A1A1A"}
                  backgroundColor="#FFFFFF"
                />
                {isExpired && (
                  <View style={styles.qrExpiredOverlay}>
                    <Ionicons name="alert-circle" size={32} color="#CC0000" />
                    <Text style={styles.qrExpiredText}>BON EXPIRÉ</Text>
                  </View>
                )}
                {isUsed && (
                  <View
                    style={[
                      styles.qrExpiredOverlay,
                      { backgroundColor: "rgba(255,255,255,0.88)" },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={36}
                      color="#1D9E75"
                    />
                    <Text style={[styles.qrExpiredText, { color: "#1D9E75" }]}>
                      RETRAIT CONFIRMÉ
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.dottedLine} />

              {/* Code */}
              <View style={styles.codeBlock}>
                <Text style={styles.codeLabel}>CODE BON DE COMMANDE</Text>
                <Text style={styles.codeValue}>{code}</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Infos CNTS + Expiration ── */}
          <Animated.View
            style={[
              styles.bottomBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Carte CNTS */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.success + "08",
                  borderColor: colors.success + "22",
                },
              ]}
            >
              <View
                style={[
                  styles.infoCardIcon,
                  { backgroundColor: colors.success + "14" },
                ]}
              >
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={colors.success}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoCardTitle, { color: colors.success }]}>
                  {cntsName}
                </Text>
                <Text style={styles.infoCardSub}>{cntsAddress}</Text>
              </View>
            </View>

            {/* Expiration */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: isExpired
                    ? colors.red + "08"
                    : colors.amber + "08",
                  borderColor: isExpired
                    ? colors.red + "22"
                    : colors.amber + "22",
                },
              ]}
            >
              <View
                style={[
                  styles.infoCardIcon,
                  {
                    backgroundColor: isExpired
                      ? colors.red + "14"
                      : colors.amber + "14",
                  },
                ]}
              >
                <Ionicons
                  name="timer-outline"
                  size={16}
                  color={isExpired ? colors.red : colors.amber}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.infoCardTitle,
                    { color: isExpired ? colors.red : colors.amber },
                  ]}
                >
                  {isExpired ? "Bon expiré" : "Valable jusqu'au"}
                </Text>
                <Text style={styles.infoCardSub}>{expiresAtFormatted}</Text>
              </View>
            </View>

            {/* Bouton partager */}
            {isPending && (
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShare}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.shareBtnText}>Partager le bon</Text>
              </TouchableOpacity>
            )}

            {/* Sécurité */}
            <View style={styles.securityRow}>
              <Ionicons
                name="lock-closed-outline"
                size={12}
                color={colors.textSubtle}
              />
              <Text style={styles.securityText}>
                Code à usage unique · À présenter uniquement au personnel CNTS
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
