import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/src/store/auth.store";
import { useMyStructure } from "@/src/hooks/useHealthStructure";
import { useColors } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";

import { ProfileRow } from "@/src/components/profile/ProfileRow";
import { StructureHeroCard } from "@/src/components/profile/StructureHeroCard";
import { useProfileScreen } from "@/src/hooks/useProfileScreen";
import { useProfileStyles } from "@/src/hooks/useProfileStyles";

export default function HealthProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const { data: structure, isLoading: isStructureLoading } = useMyStructure();

  const { fadeAnim, slideAnim, isLoggingOut, handleLogout } =
    useProfileScreen();
  const styles = useProfileStyles();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "ios" ? 120 : 90 },
        ]}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headerTitle}>
            Notre <Text style={{ color: colors.red }}>CNTS</Text>
          </Text>
          <ThemeToggle size={40} />
        </Animated.View>

        {/* ── Hero Card ───────────────────────────────────────────────────── */}
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <StructureHeroCard
            isLoading={isStructureLoading}
            structure={structure}
          />
        </Animated.View>

        {/* ── Apparence ───────────────────────────────────────────────────── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>APPARENCE</Text>
          <View style={styles.card}>
            <View style={styles.themeRow}>
              <View style={styles.themeIconWrap}>
                <Ionicons
                  name={theme === "dark" ? "moon-outline" : "sunny-outline"}
                  size={17}
                  color={colors.amber}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.themeLabel}>Thème de l&apos;interface</Text>
                <Text style={styles.themeHint}>
                  {theme === "dark" ? "Mode sombre" : "Mode clair"}
                </Text>
              </View>
              <ThemeToggle size={36} />
            </View>
          </View>
        </Animated.View>

        {/* ── Centre de Commandement ──────────────────────────────────────── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>CENTRE DE COMMANDEMENT</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="pulse-outline"
              label="Alertes actives"
              value="Gérer"
              valueColor={colors.red}
              onPress={() =>
                router.push("/(health)/alerts?from=profile" as any)
              }
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="scan-outline"
              label="Scanner un don"
              value="Valider"
              valueColor={colors.success}
              onPress={() => router.push("/(health)/scan?from=profile" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="water-outline"
              label="Stock de sang"
              value="Monitoring"
              valueColor={colors.amber}
              onPress={() => router.push("/(health)/stock?from=profile" as any)}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* ── Administration ──────────────────────────────────────────────── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>ADMINISTRATION</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="people-outline"
              label="Gérer le personnel"
              value="Équipe"
              valueColor="#60A5FA"
              onPress={() => router.push("/(health)/staff?from=profile" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="document-text-outline"
              label="N° Enregistrement"
              value={structure?.registrationNumber ?? "—"}
              valueColor={colors.textMuted}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="call-outline"
              label="Téléphone"
              value={structure?.phone ?? user?.phone ?? "—"}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="mail-outline"
              label="Email"
              value={structure?.email ?? user?.email ?? "—"}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* ── Actions ─────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color={colors.red} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={17} color={colors.red} />
                <Text style={styles.logoutText}>Déconnexion</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.versionText}>Vita-Link CNTS v2.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
