import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Platform,
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

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.12)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(255,255,255,0.08)",
  success: "#1D9E75",
  amber: "#FAC775",
} as const;

export default function QrCodeScreen() {
  const router = useRouter();
  const { qrCode } = useLocalSearchParams<{ qrCode: string }>();
  const [previousBrightness, setPreviousBrightness] = useState<number | null>(
    null,
  );

  // ── Animations d'entrée ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

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

  // ── Luminosité max ──
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
          if (previousBrightness !== null) {
            await Brightness.setBrightnessAsync(previousBrightness);
          }
        } catch {}
      };
      restore();
    };
  }, []);

  // ── Partager ──
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

  // ── Écran d'erreur ──
  if (!qrCode) {
    return (
      <View style={[styles.container, styles.centered]}>
        <StatusBar style="light" />
        <View style={styles.errorIconWrap}>
          <Ionicons name="alert-circle-outline" size={36} color={COLORS.red} />
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
      <StatusBar style="light" />

      {/* Halos décoratifs */}
      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.successBadge}>
                <View style={styles.successDot} />
                <Text style={styles.successBadgeText}>Don confirmé</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareIconBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
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
              {/* Header carte blanc */}
              <View style={styles.qrCardHeader}>
                <View style={styles.qrLogoRow}>
                  <View style={styles.qrLogoIcon}>
                    <Ionicons name="heart" size={13} color={COLORS.white} />
                  </View>
                  <Text style={styles.qrLogoText}>
                    Vita<Text style={{ color: COLORS.red }}>Link</Text>
                  </Text>
                </View>
                <Text style={styles.qrCardLabel}>Pass Don de Sang</Text>
              </View>

              {/* Ligne pointillée */}
              <View style={styles.dottedLine} />

              {/* QR Code */}
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrCode}
                  size={200}
                  color="#1A1A1A"
                  backgroundColor={COLORS.cardBg}
                />
              </View>

              {/* Ligne pointillée */}
              <View style={styles.dottedLine} />

              {/* Code texte */}
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
            {/* Instruction verte */}
            <View style={styles.instructionRow}>
              <View style={styles.instructionIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={COLORS.success}
                />
              </View>
              <Text style={styles.instructionText}>
                L&apos;agent de santé scannera ce code pour valider votre don et
                créditer vos{" "}
                <Text style={{ color: COLORS.amber, fontWeight: "700" }}>
                  points Jambaar
                </Text>
                .
              </Text>
            </View>

            {/* Bouton partager */}
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Ionicons
                name="share-social-outline"
                size={18}
                color={COLORS.white}
              />
              <Text style={styles.shareBtnText}>Partager le code</Text>
            </TouchableOpacity>

            {/* Sécurité */}
            <View style={styles.securityRow}>
              <Ionicons
                name="lock-closed-outline"
                size={12}
                color={COLORS.textSubtle}
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

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },
  scrollContent: {
    flexGrow: 1, // ✅ Permet au contenu de grandir et de scroller si besoin
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 40,
  },

  // Halos
  haloTop: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.redGlow,
  },
  haloBottom: {
    position: "absolute",
    bottom: 80,
    left: -60,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(220,30,30,0.06)",
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
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
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
    backgroundColor: COLORS.success,
  },
  successBadgeText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: "700",
  },
  shareIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Titre ──
  titleBlock: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: "center",
    gap: 6,
  },
  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  // ── Carte QR ──
  qrCardWrapper: { paddingHorizontal: 24, marginBottom: 20 },
  qrCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: COLORS.red,
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
    backgroundColor: COLORS.red,
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
    backgroundColor: COLORS.cardBg,
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
    textTransform: "uppercase",
  },
  codeValue: {
    color: COLORS.red,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2.5,
    textAlign: "center",
  },

  // ── Bas de page ──
  bottomBlock: {
    paddingHorizontal: 24,
    gap: 14,
    marginTop: "auto",
    justifyContent: "flex-end",
    paddingBottom: Platform.OS === "ios" ? 8 : 16,
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
    borderColor: COLORS.cardBorder,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  shareBtnText: { color: COLORS.white, fontSize: 15, fontWeight: "600" },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  securityText: {
    color: COLORS.textSubtle,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },

  // ── Erreur ──
  errorIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(220,30,30,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  errorSub: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },
  errorBtn: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
  },
  errorBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 15 },
});
