import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

export default function PendingReviewScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  // ✅ Les infos de la timeline sont maintenant dynamiques et dépendent du thème
  const STEPS_INFO = [
    {
      icon: "checkmark-circle-outline" as const,
      color: colors.success,
      label: "Demande soumise",
      done: true,
    },
    {
      icon: "search-outline" as const,
      color: colors.amber,
      label: "Vérification en cours (24-48h)",
      done: false,
    },
    {
      icon: "shield-checkmark-outline" as const,
      color: colors.textSubtle,
      label: "Accès activé",
      done: false,
    },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1, paddingHorizontal: 24 },
    haloCenter: {
      position: "absolute",
      top: -60,
      left: "50%",
      marginLeft: -110,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: "rgba(250,199,117,0.08)",
    },
    body: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
    },
    // ── Icône ──
    iconBlock: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    iconRing2: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: "rgba(250,199,117,0.06)",
      borderWidth: 1,
      borderColor: "rgba(250,199,117,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconRing1: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "rgba(250,199,117,0.10)",
      borderWidth: 1,
      borderColor: "rgba(250,199,117,0.20)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconCenter: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: "rgba(250,199,117,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: c.success,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: c.bg,
    },
    // ── Texte ──
    textBlock: { alignItems: "center", gap: 10 },
    eyebrow: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2.5,
    },
    title: {
      color: c.white,
      fontSize: 30,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.5,
      lineHeight: 38,
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 300,
    },
    // ── Timeline ──
    timelineCard: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 16,
      alignSelf: "stretch",
    },
    timelineRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    timelineIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 9,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    timelineLabel: {
      flex: 1,
      color: c.textMuted,
      fontSize: 13,
      fontWeight: "500",
    },
    timelineLabelDone: {
      color: c.success,
      fontWeight: "600",
    },
    timelineLabelActive: {
      color: c.amber,
      fontWeight: "600",
    },
    timelineConnector: {
      width: 1,
      height: 14,
      backgroundColor: c.cardBorder,
      marginLeft: 15,
      marginVertical: 4,
    },
    pendingDot: {
      backgroundColor: "rgba(250,199,117,0.15)",
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: "rgba(250,199,117,0.25)",
    },
    pendingDotText: {
      color: c.amber,
      fontSize: 10,
      fontWeight: "700",
    },
    // ── Email card ──
    emailCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: "rgba(34,197,94,0.07)",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(34,197,94,0.16)",
      padding: 12,
      alignSelf: "stretch",
    },
    emailCardText: {
      flex: 1,
      color: "rgba(34,197,94,0.70)",
      fontSize: 12,
      lineHeight: 18,
    },
    // ── Footer ──
    footer: { paddingBottom: 10, gap: 12 },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
    },
    ctaBtnText: {
      color: c.white,
      fontSize: 16,
      fontWeight: "700",
    },
    ctaBtnIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.18)",
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryBtn: {
      alignItems: "center",
      paddingVertical: 12,
    },
    secondaryBtnText: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: "500",
    },
  }));

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloCenter} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.body}>
          {/* ── Icône centrale ── */}
          <Animated.View
            style={[
              styles.iconBlock,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.iconRing2}>
              <View style={styles.iconRing1}>
                <View style={styles.iconCenter}>
                  <Ionicons
                    name="time-outline"
                    size={40}
                    color={colors.amber}
                  />
                </View>
              </View>
            </View>

            {/* Badge check */}
            <View style={styles.iconBadge}>
              <Ionicons name="checkmark" size={12} color={colors.white} />
            </View>
          </Animated.View>

          {/* ── Texte ── */}
          <Animated.View
            style={[
              styles.textBlock,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.eyebrow}>DEMANDE REÇUE</Text>
            <Text style={styles.title}>En attente de{"\n"}vérification</Text>
            <Text style={styles.subtitle}>
              Notre équipe examinera votre dossier et activera votre accès sous
              24 à 48 heures.
            </Text>
          </Animated.View>

          {/* ── Timeline ── */}
          <Animated.View
            style={[
              styles.timelineCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {STEPS_INFO.map((step, i) => (
              <View key={i}>
                <View style={styles.timelineRow}>
                  <View
                    style={[
                      styles.timelineIconWrap,
                      {
                        borderColor: step.color + "40",
                        backgroundColor: step.color + "15",
                      },
                    ]}
                  >
                    <Ionicons name={step.icon} size={16} color={step.color} />
                  </View>
                  <Text
                    style={[
                      styles.timelineLabel,
                      step.done && styles.timelineLabelDone,
                      i === 1 && styles.timelineLabelActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                  {step.done && (
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={colors.success}
                    />
                  )}
                  {i === 1 && (
                    <View style={styles.pendingDot}>
                      <Text style={styles.pendingDotText}>En cours</Text>
                    </View>
                  )}
                </View>
                {i < STEPS_INFO.length - 1 && (
                  <View style={styles.timelineConnector} />
                )}
              </View>
            ))}
          </Animated.View>

          {/* ── Info email ── */}
          <Animated.View style={[styles.emailCard, { opacity: fadeAnim }]}>
            <Ionicons
              name="mail-outline"
              size={15}
              color="rgba(34,197,94,0.7)"
            />
            <Text style={styles.emailCardText}>
              Vous recevrez un email de confirmation lors de l&apos;activation
              de votre compte.
            </Text>
          </Animated.View>
        </View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            activeOpacity={0.85}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaBtnText}>Retour à la connexion</Text>
            <View style={styles.ctaBtnIcon}>
              <Ionicons name="arrow-forward" size={17} color={colors.white} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/welcome")}
            activeOpacity={0.7}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>Retour à l&apos;accueil</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
