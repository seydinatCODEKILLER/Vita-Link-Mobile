import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.07)",
  red: "#DC1E1E",
  green: "#1D9E75",
  amber: "#FAC775",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.42)",
  textSubtle: "rgba(255,255,255,0.16)",
  blue: "#60A5FA",
} as const;

// ─── Status Config ────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  VERIFIED: { label: "Vérifié", color: COLORS.green, icon: "shield-checkmark" },
  PENDING_REVIEW: {
    label: "En attente",
    color: COLORS.amber,
    icon: "time-outline",
  },
  SUSPENDED: {
    label: "Suspendu",
    color: COLORS.red,
    icon: "alert-circle-outline",
  },
};

// ─── ProfileRow ────────────────────────────────────────────────
function ProfileRow({
  icon,
  label,
  value,
  valueColor,
  onPress,
  rightElement,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  valueColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View
        style={[
          styles.rowIconWrap,
          {
            backgroundColor: valueColor
              ? valueColor + "14"
              : "rgba(255,255,255,0.05)",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={valueColor ?? COLORS.textMuted}
        />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && (
        <Text
          style={[styles.rowValue, valueColor && { color: valueColor }]}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}
      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={14} color={COLORS.textSubtle} />
      )}
    </TouchableOpacity>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function HealthProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  // ✅ MODIFICATION : On utilise le hook dédié pour avoir la structure complète
  const { data: structure, isLoading: isStructureLoading } = useMyStructure();

  const { mutate: toggleAvailability, isPending: isTogglingAvail } =
    useUpdateAvailability();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

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
            Notre <Text style={{ color: COLORS.red }}>Structure</Text>
          </Text>
          <View style={{ width: 38 }} />
        </Animated.View>

        {/* ── Hero Card Structure ── */}
        <Animated.View
          style={[
            styles.heroCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {isStructureLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.red} size="small" />
              <Text style={styles.loadingText}>Chargement des données...</Text>
            </View>
          ) : (
            <>
              <View style={styles.heroTop}>
                <View
                  style={[
                    styles.avatarWrap,
                    {
                      backgroundColor: COLORS.red + "14",
                      borderColor: COLORS.red + "30",
                    },
                  ]}
                >
                  <Ionicons name="business" size={28} color={COLORS.red} />
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

              {/* ✅ NOUVEAU : Bannière d'information administrative */}
              <View style={styles.fixedDataBanner}>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color={COLORS.textMuted}
                />
                <Text style={styles.fixedDataText}>
                  Les informations de la structure sont fixes. Pour toute
                  modification, contactez l&apos;administration Vita-Link.
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        {/* ── Centre de Commandement ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>CENTRE DE COMMANDEMENT</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="pulse-outline"
              label="Alertes actives"
              value="Gérer"
              valueColor={COLORS.red}
              onPress={() => router.push("/(health)/alerts" as any)}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="scan-outline"
              label="Scanner un donneur"
              value="Valider un don"
              valueColor={COLORS.green}
              onPress={() => router.push("/(health)/scan" as any)}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="water-outline"
              label="Stock de sang"
              value="Monitoring"
              valueColor={COLORS.amber}
              onPress={() => router.push("/(health)/stock" as any)}
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
              valueColor={COLORS.blue}
              onPress={() => router.push("/(health)/staff" as any)}
            />
            <View style={styles.sep} />
            {/* ✅ MODIFICATION : Plus d'erreur TypeScript ici ! */}
            <ProfileRow
              icon="document-text-outline"
              label="N° d'enregistrement"
              value={structure?.registrationNumber ?? "—"}
              valueColor={COLORS.textMuted}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="call-outline"
              label="Téléphone"
              value={structure?.phone ?? user?.phone ?? "—"}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="mail-outline"
              label="Email"
              value={structure?.email ?? user?.email ?? "—"}
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
              <ActivityIndicator color={COLORS.red} />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={17} color={COLORS.red} />
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

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scrollContent: { paddingHorizontal: 20 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 22,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // ✅ NOUVEAU : Style pour la bannière d'information
  fixedDataBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 10,
    marginTop: 10, // Espace sous le badge de statut
  },
  fixedDataText: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },

  // Hero Card
  heroCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 18,
    marginBottom: 20,
    overflow: "hidden",
  },
  // ✅ AJOUT : Styles pour le loader
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 20,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },

  // Avatar / Icon Wrap
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexShrink: 0,
  },

  // Hero Info
  heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  heroInfo: { flex: 1, gap: 5 },
  structureName: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  structureAddress: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },

  // Status Pill
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

  // Sections
  section: { marginBottom: 18 },
  sectionTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 9,
  },

  // Card & Rows
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    minHeight: 50,
  },
  rowIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rowLabel: { flex: 1, color: COLORS.white, fontSize: 14, fontWeight: "500" },
  rowHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  rowValue: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 2,
    maxWidth: 130,
  },
  sep: { height: 0.5, backgroundColor: COLORS.cardBorder, marginLeft: 58 },

  // Actions
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
    borderColor: "rgba(220,30,30,0.30)",
    backgroundColor: "rgba(220,30,30,0.05)",
  },
  logoutText: { color: COLORS.red, fontSize: 15, fontWeight: "700" },
  versionText: {
    color: COLORS.textSubtle,
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
  },
});
