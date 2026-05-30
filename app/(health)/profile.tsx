import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuthStore } from "@/src/store/auth.store";
import { useLogout } from "@/src/hooks/useAuth";
import { useUpdateAvailability } from "@/src/hooks/useAvailability";
import { useMyStructure } from "@/src/hooks/useHealthStructure";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";

const getStatusConfig = (
  colors: AppColors,
): Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> => ({
  VERIFIED: {
    label: "Vérifié",
    color: colors.success,
    icon: "shield-checkmark",
  },
  PENDING_REVIEW: {
    label: "En attente",
    color: colors.amber,
    icon: "time-outline",
  },
  SUSPENDED: {
    label: "Suspendu",
    color: colors.red,
    icon: "alert-circle-outline",
  },
});

// ─── ProfileRow ────────────────────────────────────────────────
function ProfileRow({
  icon,
  label,
  value,
  valueColor,
  onPress,
  rightElement,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  valueColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: AppColors;
}) {
  const rowColor = valueColor ?? colors.textMuted;
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        padding: 13,
        minHeight: 50,
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: valueColor ? valueColor + "14" : colors.cardBorder,
        }}
      >
        <Ionicons name={icon} size={17} color={rowColor} />
      </View>
      <Text
        style={{
          flex: 1,
          color: colors.white,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>
      {value && (
        <Text
          style={{
            color: rowColor,
            fontSize: 13,
            fontWeight: "600",
            marginRight: 2,
            maxWidth: 130,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={14} color={colors.textSubtle} />
      )}
    </TouchableOpacity>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function HealthProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme); // Récupération du thème actuel
  const user = useAuthStore((s) => s.user);
  const { data: structure, isLoading: isStructureLoading } = useMyStructure();
  useUpdateAvailability();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const STATUS_CONFIG = getStatusConfig(colors);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    scrollContent: { paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 22,
    },
    headerTitle: {
      color: c.white,
      fontSize: 27,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    heroCard: {
      backgroundColor: c.cardBg,
      borderRadius: 22,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 18,
      marginBottom: 20,
      overflow: "hidden",
    },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 20,
    },
    loadingText: { color: c.textMuted, fontSize: 13, fontWeight: "500" },
    heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
    heroInfo: { flex: 1, gap: 5 },
    structureName: {
      color: c.white,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    structureAddress: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 0.5,
      alignSelf: "flex-start",
      marginTop: 3,
    },
    statusText: { fontSize: 11, fontWeight: "700" },
    fixedDataBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.cardBorder,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 10,
      marginTop: 10,
    },
    fixedDataText: {
      flex: 1,
      color: c.textMuted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "500",
    },
    section: { marginBottom: 18 },
    sectionTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 9,
    },
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    sep: { height: 0.5, backgroundColor: c.cardBorder, marginLeft: 58 },
    actions: { marginTop: 6, gap: 10, alignItems: "center", paddingBottom: 20 },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      paddingVertical: 14,
      borderRadius: 15,
      borderWidth: 0.5,
      borderColor: c.red + "30",
      backgroundColor: c.red + "0D",
    },
    logoutText: { color: c.red, fontSize: 15, fontWeight: "700" },
    versionText: {
      color: c.textSubtle,
      fontSize: 10,
      opacity: 0.5,
      marginTop: 4,
    },
    // ─── Styles pour la section Apparence ───
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      minHeight: 50,
    },
    themeIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.amber + "15",
    },
    themeLabel: {
      color: c.white,
      fontSize: 14,
      fontWeight: "500",
    },
    themeHint: {
      color: c.textMuted,
      fontSize: 11,
    },
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter de Vita-Link ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: () => logout() },
    ]);
  };

  const statusConfig = structure?.status
    ? STATUS_CONFIG[structure.status]
    : STATUS_CONFIG.PENDING_REVIEW;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "ios" ? 120 : 90 },
        ]}
      >
        {/* ── Header ── */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.headerTitle}>
            Notre <Text style={{ color: colors.red }}>Structure</Text>
          </Text>
          <ThemeToggle size={40} />
        </Animated.View>

        {/* ── Hero Card ── */}
        <Animated.View
          style={[
            styles.heroCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {isStructureLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.red} size="small" />
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroTop}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    flexShrink: 0,
                    backgroundColor: colors.red + "14",
                    borderColor: colors.red + "30",
                  }}
                >
                  <Ionicons name="business" size={28} color={colors.red} />
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.structureName} numberOfLines={2}>
                    {structure?.name ?? "Structure de Santé"}
                  </Text>
                  {structure?.address && (
                    <Text style={styles.structureAddress} numberOfLines={1}>
                      {structure.address}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: statusConfig.color + "14",
                        borderColor: statusConfig.color + "30",
                      },
                    ]}
                  >
                    <Ionicons
                      name={statusConfig.icon}
                      size={11}
                      color={statusConfig.color}
                    />
                    <Text
                      style={[styles.statusText, { color: statusConfig.color }]}
                    >
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.fixedDataBanner}>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.fixedDataText}>
                  Les informations de la structure sont fixes. Pour toute
                  modification, contactez l&apos;administration Vita-Link.
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* ── Apparence ── */}
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

        {/* ── Centre de Commandement ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>CENTRE DE COMMANDEMENT</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="pulse-outline"
              label="Alertes actives"
              value="Gérer"
              valueColor={colors.red}
              onPress={() => router.push("/(health)/alerts?from=profile" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="scan-outline"
              label="Scanner un don"
              value="Valider un don"
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

        {/* ── Administration ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>ADMINISTRATION</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="people-outline"
              label="Gérer le personnel"
              value="Équipe"
              valueColor="#60A5FA" // Bleu hors palette
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

        {/* ── Actions ── */}
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
          <Text style={styles.versionText}>Vita-Link Health v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
