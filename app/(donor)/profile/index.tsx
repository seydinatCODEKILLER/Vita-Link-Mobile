import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/src/store/auth.store";
import { useIsEligible, useUserJambaarProfile } from "@/src/hooks/useAuthStore";
import { useUpdateAvailability } from "@/src/hooks/useAvailability";
import { useLogout } from "@/src/hooks/useAuth";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import dayjs from "dayjs";

// ─── Grade Config ─────────────────────────────────────────────
// Les couleurs de grade sont fixes (indépendantes du thème),
// donc on les garde en dehors du système de thème.
const GRADE_CONFIG: Record<
  string,
  {
    icon: string;
    label: string;
    color: string;
    gradient: readonly [string, string];
  }
> = {
  ASPIRANT: {
    icon: "🌱",
    label: "Aspirant",
    color: "#1D9E75",
    gradient: ["rgba(29,158,117,0.12)", "rgba(29,158,117,0.00)"] as const,
  },
  SENTINELLE: {
    icon: "⚔️",
    label: "Sentinelle",
    color: "#FAC775",
    gradient: ["rgba(250,199,117,0.12)", "rgba(250,199,117,0.00)"] as const,
  },
  AMBASSADEUR: {
    icon: "🦁",
    label: "Ambassadeur",
    color: "#DC1E1E",
    gradient: ["rgba(220,30,30,0.12)", "rgba(220,30,30,0.00)"] as const,
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
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  valueColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: AppColors;
}) {
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
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          backgroundColor: valueColor
            ? valueColor + "14"
            : colors.cardBorder,
        }}
      >
        <Ionicons
          name={icon}
          size={17}
          color={valueColor ?? colors.textMuted}
        />
      </View>
      <Text style={{ flex: 1, color: colors.white, fontSize: 14, fontWeight: "500" }}>
        {label}
      </Text>
      {value && (
        <Text
          style={{
            color: valueColor ?? colors.textMuted,
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

// ─── StatBadge ────────────────────────────────────────────────
function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: color + "15",
        }}
      >
        <Ionicons name={icon} size={13} color={color} />
      </View>
      <Text style={{ fontSize: 15, fontWeight: "800", letterSpacing: -0.3, color }}>
        {value}
      </Text>
      <Text style={{ color: "rgba(255,255,255,0.42)", fontSize: 10, fontWeight: "600" }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const user = useAuthStore((s) => s.user);
  const profile = useUserJambaarProfile();
  const { isEligible, daysLeft } = useIsEligible();

  const { mutate: toggleAvailability, isPending: isTogglingAvail } =
    useUpdateAvailability();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
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
      color: c.white,
      fontSize: 27,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    editBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },

    // Hero Card
    heroCard: {
      backgroundColor: c.cardBg,
      borderRadius: 22,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 18,
      marginBottom: 20,
      gap: 14,
      overflow: "hidden",
    },

    // Avatar
    avatarWrap: { position: "relative", flexShrink: 0 },
    avatarRing: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderColor: c.cardBorder,
    },
    avatarImage: { width: 68, height: 68, borderRadius: 18 },
    avatarEmoji: { fontSize: 30 },

    // Hero Info
    heroTop: { flexDirection: "row", alignItems: "center", gap: 14 },
    heroInfo: { flex: 1, gap: 5 },
    userName: {
      color: c.white,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.3,
    },
    userPhone: { color: c.textMuted, fontSize: 12, fontWeight: "500" },

    // Pills
    pillsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: 3,
      flexWrap: "wrap",
    },
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 0.5,
    },
    pillBlood: {
      backgroundColor: "rgba(220,30,30,0.13)",
      borderColor: "rgba(220,30,30,0.30)",
    },
    pillEmpty: {
      backgroundColor: c.cardBorder,
      borderColor: c.cardBorder,
    },
    pillText: { fontSize: 11, fontWeight: "700" },
    pillTextBlood: { color: c.red },
    pillEmoji: { fontSize: 11 },

    // Stats
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.inputBg,
      borderRadius: 13,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      paddingVertical: 11,
    },
    statSep: { width: 0.5, height: 26, backgroundColor: c.cardBorder },

    // Éligibilité
    eligRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      padding: 12,
      borderRadius: 13,
    },
    eligRowGreen: {
      backgroundColor: "rgba(29,158,117,0.07)",
      borderWidth: 0.5,
      borderColor: "rgba(29,158,117,0.20)",
    },
    eligRowAmber: {
      backgroundColor: "rgba(250,199,117,0.06)",
      borderWidth: 0.5,
      borderColor: "rgba(250,199,117,0.18)",
    },
    eligDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
    eligTitle: { fontSize: 13, fontWeight: "700", marginBottom: 1 },
    eligSub: { color: c.textMuted, fontSize: 11, lineHeight: 15 },
    eligIcon: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },

    // Sections
    section: { marginBottom: 18 },
    sectionTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 9,
    },

    // Card & Rows
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      overflow: "hidden",
    },
    rowHint: { color: c.textMuted, fontSize: 11, marginTop: 1 },
    sep: { height: 0.5, backgroundColor: c.cardBorder, marginLeft: 58 },

    // Disponibilité
    availIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    availRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      padding: 13,
      minHeight: 50,
      paddingRight: 8,
    },

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
    logoutText: { color: c.red, fontSize: 15, fontWeight: "700" },
    deleteText: { color: c.textSubtle, fontSize: 13, fontWeight: "500" },
    versionText: {
      color: c.textSubtle,
      fontSize: 10,
      opacity: 0.5,
      marginTop: 4,
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

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "Supprimer mon compte",
      "Cette action est irréversible. Toutes vos données seront anonymisées.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", style: "destructive", onPress: () => {} },
      ],
    );
  };

  const gradeConfig = profile?.currentGrade
    ? GRADE_CONFIG[profile.currentGrade]
    : GRADE_CONFIG.ASPIRANT;

  const bloodLabel = user?.bloodType
    ? (BLOOD_TYPE_LABELS[user.bloodType] ?? user.bloodType.replace("_", ""))
    : "Non défini";

  const donationCount = profile?.donationCount ?? 0;
  const livesSaved = profile?.livesSavedEstimate ?? 0;
  const totalPoints = profile?.totalPoints ?? 0;

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
            Mon <Text style={{ color: gradeConfig.color }}>Profil</Text>
          </Text>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push("/(donor)/profile/edit" as any)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Hero Card ── */}
        <Animated.View
          style={[
            styles.heroCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <LinearGradient
            colors={[...gradeConfig.gradient] as [string, string]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Identity */}
          <View style={styles.heroTop}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={[gradeConfig.color + "35", gradeConfig.color + "08"]}
                style={styles.avatarRing}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarEmoji}>🩸</Text>
                )}
              </LinearGradient>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: colors.cardBg,
                  backgroundColor: gradeConfig.color,
                }}
                onPress={() => router.push("/(donor)/profile/edit" as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={10} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.userName}>
                {user?.firstName} {user?.lastName}
              </Text>
              {user?.phone && (
                <Text style={styles.userPhone}>{user.phone}</Text>
              )}
              <View style={styles.pillsRow}>
                <View
                  style={[
                    styles.pill,
                    styles.pillBlood,
                    !user?.bloodType && styles.pillEmpty,
                  ]}
                >
                  <Ionicons
                    name="water"
                    size={11}
                    color={user?.bloodType ? colors.red : colors.textSubtle}
                  />
                  <Text
                    style={[
                      styles.pillText,
                      styles.pillTextBlood,
                      !user?.bloodType && { color: colors.textMuted },
                    ]}
                  >
                    {bloodLabel}
                  </Text>
                </View>
                {profile && (
                  <View
                    style={[
                      styles.pill,
                      {
                        backgroundColor: gradeConfig.color + "14",
                        borderColor: gradeConfig.color + "30",
                      },
                    ]}
                  >
                    <Text style={styles.pillEmoji}>{gradeConfig.icon}</Text>
                    <Text
                      style={[styles.pillText, { color: gradeConfig.color }]}
                    >
                      {gradeConfig.label}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <StatBadge
              icon="water"
              label="Dons"
              value={donationCount}
              color={colors.red}
            />
            <View style={styles.statSep} />
            <StatBadge
              icon="heart"
              label="Vies"
              value={`~${livesSaved}`}
              color={colors.success}
            />
            <View style={styles.statSep} />
            <StatBadge
              icon="star"
              label="Points"
              value={totalPoints.toLocaleString()}
              color={colors.amber}
            />
          </View>

          {/* Éligibilité */}
          <View
            style={[
              styles.eligRow,
              isEligible ? styles.eligRowGreen : styles.eligRowAmber,
            ]}
          >
            <View
              style={[
                styles.eligDot,
                { backgroundColor: isEligible ? colors.success : colors.amber },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.eligTitle,
                  { color: isEligible ? colors.success : colors.amber },
                ]}
              >
                {isEligible
                  ? "Éligible au don"
                  : `Repos en cours (${daysLeft}j)`}
              </Text>
              <Text style={styles.eligSub}>
                {isEligible
                  ? "Vous pouvez répondre aux alertes"
                  : `Prochain don le ${dayjs(profile?.nextEligibilityAt).format("DD MMM YYYY")}`}
              </Text>
            </View>
            <View
              style={[
                styles.eligIcon,
                {
                  backgroundColor:
                    (isEligible ? colors.success : colors.amber) + "18",
                },
              ]}
            >
              <Ionicons
                name={isEligible ? "checkmark" : "time"}
                size={13}
                color={isEligible ? colors.success : colors.amber}
              />
            </View>
          </View>
        </Animated.View>

        {/* ── Disponibilité ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>DISPONIBILITÉ</Text>
          <View style={styles.card}>
            <View style={styles.availRow}>
              <View
                style={[
                  styles.availIconWrap,
                  {
                    backgroundColor: user?.isAvailable
                      ? colors.success + "14"
                      : colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name={user?.isAvailable ? "pulse" : "pulse-outline"}
                  size={17}
                  color={user?.isAvailable ? colors.success : colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.white, fontSize: 14, fontWeight: "500" }}>
                  Disponible pour donner
                </Text>
                <Text style={styles.rowHint}>
                  {user?.isAvailable ? "Alertes activées" : "Alertes en pause"}
                </Text>
              </View>
              <Switch
                trackColor={{
                  false: colors.cardBorder,
                  true: colors.success,
                }}
                thumbColor={colors.white}
                value={user?.isAvailable ?? true}
                onValueChange={(val) => toggleAvailability(val)}
                disabled={isTogglingAvail}
                ios_backgroundColor={colors.cardBorder}
              />
            </View>
          </View>
        </Animated.View>

        {/* ── Mon Compte ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>MON COMPTE</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="call-outline"
              label="Téléphone"
              value={user?.phone}
              onPress={() => router.push("/(donor)/profile/edit" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="mail-outline"
              label="Email"
              value={user?.email ?? "Non renseigné"}
              onPress={() => router.push("/(donor)/profile/edit" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="water-outline"
              label="Groupe sanguin"
              value={bloodLabel}
              valueColor={colors.red}
              onPress={() => router.push("/(donor)/profile/edit" as any)}
              colors={colors}
            />
          </View>
        </Animated.View>

        {/* ── Plus ── */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>PLUS</Text>
          <View style={styles.card}>
            <ProfileRow
              icon="time-outline"
              label="Historique des dons"
              onPress={() => router.push("/(donor)/donations" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="settings-outline"
              label="Paramètres"
              onPress={() => router.push("/(donor)/profile/settings" as any)}
              colors={colors}
            />
            <View style={styles.sep} />
            <ProfileRow
              icon="help-circle-outline"
              label="Aide & Support"
              onPress={() => {}}
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
          <TouchableOpacity
            onPress={handleDelete}
            activeOpacity={0.7}
            style={{ paddingVertical: 10 }}
          >
            <Text style={styles.deleteText}>Supprimer mon compte</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>Vita-Link v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}