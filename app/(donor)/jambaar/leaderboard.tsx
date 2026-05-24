import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "@/src/store/auth.store";
import { useLeaderboard } from "@/src/hooks/useJambaar";
import { LeaderboardEntry } from "@/src/types/domain.types";
import { DonorGrade } from "@/src/types/shared.types";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

// ─── Types stricts pour les rangs ──────────────────────────────
interface RankStyle {
  color: string;
  bg: string;
  label: string;
}

// ─── Données statiques ─────────────────────────────────────────
type ScopeType = "global" | "city" | "district";

const SCOPES: {
  key: ScopeType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: "global", label: "Global", icon: "globe-outline" },
  { key: "city", label: "Ma Ville", icon: "location-outline" },
  { key: "district", label: "Quartier", icon: "home-outline" },
];

const GRADE_EMOJI: Record<DonorGrade, string> = {
  ASPIRANT: "🌱",
  SENTINELLE: "⚔️",
  AMBASSADEUR: "🦁",
};

// ─── Skeleton Leaderboard ──────────────────────────────────────
function LeaderboardSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 14,
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
    <View style={{ paddingHorizontal: 20, opacity: 0.6 }}>
      {/* Fake Scopes */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.cardBg, { height: 32, borderRadius: 20, width: 90 }]}
          />
        ))}
      </View>
      {/* Fake Podium */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 8,
          marginBottom: 30,
        }}
      >
        <View
          style={[
            styles.cardBg,
            { height: 90, width: "30%", borderRadius: 10 },
          ]}
        />
        <View
          style={[
            styles.cardBg,
            { height: 110, width: "30%", borderRadius: 10 },
          ]}
        />
        <View
          style={[
            styles.cardBg,
            { height: 70, width: "30%", borderRadius: 10 },
          ]}
        />
      </View>
      {/* Fake Rows */}
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={[
            styles.cardBg,
            {
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              padding: 12,
              marginBottom: 8,
            },
          ]}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View style={{ flex: 1, gap: 6 }}>
            <View style={[styles.line, { width: "50%" }]} />
            <View style={[styles.line, { width: "30%", height: 8 }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Composant Podium Top 3 ────────────────────────────────────
function PodiumTop3({
  entries,
  myId,
  colors,
}: {
  entries: LeaderboardEntry[];
  myId?: string;
  colors: AppColors;
}) {
  const podiumStyles = useThemedStyles((c) => ({
    container: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: 8,
      marginBottom: 24,
      paddingHorizontal: 12,
    },
    col: { flex: 1, alignItems: "center", gap: 4 },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: c.cardBorder,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarMe: {
      backgroundColor: c.red + "12",
      borderColor: c.red + "60",
    },
    avatarEmoji: { fontSize: 26 },
    name: {
      color: c.white,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },
    pts: { color: c.textMuted, fontSize: 10, fontWeight: "600" },
    column: {
      width: "100%",
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    rankLabel: { fontSize: 16, fontWeight: "900" },
  }));

  const getRankStyle = (rank: number): RankStyle => {
    if (rank === 1) return { color: "#FFD700", bg: "#FFD70010", label: "👑" };
    if (rank === 2)
      return { color: "#C0C0C0", bg: "#C0C0C008", label: `#${rank}` };
    if (rank === 3)
      return { color: "#CD7F32", bg: "#CD7F3208", label: `#${rank}` };
    return { color: colors.textMuted, bg: "transparent", label: `#${rank}` };
  };

  const getGradeColor = (grade: DonorGrade) => {
    if (grade === "ASPIRANT") return colors.success;
    if (grade === "SENTINELLE") return colors.amber;
    if (grade === "AMBASSADEUR") return colors.red;
    return colors.textMuted;
  };

  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  const order = [top3[1], top3[0], top3[2]];
  const heights = [70, 90, 55];
  const rankStyles = [getRankStyle(2), getRankStyle(1), getRankStyle(3)];

  return (
    <View style={podiumStyles.container}>
      {order.map((entry, i) => {
        const rs = rankStyles[i];
        const isMe = entry.user.id === myId;
        const grade = entry.currentGrade as DonorGrade;
        return (
          <View key={entry.user.id} style={podiumStyles.col}>
            <View
              style={[
                podiumStyles.avatar,
                { borderColor: rs.color + "50" },
                isMe && podiumStyles.avatarMe,
              ]}
            >
              <Text style={podiumStyles.avatarEmoji}>
                {GRADE_EMOJI[grade] ?? "🌱"}
              </Text>
            </View>

            <Text
              style={[podiumStyles.name, isMe && { color: colors.red }]}
              numberOfLines={1}
            >
              {entry.user.firstName}
            </Text>
            <Text style={podiumStyles.pts}>
              {entry.totalPoints.toLocaleString()}
            </Text>

            <View
              style={[
                podiumStyles.column,
                {
                  height: heights[i],
                  backgroundColor: rs.color + "18",
                  borderColor: rs.color + "35",
                },
              ]}
            >
              <Text style={[podiumStyles.rankLabel, { color: rs.color }]}>
                {rs.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Composant Ligne Classement ────────────────────────────────
function LeaderboardRow({
  item,
  isMe,
  index,
  colors,
}: {
  item: LeaderboardEntry;
  isMe: boolean;
  index: number;
  colors: AppColors;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  const rowStyles = useThemedStyles((c) => ({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cardBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 12,
      marginBottom: 8,
    },
    rowMe: {
      backgroundColor: c.red + "06",
      borderWidth: 1.5,
      borderColor: c.red + "25",
    },
    rankWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    rankText: { fontSize: 12, fontWeight: "900", letterSpacing: -0.3 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBorder,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarMe: {
      backgroundColor: c.red + "10",
      borderColor: c.red + "30",
    },
    avatarEmoji: { fontSize: 20 },
    infoBlock: { flex: 1, gap: 3 },
    nameText: { color: c.white, fontSize: 13, fontWeight: "700" },
    nameMe: { color: c.red, fontWeight: "800" },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
    metaGrade: { fontSize: 10, fontWeight: "600" },
    metaDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: c.textSubtle,
    },
    metaBlood: { color: c.textSubtle, fontSize: 10, fontWeight: "700" },
    metaDons: { color: c.textSubtle, fontSize: 10 },
    ptsBlock: { alignItems: "flex-end", flexShrink: 0 },
    ptsValue: {
      color: c.amber,
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    ptsLabel: { color: c.textSubtle, fontSize: 9, fontWeight: "600" },
  }));

  const getRankStyle = (rank: number): RankStyle => {
    if (rank === 1) return { color: "#FFD700", bg: "#FFD70010", label: "👑" };
    if (rank === 2)
      return { color: "#C0C0C0", bg: "#C0C0C008", label: `#${rank}` };
    if (rank === 3)
      return { color: "#CD7F32", bg: "#CD7F3208", label: `#${rank}` };
    return { color: colors.textMuted, bg: "transparent", label: `#${rank}` };
  };

  const getGradeColor = (grade: DonorGrade) => {
    if (grade === "ASPIRANT") return colors.success;
    if (grade === "SENTINELLE") return colors.amber;
    if (grade === "AMBASSADEUR") return colors.red;
    return colors.textMuted;
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay: Math.min(index * 35, 400),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        delay: Math.min(index * 35, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rs = getRankStyle(item.rank);
  const grade = item.currentGrade as DonorGrade;

  return (
    <Animated.View
      style={[
        rowStyles.row,
        isMe && rowStyles.rowMe,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View
        style={[
          rowStyles.rankWrap,
          { backgroundColor: isMe ? colors.red + "18" : rs.bg },
        ]}
      >
        <Text
          style={[
            rowStyles.rankText,
            { color: isMe ? colors.white : rs.color },
          ]}
        >
          {item.rank === 1 ? "👑" : `#${item.rank}`}
        </Text>
      </View>

      <View style={[rowStyles.avatar, isMe && rowStyles.avatarMe]}>
        <Text style={rowStyles.avatarEmoji}>{GRADE_EMOJI[grade] ?? "🌱"}</Text>
      </View>

      <View style={rowStyles.infoBlock}>
        <Text
          style={[rowStyles.nameText, isMe && rowStyles.nameMe]}
          numberOfLines={1}
        >
          {item.user.firstName} {item.user.lastName}
          {isMe ? " 👤" : ""}
        </Text>
        <View style={rowStyles.metaRow}>
          <Text
            style={[
              rowStyles.metaGrade,
              { color: getGradeColor(grade) + "CC" },
            ]}
          >
            {GRADE_EMOJI[grade]} {grade}
          </Text>
          <View style={rowStyles.metaDot} />
          <Text style={rowStyles.metaBlood}>
            {item.user.bloodType?.replace("_", "") ?? "?"}
          </Text>
          <View style={rowStyles.metaDot} />
          <Text style={rowStyles.metaDons}>
            {item.donationCount} don{item.donationCount > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <View style={rowStyles.ptsBlock}>
        <Text style={[rowStyles.ptsValue, isMe && { color: colors.red }]}>
          {item.totalPoints.toLocaleString()}
        </Text>
        <Text style={rowStyles.ptsLabel}>pts</Text>
      </View>
    </Animated.View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function LeaderboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const colors = useColors();
  const [scope, setScope] = useState<ScopeType>("global");

  const queryParams = {
    city:
      scope === "city" ? (user?.jambaarsProfile?.city ?? undefined) : undefined,
    district:
      scope === "district"
        ? (user?.jambaarsProfile?.district ?? undefined)
        : undefined,
  };

  // ─── RÉCUPÉRATION DES DONNées ET ERREURS ────────────────────
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useLeaderboard(queryParams);

  const leaderboard: LeaderboardEntry[] =
    (data as any)?.pages?.flatMap((p: any) => p.leaderboard) ??
    (data as any)?.leaderboard ??
    [];

  const myRank =
    (data as any)?.pages?.[0]?.myRank ?? (data as any)?.myRank ?? null;
  const scopeLabel =
    (data as any)?.pages?.[0]?.scope ?? (data as any)?.scope ?? "Global";

  // ─── LOGIQUE D'ERREUR RÉSEAU ────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 120 : 90,
    },
    haloTop: {
      position: "absolute",
      top: -60,
      right: -40,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.amber + "05",
    },
    navHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 16,
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    navCenter: { flex: 1, gap: 1 },
    navEyebrow: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    navTitle: {
      color: c.white,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    myRankCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.amber + "07",
      borderWidth: 1,
      borderColor: c.amber + "22",
      borderRadius: 14,
      padding: 12,
      marginBottom: 16,
    },
    myRankText: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      flex: 1,
    },
    scopesRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    scopePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    scopePillActive: {
      backgroundColor: c.amber + "12",
      borderColor: c.amber + "35",
    },
    scopeText: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "600",
    },
    scopeTextActive: {
      color: c.white,
      fontWeight: "700",
    },
    restLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
    },
    restLine: {
      flex: 1,
      height: 1,
      backgroundColor: c.cardBorder,
    },
    restText: {
      color: c.textSubtle,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1.5,
    },
    loadingMore: {
      paddingVertical: 20,
      alignItems: "center",
    },
  }));

  const renderHeader = () => (
    <View>
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navEyebrow}>PROGRAMME JAMBAAR</Text>
          <Text style={styles.navTitle}>
            Classement <Text style={{ color: colors.amber }}>⚡</Text>
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {myRank && (
        <View style={styles.myRankCard}>
          <Ionicons name="podium" size={16} color={colors.amber} />
          <Text style={styles.myRankText}>
            Vous êtes{" "}
            <Text style={{ color: colors.red, fontWeight: "900" }}>
              #{myRank}
            </Text>{" "}
            — {scopeLabel}
          </Text>
        </View>
      )}

      <View style={styles.scopesRow}>
        {SCOPES.map((s) => {
          const isActive = scope === s.key;
          return (
            <TouchableOpacity
              key={s.key}
              onPress={() => setScope(s.key)}
              style={[styles.scopePill, isActive && styles.scopePillActive]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={s.icon}
                size={13}
                color={isActive ? colors.white : colors.textMuted}
              />
              <Text
                style={[styles.scopeText, isActive && styles.scopeTextActive]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {leaderboard.length >= 3 && (
        <PodiumTop3 entries={leaderboard} myId={user?.id} colors={colors} />
      )}

      {leaderboard.length > 3 && (
        <View style={styles.restLabel}>
          <View style={styles.restLine} />
          <Text style={styles.restText}>SUITE DU CLASSEMENT</Text>
          <View style={styles.restLine} />
        </View>
      )}
    </View>
  );

  const renderFooter = () =>
    isFetchingNextPage ? (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={colors.amber} size="small" />
      </View>
    ) : null;

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navEyebrow}>PROGRAMME JAMBAAR</Text>
            <Text style={styles.navTitle}>
              Classement <Text style={{ color: colors.amber }}>⚡</Text>
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <LeaderboardSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navEyebrow}>PROGRAMME JAMBAAR</Text>
            <Text style={styles.navTitle}>
              Classement <Text style={{ color: colors.amber }}>⚡</Text>
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ─────────────────────────────────────────
  const listData = leaderboard.length > 3 ? leaderboard.slice(3) : leaderboard;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.haloTop} />
      <FlatList
        data={listData}
        keyExtractor={(item, i) => `${item.user.id}-${i}`}
        renderItem={({ item, index }) => (
          <LeaderboardRow
            item={item}
            isMe={item.user.id === user?.id}
            index={index}
            colors={colors}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}
