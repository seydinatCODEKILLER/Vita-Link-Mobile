import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
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
  textSubtle: "rgba(255,255,255,0.16)",
} as const;

// ─── Types stricts pour les rangs ──────────────────────────────
// On évite les constantes de couleur incompatibles en utilisant string
interface RankStyle {
  color: string;
  bg: string;
  label: string;
}

const getRankStyle = (rank: number): RankStyle => {
  if (rank === 1)
    return { color: "#FFD700", bg: "rgba(255,215,0,0.10)", label: "👑" };
  if (rank === 2)
    return {
      color: "#C0C0C0",
      bg: "rgba(192,192,192,0.08)",
      label: `#${rank}`,
    };
  if (rank === 3)
    return { color: "#CD7F32", bg: "rgba(205,127,50,0.08)", label: `#${rank}` };
  return { color: COLORS.textMuted, bg: "transparent", label: `#${rank}` };
};

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

const GRADE_COLOR: Record<DonorGrade, string> = {
  ASPIRANT: COLORS.green,
  SENTINELLE: COLORS.amber,
  AMBASSADEUR: COLORS.red,
};

// ─── Composant Podium Top 3 ────────────────────────────────────
function PodiumTop3({
  entries,
  myId,
}: {
  entries: LeaderboardEntry[];
  myId?: string;
}) {
  const top3 = entries.slice(0, 3);
  if (top3.length < 3) return null;

  // Ordre d'affichage : 2e - 1er - 3e (classique podium)
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
            {/* Avatar */}
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

            {/* Nom */}
            <Text
              style={[podiumStyles.name, isMe && { color: COLORS.red }]}
              numberOfLines={1}
            >
              {entry.user.firstName}
            </Text>
            <Text style={podiumStyles.pts}>
              {entry.totalPoints.toLocaleString()}
            </Text>

            {/* Colonne podium */}
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

const podiumStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  col: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarMe: {
    backgroundColor: "rgba(220,30,30,0.12)",
    borderColor: COLORS.red + "60",
  },
  avatarEmoji: { fontSize: 26 },
  name: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  pts: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  column: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  rankLabel: {
    fontSize: 16,
    fontWeight: "900",
  },
});

