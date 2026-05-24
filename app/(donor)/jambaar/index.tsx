import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import { useJambaarProfile } from "@/src/hooks/useJambaar";
import { useAuthStore } from "@/src/store/auth.store";
import { DonorGrade } from "@/src/types/shared.types";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

const GRADE_CONFIG: Record<
  DonorGrade,
  { icon: string; label: string; colorKey: keyof AppColors; glowAlpha: string }
> = {
  ASPIRANT: {
    icon: "🌱",
    label: "Aspirant",
    colorKey: "success",
    glowAlpha: "26",
  },
  SENTINELLE: {
    icon: "⚔️",
    label: "Sentinelle",
    colorKey: "amber",
    glowAlpha: "26",
  },
  AMBASSADEUR: {
    icon: "🦁",
    label: "Ambassadeur",
    colorKey: "red",
    glowAlpha: "26",
  },
};

// ─── Skeleton Jambaar ──────────────────────────────────────────
function JambaarSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    line: {
      height: 10,
      borderRadius: 5,
      backgroundColor: c.cardBorder,
    },
  }));

  return (
    <View style={{ paddingHorizontal: 20, gap: 12, opacity: 0.6 }}>
      {/* Fake Grade Card */}
      <View
        style={[styles.cardBg, { height: 180, borderRadius: 24, padding: 20 }]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ gap: 8, width: "60%" }}>
            <View style={[styles.line, { width: "40%" }]} />
            <View style={[styles.line, { width: "80%", height: 20 }]} />
            <View style={[styles.line, { width: "50%" }]} />
          </View>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 18,
              backgroundColor: colors.cardBorder,
            }}
          />
        </View>
        <View style={{ marginTop: 20, gap: 8 }}>
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={[styles.line, { width: "60%" }]} />
        </View>
      </View>
      {/* Fake Stats */}
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[styles.cardBg, { flex: 1, height: 90 }]} />
        <View style={[styles.cardBg, { flex: 1, height: 90 }]} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={[styles.cardBg, { flex: 1, height: 90 }]} />
        <View style={[styles.cardBg, { flex: 1, height: 90 }]} />
      </View>
      {/* Fake Actions */}
      <View style={[styles.cardBg, { height: 180 }]} />
    </View>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  subColor,
  isRank,
  colors,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  isRank?: boolean;
  colors: AppColors;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 16,
        gap: 4,
      }}
    >
      <Text
        style={{
          color: colors.textSubtle,
          fontSize: 9,
          fontWeight: "700",
          letterSpacing: 1.2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          color: colors.white,
          fontSize: 30,
          fontWeight: "900",
          letterSpacing: -1,
        }}
      >
        {value}
      </Text>
      {sub && (
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            color: subColor ?? colors.textSubtle,
          }}
        >
          {sub}
        </Text>
      )}
    </View>
  );
}

