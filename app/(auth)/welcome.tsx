import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColors } from "@/src/theme/useTheme";

import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { VitaLinkLogo } from "@/src/components/welcome/VitaLinkLogo";
import { ActionButton } from "@/src/components/welcome/ActionButton";
import { HeroOrb } from "@/src/components/welcome/HeroOrb";

import { useWelcomeScreen } from "@/src/hooks/useWelcomeScreen";
import { useWelcomeStyles } from "@/src/hooks/useWelcomeStyles";

export default function WelcomeScreen() {
  const colors = useColors();
  const { isDark } = useWelcomeStyles();
  const { styles } = useWelcomeStyles();

  const {
    fadeAnim,
    slideAnim,
    btnAnim,
    pulseAnim,
    ring2Anim,
    goToHospital,
    goToCnts,
    goToLogin,
  } = useWelcomeScreen();

  const fadeSlide = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, fadeSlide]}>
          <VitaLinkLogo />
          <View style={styles.headerRight}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Opérationnel</Text>
            </View>
            <ThemeToggle size={34} />
          </View>
        </Animated.View>

        {/* ── Hero ── */}
        <Animated.View style={[styles.heroBlock, fadeSlide]}>
          <HeroOrb pulseAnim={pulseAnim} ring2Anim={ring2Anim} />
          {/* ← Plus de props colors */}
          <Text style={styles.eyebrow}>Plateforme d&apos;urgence médicale</Text>
          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleBase}>Le lien qui{"\n"}</Text>
            <Text style={styles.heroTitleRed}>sauve des vies.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Gérez alertes sanguines et stocks en temps réel pour{" "}
            <Text style={styles.heroSubtitleAccent}>structures de santé</Text>{" "}
            au Sénégal.
          </Text>
        </Animated.View>

        {/* ── Actions ── */}
        <Animated.View style={[styles.actionsBlock, { opacity: btnAnim }]}>
          <ActionButton
            icon="business"
            label="Je suis un hôpital"
            sublabel="Inscription structure de soin"
            onPress={goToHospital}
            variant="primary"
          />
          <ActionButton
            icon="water-outline"
            label="Je suis la CNTS"
            sublabel="Centre National de Transfusion"
            onPress={goToCnts}
            variant="secondary"
          />
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
          <Text style={styles.footerText}>Déjà membre ?</Text>
          <TouchableOpacity
            onPress={goToLogin}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={styles.footerLink}>Se connecter</Text>
            <Ionicons
              name="arrow-forward-circle"
              size={16}
              color={colors.red}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Slogan ── */}
        <Animated.View style={[styles.slogan, { opacity: btnAnim }]}>
          <Text style={styles.sloganText}>
            L&apos;honneur qui engage, le lien qui sauve.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
