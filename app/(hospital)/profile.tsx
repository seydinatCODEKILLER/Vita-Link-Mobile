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
import { useMyStructure } from "@/src/hooks/useHealthStructure";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";

const STRUCTURE_TYPE_LABELS: Record<string, string> = {
  HOSPITAL: "Hôpital",
  HEALTH_CENTER: "Centre de santé",
};

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
    label: "En attente de vérification",
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
export default function HospitalProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const { data: structure, isLoading: isStructureLoading } = useMyStructure();
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
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    structureAddress: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    pillRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginTop: 3 },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 0.5,
    },
    statusText: { fontSize: 11, fontWeight: "700" },
    typePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 0.5,
      backgroundColor: "rgba(96,165,250,0.10)",
      borderColor: "rgba(96,165,250,0.25)",
    },
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
    // ── Pending banner ──
    pendingBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: "rgba(250,199,117,0.08)",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(250,199,117,0.20)",
      padding: 14,
      marginBottom: 20,
    },
    pendingIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: "rgba(250,199,117,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    pendingTitle: {
      color: c.amber,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    pendingText: {
      color: "rgba(250,199,117,0.65)",
      fontSize: 12,
      lineHeight: 18,
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
    themeLabel: { color: c.white, fontSize: 14, fontWeight: "500" },
    themeHint: { color: c.textMuted, fontSize: 11 },
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

  const isPending = structure?.status === "PENDING_REVIEW";
  const structureTypeLabel = (structure as any)?.structureType
    ? (STRUCTURE_TYPE_LABELS[(structure as any).structureType] ??
      "Établissement")
    : null;

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
            Notre{" "}
            <Text style={{ color: colors.red }}>
              {structureTypeLabel ?? "Établissement"}
            </Text>
          </Text>
          <ThemeToggle size={40} />
        </Animated.View>

        {/* ── Bannière structure en attente ── */}
        {isPending && (
          <Animated.View style={[styles.pendingBanner, { opacity: fadeAnim }]}>
            <View style={styles.pendingIconWrap}>
              <Ionicons name="time-outline" size={18} color={colors.amber} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.pendingTitle}>
                Établissement en cours de vérification
              </Text>
              <Text style={styles.pendingText}>
                Votre CNTS affiliée est en train de valider votre dossier.
                Certaines fonctionnalités sont limitées jusqu&apos;à
                l&apos;approbation.
              </Text>
            </View>
          </Animated.View>
        )}

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
                    backgroundColor: "rgba(96,165,250,0.10)",
                    borderColor: "rgba(96,165,250,0.25)",
                  }}
                >
                  <Ionicons name="business-outline" size={28} color="#60A5FA" />
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.structureName} numberOfLines={2}>
                    {structure?.name ?? "Établissement de santé"}
                  </Text>
                  {structure?.address && (
                    <Text style={styles.structureAddress} numberOfLines={1}>
                      {structure.address}
                    </Text>
                  )}
                  <View style={styles.pillRow}>
                    {/* Statut */}
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
                        style={[
                          styles.statusText,
                          { color: statusConfig.color },
                        ]}
                      >
                        {statusConfig.label}
                      </Text>
                    </View>
                    {/* Type */}
                    {structureTypeLabel && (
                      <View style={styles.typePill}>
                        <Ionicons
                          name="medkit-outline"
                          size={11}
                          color="#60A5FA"
                        />
                        <Text style={[styles.statusText, { color: "#60A5FA" }]}>
                          {structureTypeLabel}
                        </Text>
                      </View>
                    )}
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
                  modification, contactez votre CNTS affiliée.
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

        {/* ── Gestion ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>GESTION</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="water-outline"
              label="Demandes de sang"
              value="Suivi"
              valueColor={colors.red}
              onPress={() => router.push("/(hospital)/blood-request" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="people-outline"
              label="Gérer le personnel"
              value="Équipe"
              valueColor="#60A5FA"
              onPress={() => router.push("/(hospital)/staff" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="megaphone-outline"
              label="Alertes donneurs"
              value="Voir"
              valueColor={colors.amber}
              onPress={() => router.push("/(hospital)/alerts" as any)}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* ── Informations ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>INFORMATIONS</Text>
          <View style={styles.card}>
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
            <View style={styles.sep} />
            <ProfileRow
              icon="person-outline"
              label="Responsable"
              value={user ? `${user.firstName} ${user.lastName}` : "—"}
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
          <Text style={styles.versionText}>Vita-Link Hôpital v2.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
