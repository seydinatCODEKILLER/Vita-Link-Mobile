import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert,
  Animated,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCancelConfirmation } from "@/src/hooks/useAlerts";
import { clearPendingQr } from "@/src/utils/qr.utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Brightness from "expo-brightness";
import * as Haptics from "expo-haptics";
import QRCode from "react-native-qrcode-svg";
import { StatusBar } from "expo-status-bar";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

export default function QrCodeScreen() {
  const router = useRouter();
  const { qrCode, alertId, isExpired } = useLocalSearchParams<{
    qrCode: string;
    alertId: string;
    isExpired?: string;
  }>();
  const tabBarHeight = useBottomTabBarHeight();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const [previousBrightness, setPreviousBrightness] = useState<number | null>(
    null,
  );
  const { mutateAsync: cancelConfirmation, isPending: isCancelling } =
    useCancelConfirmation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    scrollContent: { flexGrow: 1 },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      paddingHorizontal: 40,
    },
    haloTop: {
      position: "absolute",
      top: -60,
      right: -40,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.redGlow,
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
    successBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(29,158,117,0.12)",
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "rgba(29,158,117,0.25)",
    },
    successDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: c.success,
    },
    successBadgeText: { color: c.success, fontSize: 11, fontWeight: "700" },
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
    qrCardWrapper: { paddingHorizontal: 24, marginBottom: 20 },
    qrCard: {
      backgroundColor: "#FFFFFF", // card toujours blanche — le QR doit être lisible
      borderRadius: 24,
      overflow: "hidden",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
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
      backgroundColor: c.red,
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
    codeBlock: {
      alignItems: "center",
      paddingVertical: 16,
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
      color: c.red,
      fontSize: 20,
      fontWeight: "900",
      letterSpacing: 2.5,
      textAlign: "center",
    },
    bottomBlock: {
      paddingHorizontal: 24,
      gap: 14,
      marginTop: "auto",
      justifyContent: "flex-end",
    },
    instructionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: "rgba(29,158,117,0.07)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(29,158,117,0.18)",
      padding: 14,
    },
    instructionIcon: {
      width: 32,
      height: 32,
      borderRadius: 9,
      backgroundColor: "rgba(29,158,117,0.12)",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    instructionText: {
      flex: 1,
      color: "rgba(29,158,117,0.85)",
      fontSize: 13,
      lineHeight: 20,
    },
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
    cancelBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: c.amber + "40",
      backgroundColor: c.amber + "10",
    },
    cancelBtnExpired: { borderColor: c.cardBorder, backgroundColor: c.cardBg },
    cancelBtnText: { color: c.amber, fontSize: 14, fontWeight: "600" },
    cancelBtnTextExpired: { color: c.textMuted },
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
    errorIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: "rgba(220,30,30,0.10)",
      alignItems: "center",
      justifyContent: "center",
    },
    errorTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    errorSub: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 21,
    },
    errorBtn: {
      backgroundColor: c.red,
      paddingHorizontal: 28,
      paddingVertical: 13,
      borderRadius: 14,
      marginTop: 8,
    },
    errorBtnText: { color: c.white, fontWeight: "700", fontSize: 15 },
  }));

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
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    const setup = async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status !== "granted") return;
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

  const handleShare = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `🩸 Mon code de passage Vita-Link : ${qrCode}`,
      });
    } catch {
      Alert.alert("Erreur", "Impossible de partager le code.");
    }
  };

  const handleCancel = async () => {
    if (!alertId) return;
    Alert.alert(
      "Annuler votre venue ?",
      "L'hôpital compte sur vous. Si vous annulez, votre engagement sera supprimé et vous redeviendrez disponible pour d'autres alertes.",
      [
        { text: "Non, je maintiens", style: "cancel" },
        {
          text: "Oui, annuler",
          style: "destructive",
          onPress: async () => {
            try {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
              await cancelConfirmation(alertId);
              await clearPendingQr();
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible d'annuler. Réessayez.");
            }
          },
        },
      ],
    );
  };

  if (!qrCode) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />
        <View style={styles.errorIconWrap}>
          <Ionicons name="alert-circle-outline" size={36} color={colors.red} />
        </View>
        <Text style={styles.errorTitle}>Code QR introuvable</Text>
        <Text style={styles.errorSub}>
          Retournez à la liste des alertes et réessayez.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.errorBtn}>
          <Text style={styles.errorBtnText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 20 + tabBarHeight },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={20} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <View style={styles.successBadge}>
                <View style={styles.successDot} />
                <Text style={styles.successBadgeText}>Don confirmé</Text>
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
            <Text style={styles.title}>Votre Pass Don 🩸</Text>
            <Text style={styles.subtitle}>
              Présentez ce QR Code à l&apos;accueil de l&apos;hôpital
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
              <View style={styles.qrCardHeader}>
                <View style={styles.qrLogoRow}>
                  <View style={styles.qrLogoIcon}>
                    <Ionicons name="heart" size={13} color="#FFFFFF" />
                  </View>
                  <Text style={styles.qrLogoText}>
                    Vita<Text style={{ color: colors.red }}>Link</Text>
                  </Text>
                </View>
                <Text style={styles.qrCardLabel}>Pass Don de Sang</Text>
              </View>

              <View style={styles.dottedLine} />

              <View style={styles.qrWrapper}>
                {/* QR toujours sur fond blanc — lisibilité scanner */}
                <QRCode
                  value={qrCode}
                  size={200}
                  color="#1A1A1A"
                  backgroundColor="#FFFFFF"
                />
              </View>

              <View style={styles.dottedLine} />

              <View style={styles.codeBlock}>
                <Text style={styles.codeLabel}>CODE DE PASSAGE</Text>
                <Text style={styles.codeValue}>{qrCode}</Text>
              </View>
            </View>
          </Animated.View>

          {/* ── Bas de page ── */}
          <Animated.View
            style={[
              styles.bottomBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.instructionRow}>
              <View style={styles.instructionIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.success}
                />
              </View>
              <Text style={styles.instructionText}>
                L&apos;agent de santé scannera ce code pour valider votre don et
                créditer vos{" "}
                <Text style={{ color: colors.amber, fontWeight: "700" }}>
                  points Jambaar
                </Text>
                .
              </Text>
            </View>

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
              <Text style={styles.shareBtnText}>Partager le code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, isExpired && styles.cancelBtnExpired]}
              onPress={handleCancel}
              activeOpacity={0.7}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <ActivityIndicator color={colors.amber} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color={isExpired ? colors.textMuted : colors.amber}
                  />
                  <Text
                    style={[
                      styles.cancelBtnText,
                      isExpired && styles.cancelBtnTextExpired,
                    ]}
                  >
                    Annuler mon engagement
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.securityRow}>
              <Ionicons
                name="lock-closed-outline"
                size={12}
                color={colors.textSubtle}
              />
              <Text style={styles.securityText}>
                Code à usage unique · Ne le partagez qu&apos;avec le personnel
                médical
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