// ─── Composant Ligne Classement ────────────────────────────────
function LeaderboardRow({
  item,
  isMe,
  index,
}: {
  item: LeaderboardEntry;
  isMe: boolean;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  // ✅ CORRECTION : Lancement dans un useEffect
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
  }, []); // Tableau de dépendances vide = ne se joue qu'une fois

  const rs = getRankStyle(item.rank);
  const grade = item.currentGrade as DonorGrade;

  return (
    <Animated.View
      style={[
        styles.row,
        isMe && styles.rowMe,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Rang */}
      <View
        style={[
          styles.rankWrap,
          { backgroundColor: isMe ? COLORS.red + "18" : rs.bg },
        ]}
      >
        <Text
          style={[styles.rankText, { color: isMe ? COLORS.white : rs.color }]}
        >
          {item.rank === 1 ? "👑" : `#${item.rank}`}
        </Text>
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, isMe && styles.avatarMe]}>
        <Text style={styles.avatarEmoji}>{GRADE_EMOJI[grade] ?? "🌱"}</Text>
      </View>

      {/* Infos */}
      <View style={styles.infoBlock}>
        <Text
          style={[styles.nameText, isMe && styles.nameMe]}
          numberOfLines={1}
        >
          {item.user.firstName} {item.user.lastName}
          {isMe ? " 👤" : ""}
        </Text>
        <View style={styles.metaRow}>
          <Text
            style={[styles.metaGrade, { color: GRADE_COLOR[grade] + "CC" }]}
          >
            {GRADE_EMOJI[grade]} {grade}
          </Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaBlood}>
            {item.user.bloodType?.replace("_", "") ?? "?"}
          </Text>
          <View style={styles.metaDot} />
          <Text style={styles.metaDons}>
            {item.donationCount} don{item.donationCount > 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {/* Points */}
      <View style={styles.ptsBlock}>
        <Text style={[styles.ptsValue, isMe && { color: COLORS.red }]}>
          {item.totalPoints.toLocaleString()}
        </Text>
        <Text style={styles.ptsLabel}>pts</Text>
      </View>
    </Animated.View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function LeaderboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [scope, setScope] = useState<ScopeType>("global");

  const queryParams = {
    city:
      scope === "city" ? (user?.jambaarsProfile?.city ?? undefined) : undefined,
    district:
      scope === "district"
        ? (user?.jambaarsProfile?.district ?? undefined)
        : undefined,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useLeaderboard(queryParams);

  const leaderboard: LeaderboardEntry[] =
    (data as any)?.pages?.flatMap((p: any) => p.leaderboard) ??
    (data as any)?.leaderboard ??
    [];

  const myRank =
    (data as any)?.pages?.[0]?.myRank ?? (data as any)?.myRank ?? null;
  const scopeLabel =
    (data as any)?.pages?.[0]?.scope ?? (data as any)?.scope ?? "Global";

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderHeader = () => (
    <View>
      {/* Nav */}
      <View style={styles.navHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navEyebrow}>PROGRAMME JAMBAAR</Text>
          <Text style={styles.navTitle}>
            Classement <Text style={{ color: COLORS.amber }}>⚡</Text>
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Ma position */}
      {myRank && (
        <View style={styles.myRankCard}>
          <Ionicons name="podium" size={16} color={COLORS.amber} />
          <Text style={styles.myRankText}>
            Vous êtes{" "}
            <Text style={{ color: COLORS.red, fontWeight: "900" }}>
              #{myRank}
            </Text>{" "}
            — {scopeLabel}
          </Text>
        </View>
      )}

      {/* Tabs scope */}
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
                color={isActive ? COLORS.white : COLORS.textMuted}
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

      {/* Podium top 3 */}
      {leaderboard.length >= 3 && (
        <PodiumTop3 entries={leaderboard} myId={user?.id} />
      )}

      {/* Label reste classement */}
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
        <ActivityIndicator color={COLORS.amber} size="small" />
      </View>
    ) : null;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  // Les 3 premiers sont dans le podium, on affiche le reste en liste
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

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { alignItems: "center", justifyContent: "center" },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 120 : 90,
  },

  // Halo
  haloTop: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(250,199,117,0.05)",
  },

  // ── Nav ──
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
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  navCenter: { flex: 1, gap: 1 },
  navEyebrow: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  navTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // ── My Rank ──
  myRankCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(250,199,117,0.07)",
    borderWidth: 1,
    borderColor: "rgba(250,199,117,0.22)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  myRankText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },

  // ── Scopes ──
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
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg,
  },
  scopePillActive: {
    backgroundColor: "rgba(250,199,117,0.12)",
    borderColor: "rgba(250,199,117,0.35)",
  },
  scopeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  scopeTextActive: {
    color: COLORS.white,
    fontWeight: "700",
  },

  // ── Rest label ──
  restLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  restLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
  },
  restText: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
  },

  // ── Row ──
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 8,
  },
  rowMe: {
    backgroundColor: "rgba(220,30,30,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(220,30,30,0.25)",
  },

  // Rang
  rankWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  rankText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarMe: {
    backgroundColor: "rgba(220,30,30,0.10)",
    borderColor: "rgba(220,30,30,0.30)",
  },
  avatarEmoji: { fontSize: 20 },

  // Info
  infoBlock: { flex: 1, gap: 3 },
  nameText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
  },
  nameMe: { color: COLORS.red, fontWeight: "800" },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaGrade: { fontSize: 10, fontWeight: "600" },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSubtle,
  },
  metaBlood: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
  },
  metaDons: {
    color: COLORS.textSubtle,
    fontSize: 10,
  },

  // Points
  ptsBlock: { alignItems: "flex-end", flexShrink: 0 },
  ptsValue: {
    color: COLORS.amber,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  ptsLabel: {
    color: COLORS.textSubtle,
    fontSize: 9,
    fontWeight: "600",
  },

  // Load more
  loadingMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
