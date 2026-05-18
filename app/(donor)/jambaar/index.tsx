import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
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

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.08)",
  red: "#DC1E1E",
  green: "#1D9E75",
  amber: "#FAC775",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  progressBg: "rgba(255,255,255,0.07)",
} as const;

const GRADE_CONFIG: Record<
  DonorGrade,
  { icon: string; label: string; color: string; glow: string }
> = {
  ASPIRANT: {
    icon: "🌱",
    label: "Aspirant",
    color: COLORS.green,
    glow: "rgba(29,158,117,0.15)",
  },
  SENTINELLE: {
    icon: "⚔️",
    label: "Sentinelle",
    color: COLORS.amber,
    glow: "rgba(250,199,117,0.15)",
  },
  AMBASSADEUR: {
    icon: "🦁",
    label: "Ambassadeur",
    color: COLORS.red,
    glow: "rgba(220,30,30,0.15)",
  },
};

// ─── Composant Stat Card ───────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  subColor,
  isRank,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  isRank?: boolean;
}) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={isRank ? styles.rankValue : styles.statValue}>{value}</Text>
      {sub && (
        <Text style={[styles.statSub, subColor ? { color: subColor } : {}]}>
          {sub}
        </Text>
      )}
    </View>
  );
}

// ─── Composant Action Button ───────────────────────────────────
function ActionBtn({
  icon,
  label,
  color,
  onPress,
}: {
  icon: any;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.actionIconWrap, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.actionText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textSubtle} />
    </TouchableOpacity>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function JambaarProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useJambaarProfile();

  const progressWidth = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  if (isLoading || !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  const { profile, progression, ranks } = data;
  const grade = GRADE_CONFIG[profile.currentGrade] ?? GRADE_CONFIG.ASPIRANT;
  const nextGradeConfig = progression.nextGrade
    ? GRADE_CONFIG[progression.nextGrade]
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
              Jambaar <Text style={{ color: COLORS.red }}>Life</Text>
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View
              style={[
                styles.gradeBadge,
                {
                  backgroundColor: grade.glow,
                  borderColor: grade.color + "40",
                },
              ]}
            >
              <Text style={styles.gradeBadgeIcon}>{grade.icon}</Text>
              <Text style={[styles.gradeBadgeLabel, { color: grade.color }]}>
                {grade.label}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Carte grade principale ── */}
        <Animated.View style={[styles.gradeCard, { opacity: fadeAnim }]}>
          {/* Halo décoratif */}
          <View style={[styles.gradeHalo, { backgroundColor: grade.glow }]} />

          <View style={styles.gradeTop}>
            {/* Points */}
            <View style={styles.gradePoints}>
              <Text style={styles.eyebrowSmall}>TOTAL POINTS</Text>
              <Text style={styles.pointsValue}>
                {profile.totalPoints.toLocaleString()}
              </Text>
              <Text style={styles.pointsUnit}>points Jambaar</Text>
            </View>

            {/* Icône grade */}
            <View
              style={[
                styles.gradeIconCircle,
                {
                  borderColor: grade.color + "40",
                  backgroundColor: grade.glow,
                },
              ]}
            >
              <Text style={styles.gradeIconEmoji}>{grade.icon}</Text>
            </View>
          </View>

          {/* Barre de progression */}
          {progression.nextGrade && nextGradeConfig ? (
            <View style={styles.progressBlock}>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressGrade, { color: grade.color }]}>
                  {grade.label}
                </Text>
                <Text
                  style={[styles.progressGrade, { color: COLORS.textSubtle }]}
                >
                  {nextGradeConfig.label}
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      backgroundColor: grade.color,
                      width: progressWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressHint}>
                <Text style={{ color: grade.color, fontWeight: "700" }}>
                  {progression.pointsToNext} pts
                </Text>{" "}
                pour devenir {nextGradeConfig.icon} {nextGradeConfig.label}
              </Text>
            </View>
          ) : (
            <View style={styles.maxGradeRow}>
              <Ionicons name="trophy" size={16} color={COLORS.amber} />
              <Text style={styles.maxGradeText}>Grade maximal atteint !</Text>
            </View>
          )}
        </Animated.View>

        {/* ── Stats dons & vies ── */}
        <View style={styles.row}>
          <StatCard
            label="DONS EFFECTUÉS"
            value={profile.donationCount}
            sub="Total"
            subColor={COLORS.textSubtle}
          />
          <StatCard
            label="VIES SAUVÉES"
            value={`~${profile.livesSavedEstimate}`}
            sub="Estimées"
            subColor={COLORS.green}
          />
        </View>

        {/* ── Rangs ── */}
        <View style={styles.row}>
          <StatCard
            label="RANG GLOBAL"
            value={ranks.global ? `#${ranks.global}` : "—"}
            isRank
            sub="Classement mondial"
            subColor={COLORS.textSubtle}
          />
          <StatCard
            label={`RANG ${profile.city?.toUpperCase() ?? "LOCAL"}`}
            value={ranks.city ? `#${ranks.city}` : "—"}
            isRank
            sub={profile.city ?? "Configurez votre ville"}
            subColor={COLORS.textSubtle}
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
            style={[
              styles.eligibilityIconWrap,
              {
                backgroundColor: isEligible
                  ? "rgba(29,158,117,0.15)"
                  : "rgba(250,199,117,0.15)",
              },
            ]}
          >
            <Ionicons
              name={isEligible ? "checkmark-circle" : "time-outline"}
              size={22}
              color={isEligible ? COLORS.green : COLORS.amber}
            />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text
              style={[
                styles.eligibilityTitle,
                { color: isEligible ? COLORS.green : COLORS.amber },
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
            color={COLORS.amber}
            onPress={() => {
              tap();
              router.push("/(donor)/jambaar/badges" as any);
            }}
          />
          <View style={styles.actionSeparator} />
          <ActionBtn
            icon="podium-outline"
            label="Classement"
            color={COLORS.green}
            onPress={() => {
              tap();
              router.push("/(donor)/jambaar/leaderboard" as any);
            }}
          />
          <View style={styles.actionSeparator} />
          <ActionBtn
            icon="gift-outline"
            label="Récompenses"
            color={COLORS.red}
            onPress={() => {
              tap();
              router.push("/(donor)/jambaar/rewards" as any);
            }}
          />
        </View>

        {/* ── Slogan ── */}
        <Text style={styles.slogan}>
          Le lien qui sauve, l&apos;honneur qui engage.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingHorizontal: 20 },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 20,
  },
  eyebrow: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
  },
  eyebrowSmall: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerRight: {},
  gradeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  gradeBadgeIcon: { fontSize: 14 },
  gradeBadgeLabel: { fontSize: 12, fontWeight: "700" },

  // ── Grade Card ──
  gradeCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 20,
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  gradeHalo: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  gradeTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  gradePoints: { gap: 2 },
  pointsValue: {
    color: COLORS.white,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -2,
    lineHeight: 46,
  },
  pointsUnit: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  gradeIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  gradeIconEmoji: { fontSize: 38 },

  // Progression
  progressBlock: { gap: 8 },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressGrade: { fontSize: 11, fontWeight: "700" },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.progressBg,
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 3 },
  progressHint: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  maxGradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  maxGradeText: {
    color: COLORS.amber,
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Stats ──
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    gap: 4,
  },
  statLabel: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },
  rankValue: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
  },
  statSub: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textSubtle,
  },

  // ── Éligibilité ──
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
    backgroundColor: "rgba(29,158,117,0.07)",
    borderColor: "rgba(29,158,117,0.22)",
  },
  notEligibleCard: {
    backgroundColor: "rgba(250,199,117,0.06)",
    borderColor: "rgba(250,199,117,0.20)",
  },
  eligibilityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  eligibilityTitle: { fontSize: 14, fontWeight: "700" },
  eligibilitySub: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },

  // ── Actions ──
  sectionTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  actionsBlock: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 28,
    overflow: "hidden",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
  },
  actionSeparator: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginLeft: 72,
  },

  // ── Slogan ──
  slogan: {
    color: COLORS.textSubtle,
    fontSize: 11,
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});