// ─── Action Button ─────────────────────────────────────────────
function ActionBtn({
  icon,
  label,
  color,
  onPress,
  colors,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
  colors: AppColors;
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 16,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: color + "26",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text
        style={{
          flex: 1,
          color: colors.white,
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSubtle} />
    </TouchableOpacity>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function JambaarProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const colors = useColors();

  // ─── RÉCUPÉRATION DES DONNées ET ERREURS ────────────────────
  const { data, isLoading, isError, error, refetch } = useJambaarProfile();

  const progressWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    scrollContent: { paddingHorizontal: 20 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 20,
    },
    eyebrow: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 2,
    },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    gradeCard: {
      backgroundColor: c.cardBg,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 20,
      marginBottom: 12,
      overflow: "hidden",
      position: "relative",
    },
    gradeTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    pointsValue: {
      color: c.white,
      fontSize: 42,
      fontWeight: "900",
      letterSpacing: -2,
      lineHeight: 46,
    },
    pointsUnit: { color: c.textMuted, fontSize: 13, fontWeight: "500" },
    eyebrowSmall: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    progressBarBg: {
      height: 6,
      borderRadius: 3,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },
    progressBarFill: { height: "100%", borderRadius: 3 },
    progressHint: { color: c.textMuted, fontSize: 12 },
    maxGradeText: { color: c.amber, fontSize: 14, fontWeight: "700" },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    eligibilityCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderRadius: 18,
      borderWidth: 1,
      padding: 14,
      marginBottom: 24,
    },
    eligibleCard: {
      backgroundColor: c.success + "12",
      borderColor: c.success + "38",
    },
    notEligibleCard: {
      backgroundColor: c.amber + "10",
      borderColor: c.amber + "33",
    },
    eligibilityTitle: { fontSize: 14, fontWeight: "700" },
    eligibilitySub: { color: c.textMuted, fontSize: 12, lineHeight: 18 },
    sectionTitle: {
      color: c.textSubtle,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 1.5,
      marginBottom: 10,
    },
    actionsBlock: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 28,
      overflow: "hidden",
    },
    actionSeparator: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginLeft: 72,
    },
    slogan: {
      color: c.textSubtle,
      fontSize: 11,
      textAlign: "center",
      fontStyle: "italic",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (data?.progression) {
      Animated.spring(progressWidth, {
        toValue: data.progression.progressPercent,
        friction: 7,
        tension: 40,
        useNativeDriver: false,
      }).start();
    }
  }, [data?.progression]);

  // ─── LOGIQUE D'ERREUR RÉSEAU ────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View style={{ gap: 2 }}>
            <Text style={styles.eyebrow}>PROGRAMME</Text>
            <Text style={styles.headerTitle}>
              Jambaar <Text style={{ color: colors.red }}>Life</Text>
            </Text>
          </View>
        </View>
        <JambaarSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <View style={{ gap: 2 }}>
            <Text style={styles.eyebrow}>PROGRAMME</Text>
            <Text style={styles.headerTitle}>
              Jambaar <Text style={{ color: colors.red }}>Life</Text>
            </Text>
          </View>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ─────────────────────────────────────────
  // (Si on a des données en cache même en cas d'erreur légère, on les affiche)
  if (!data) return null;

  const { profile, progression, ranks } = data;
  const gradeConfig =
    GRADE_CONFIG[profile.currentGrade] ?? GRADE_CONFIG.ASPIRANT;
  const gradeColor = colors[gradeConfig.colorKey] as string;
  const nextGradeConfig = progression.nextGrade
    ? GRADE_CONFIG[progression.nextGrade]
    : null;
  const nextGradeColor = nextGradeConfig
    ? (colors[nextGradeConfig.colorKey] as string)
    : null;

  const isEligible =
    !profile.nextEligibilityAt ||
    new Date(profile.nextEligibilityAt) <= new Date();
  const daysUntilEligible = !isEligible
    ? dayjs(profile.nextEligibilityAt).diff(dayjs(), "day")
    : 0;

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "ios" ? 100 : 80 },
        ]}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={{ gap: 2 }}>
            <Text style={styles.eyebrow}>PROGRAMME</Text>
            <Text style={styles.headerTitle}>
              Jambaar <Text style={{ color: colors.red }}>Life</Text>
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              backgroundColor: gradeColor + gradeConfig.glowAlpha,
              borderColor: gradeColor + "40",
            }}
          >
            <Text style={{ fontSize: 14 }}>{gradeConfig.icon}</Text>
            <Text
              style={{ color: gradeColor, fontSize: 12, fontWeight: "700" }}
            >
              {gradeConfig.label}
            </Text>
          </View>
        </Animated.View>

        {/* ── Carte grade ── */}
        <Animated.View style={[styles.gradeCard, { opacity: fadeAnim }]}>
          <View
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: 90,
              backgroundColor: gradeColor + gradeConfig.glowAlpha,
            }}
          />

          <View style={styles.gradeTop}>
            <View style={{ gap: 2 }}>
              <Text style={styles.eyebrowSmall}>TOTAL POINTS</Text>
              <Text style={styles.pointsValue}>
                {profile.totalPoints.toLocaleString()}
              </Text>
              <Text style={styles.pointsUnit}>points Jambaar</Text>
            </View>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                borderWidth: 1.5,
                alignItems: "center",
                justifyContent: "center",
                borderColor: gradeColor + "40",
                backgroundColor: gradeColor + gradeConfig.glowAlpha,
              }}
            >
              <Text style={{ fontSize: 38 }}>{gradeConfig.icon}</Text>
            </View>
          </View>

          {progression.nextGrade && nextGradeConfig && nextGradeColor ? (
            <View style={{ gap: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{ color: gradeColor, fontSize: 11, fontWeight: "700" }}
                >
                  {gradeConfig.label}
                </Text>
                <Text
                  style={{
                    color: colors.textSubtle,
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {nextGradeConfig.label}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: gradeColor,
                      width: progressWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                <Text style={{ color: gradeColor, fontWeight: "700" }}>
                  {progression.pointsToNext} pts
                </Text>{" "}
                pour devenir {nextGradeConfig.icon} {nextGradeConfig.label}
              </Text>
            </View>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Ionicons name="trophy" size={16} color={colors.amber} />
              <Text style={styles.maxGradeText}>Grade maximal atteint !</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Stats ── */}
        <View style={styles.row}>
          <StatCard
            label="DONS EFFECTUÉS"
            value={profile.donationCount}
            sub="Total"
            subColor={colors.textSubtle}
            colors={colors}
          />
          <StatCard
            label="VIES SAUVÉES"
            value={`~${profile.livesSavedEstimate}`}
            sub="Estimées"
            subColor={colors.success}
            colors={colors}
          />
        </View>
        <View style={styles.row}>
          <StatCard
            label="RANG GLOBAL"
            value={ranks.global ? `#${ranks.global}` : "—"}
            isRank
            sub="Classement mondial"
            subColor={colors.textSubtle}
            colors={colors}
          />
          <StatCard
            label={`RANG ${profile.city?.toUpperCase() ?? "LOCAL"}`}
            value={ranks.city ? `#${ranks.city}` : "—"}
            isRank
            sub={profile.city ?? "Configurez votre ville"}
            subColor={colors.textSubtle}
            colors={colors}
          />
        </View>

        {/* ── Éligibilité ── */}
        <View
          style={[
            styles.eligibilityCard,
            isEligible ? styles.eligibleCard : styles.notEligibleCard,
          ]}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isEligible
                ? colors.success + "26"
                : colors.amber + "26",
            }}
          >
            <Ionicons
              name={isEligible ? "checkmark-circle" : "time-outline"}
              size={22}
              color={isEligible ? colors.success : colors.amber}
            />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={[
                styles.eligibilityTitle,
                { color: isEligible ? colors.success : colors.amber },
              ]}
            >
              {isEligible
                ? "Vous pouvez donner !"
                : `Éligible dans ${daysUntilEligible} jour${daysUntilEligible > 1 ? "s" : ""}`}
            </Text>
            <Text style={styles.eligibilitySub}>
              {isEligible
                ? "Votre prochain don est disponible maintenant"
                : `Période de repos — prochain don le ${dayjs(profile.nextEligibilityAt).format("DD MMM YYYY")}`}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <Text style={styles.sectionTitle}>EXPLORER</Text>
        <View style={styles.actionsBlock}>
          <ActionBtn
            icon="ribbon-outline"
            label="Mes Badges"
            color={colors.amber}
            colors={colors}
            onPress={() => {
              tap();
              router.push("/(donor)/jambaar/badges" as any);
            }}
          />
          <View style={styles.actionSeparator} />
          <ActionBtn
            icon="podium-outline"
            label="Classement"
            color={colors.success}
            colors={colors}
            onPress={() => {
              tap();
              router.push("/(donor)/jambaar/leaderboard" as any);
            }}
          />
          <View style={styles.actionSeparator} />
          <ActionBtn
            icon="gift-outline"
            label="Récompenses"
            color={colors.red}
            colors={colors}
            onPress={() => {
              tap();
              router.push("/(donor)/jambaar/rewards" as any);
            }}
          />
        </View>

        <Text style={styles.slogan}>
          Le lien qui sauve, l&apos;honneur qui engage.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
