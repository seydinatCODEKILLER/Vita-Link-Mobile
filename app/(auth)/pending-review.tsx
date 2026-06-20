import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColors } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

import { usePendingReviewScreen } from "@/src/hooks/usePendingReviewScreen";
import { usePendingReviewStyles } from "@/src/hooks/usePendingReviewStyles";

export default function PendingReviewScreen() {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const { fadeAnim, scaleAnim, slideAnim, STEPS_INFO, goToLogin, goToWelcome } =
    usePendingReviewScreen();

  const { styles } = usePendingReviewStyles();

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloCenter} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.body, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Icône centrale ── */}
          <Animated.View
            style={[
              styles.iconBlock,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
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
            <View style={styles.iconBadge}>
              <Ionicons name="checkmark" size={12} color={colors.white} />
            </View>
          </Animated.View>

          {/* ── Texte ── */}
          <Animated.View
            style={[
              styles.textBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
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
        </ScrollView>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={goToLogin}
            activeOpacity={0.85}
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaBtnText}>Retour à la connexion</Text>
            <View style={styles.ctaBtnIcon}>
              <Ionicons name="arrow-forward" size={17} color={colors.white} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToWelcome}
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
