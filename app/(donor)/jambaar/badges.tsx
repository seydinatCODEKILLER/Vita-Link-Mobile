import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import dayjs from "dayjs";
import { useMyBadges } from "@/src/hooks/useJambaar";
import { Badge } from "@/src/types/domain.types";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Émoji par défaut selon le type de badge ──────────────────
function getDefaultEmoji(badge: Badge): string {
  const name = badge.name.toLowerCase();
  if (
    name.includes("premier") ||
    name.includes("début") ||
    name.includes("bienvenue")
  )
    return "🌟";
  if (
    name.includes("sang") ||
    name.includes("rare") ||
    name.includes("universel")
  )
    return "💎";
  if (
    name.includes("vie") ||
    name.includes("sauve") ||
    name.includes("sauveur")
  )
    return "❤️";
  if (
    name.includes("fidèle") ||
    name.includes("régulier") ||
    name.includes("loyal")
  )
    return "⭐";
  if (
    name.includes("nuit") ||
    name.includes("urgence") ||
    name.includes("veilleur")
  )
    return "🌙";
  if (
    name.includes("ville") ||
    name.includes("local") ||
    name.includes("quartier")
  )
    return "🏙️";
  if (
    name.includes("rapide") ||
    name.includes("éclair") ||
    name.includes("flash")
  )
    return "⚡";
  if (
    name.includes("généreux") ||
    name.includes("don") ||
    name.includes("altruiste")
  )
    return "🎁";
  if (
    name.includes("marathon") ||
    name.includes("cent") ||
    name.includes("dizaine")
  )
    return "🎯";
  if (badge.isSeasonal) return "🎄";
  return "🏅";
}

// ─── Parseur critères ──────────────────────────────────────────
function parseCriteria(criteriaJson: string): string {
  try {
    const c = JSON.parse(criteriaJson);
    if (c.minDonations)
      return `${c.minDonations} don${c.minDonations > 1 ? "s" : ""} requis`;
    if (c.exactDonations)
      return `${c.exactDonations} don${c.exactDonations > 1 ? "s" : ""} exact${c.exactDonations > 1 ? "s" : ""}`;
    if (c.minPoints) return `${c.minPoints} pts requis`;
    if (c.bloodType) return `Groupe ${c.bloodType.replace("_", "")} uniquement`;
    return "Critère spécial";
  } catch {
    return "Critère inconnu";
  }
}

// ─── Détermine si un badge est "nouveau" (débloqué < 24h) ────
function isNewBadge(badge: Badge): boolean {
  if (!badge.isUnlocked || !badge.earnedAt) return false;
  const earned = dayjs(badge.earnedAt);
  const now = dayjs();
  return now.diff(earned, "hour") < 24;
}

// ─── Particule d'étincelle ────────────────────────────────────
function SparkleParticle({
  index,
  totalParticles,
  colors,
}: {
  index: number;
  totalParticles: number;
  colors: AppColors;
}) {
  const angle = (index / totalParticles) * 360;
  const distance = 40 + Math.random() * 30;
  const size = 4 + Math.random() * 6;
  const delay = Math.random() * 200;

  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rad = (angle * Math.PI) / 180;
    const dx = Math.cos(rad) * distance;
    const dy = Math.sin(rad) * distance;

    Animated.sequence([
      Animated.delay(400 + delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: dx,
          friction: 12,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: dy,
          friction: 12,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 400 + delay);
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: index % 2 === 0 ? colors.amber : colors.white,
        opacity,
        transform: [
          { translateX },
          { translateY },
          { scale },
          {
            rotate: rotate.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "360deg"],
            }),
          },
        ],
      }}
    />
  );
}

// ─── Badge Card ────────────────────────────────────────────────
function BadgeCard({
  badge,
  index,
  colors,
  styles,
}: {
  badge: Badge;
  index: number;
  colors: AppColors;
  styles: any; // StyleSheet pas typable dynamiquement facilement ici
}) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const newBadgeShine = useRef(new Animated.Value(0)).current;

  const isUnlocked = badge.isUnlocked;
  const isNew = isNewBadge(badge);
  const badgeEmoji = badge.iconUrl ? null : getDefaultEmoji(badge);

  useEffect(() => {
    if (isNew) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      Animated.sequence([
        Animated.delay(index * 120 + 200),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.15,
            friction: 4,
            tension: 60,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(newBadgeShine, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(newBadgeShine, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 50,
          delay: index * 60,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          delay: index * 60,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, []);

  return (
    <Animated.View
      style={[
        styles.badgeCard,
        isUnlocked ? styles.badgeUnlocked : styles.badgeLocked,
        isNew && { borderColor: colors.amber + "60" },
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Particules d'étincelles pour les nouveaux badges */}
      {isNew && (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <SparkleParticle
              key={i}
              index={i}
              totalParticles={8}
              colors={colors}
            />
          ))}
        </>
      )}

      {/* Glow pulsé pour les nouveaux badges */}
      {isNew && (
        <Animated.View
          style={[
            styles.newBadgeGlow,
            {
              opacity: glowOpacity,
              transform: [
                {
                  scale: scaleAnim.interpolate({
                    inputRange: [0.85, 1.15],
                    outputRange: [0.5, 1.3],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* Halo décoratif coin supérieur droit */}
      {isUnlocked && <View style={styles.unlockedHalo} />}

      {/* Bande top accent */}
      {isUnlocked && (
        <View
          style={[
            styles.unlockedAccentBar,
            isNew && { backgroundColor: colors.amber, opacity: 1 },
          ]}
        />
      )}

      {/* Bandeau "NOUVEAU !" */}
      {isNew && (
        <Animated.View
          style={[
            styles.newBadgeBanner,
            {
              transform: [
                {
                  translateX: newBadgeShine.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-100%", "100%"],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.newBadgeBannerText}>✨ NOUVEAU !</Text>
        </Animated.View>
      )}

      {/* Icône */}
      <View
        style={[
          styles.badgeIconWrap,
          isUnlocked ? styles.iconUnlocked : styles.iconLocked,
          isNew && styles.iconNewUnlocked,
        ]}
      >
        {isUnlocked ? (
          badge.iconUrl ? (
            <Image
              source={{ uri: badge.iconUrl }}
              style={[styles.badgeImage, isNew && styles.badgeImageNew]}
              resizeMode="contain"
            />
          ) : (
            <Text style={[styles.badgeEmoji, isNew && styles.badgeEmojiNew]}>
              {badgeEmoji}
            </Text>
          )
        ) : badge.iconUrl ? (
          <View style={styles.lockedImageContainer}>
            <Image
              source={{ uri: badge.iconUrl }}
              style={[styles.badgeImage, styles.badgeImageLocked]}
              resizeMode="contain"
            />
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color={colors.white} />
            </View>
          </View>
        ) : (
          <Ionicons name="lock-closed" size={20} color={colors.textSubtle} />
        )}
      </View>

      {/* Nom */}
      <Text
        style={[
          styles.badgeName,
          !isUnlocked && styles.badgeNameLocked,
          isNew && styles.badgeNameNew,
        ]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>

      {/* Date ou critère */}
      {isUnlocked ? (
        <View style={[styles.earnedPill, isNew && styles.earnedPillNew]}>
          <Text
            style={[styles.earnedPillText, isNew && styles.earnedPillTextNew]}
          >
            {dayjs(badge.earnedAt).format("MMM YYYY")}
          </Text>
        </View>
      ) : (
        <Text style={styles.badgeCriteria} numberOfLines={2}>
          {parseCriteria(badge.criteria)}
        </Text>
      )}
    </Animated.View>
  );
}

// ─── Section header ────────────────────────────────────────────
function SectionHeader({
  title,
  count,
  color,
  hasNew,
  colors,
  styles,
}: {
  title: string;
  count: number;
  color: string;
  hasNew?: boolean;
  colors: AppColors;
  styles: any;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View
        style={[
          styles.sectionDot,
          { backgroundColor: hasNew ? colors.amber : color },
        ]}
      />
      <Text style={styles.sectionTitle}>{title}</Text>
      {hasNew && (
        <View style={styles.sectionNewBadge}>
          <Text style={styles.sectionNewBadgeText}>🎉</Text>
        </View>
      )}
      <View
        style={[
          styles.sectionCount,
          {
            borderColor: (hasNew ? colors.amber : color) + "40",
            backgroundColor: (hasNew ? colors.amber : color) + "15",
          },
        ]}
      >
        <Text
          style={[
            styles.sectionCountText,
            { color: hasNew ? colors.amber : color },
          ]}
        >
          {count}
        </Text>
      </View>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function BadgesScreen() {
  const router = useRouter();
  const { data, isLoading } = useMyBadges();
  const colors = useColors();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
    scrollContent: { paddingHorizontal: 20 },

    // ── Halo ──
    topHalo: {
      position: "absolute",
      top: -60,
      left: "50%",
      marginLeft: -100,
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: c.redGlow, // Utilisation du halo du thème
    },

    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 20,
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
    headerCenter: { flex: 1, alignItems: "center" },
    headerTitle: {
      color: c.white,
      fontSize: 20,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    headerBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      backgroundColor: c.amber + "12",
      borderWidth: 1,
      borderColor: c.amber + "28",
    },
    headerBadgeText: {
      color: c.amber,
      fontSize: 13,
      fontWeight: "800",
    },

    // ── Progress Card ──
    progressCard: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      padding: 18,
      marginBottom: 28,
      gap: 12,
    },
    progressTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    progressLabel: {
      color: c.white,
      fontSize: 13,
      fontWeight: "700",
    },
    progressPercent: {
      color: c.amber,
      fontSize: 14,
      fontWeight: "800",
    },
    progressBarBg: {
      height: 7,
      borderRadius: 4,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 4,
    },
    progressHint: {
      color: c.textMuted,
      fontSize: 12,
    },

    // ── Section ──
    section: { marginBottom: 28 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    sectionDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    sectionTitle: {
      color: c.white,
      fontSize: 13,
      fontWeight: "700",
      flex: 1,
      letterSpacing: 0.2,
    },
    sectionNewBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.amber + "15",
      alignItems: "center",
      justifyContent: "center",
    },
    sectionNewBadgeText: {
      fontSize: 12,
    },
    sectionCount: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 1,
    },
    sectionCountText: {
      fontSize: 12,
      fontWeight: "800",
    },

    // ── Grid ──
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },

    // ── Badge Card ──
    badgeCard: {
      width: "31%",
      aspectRatio: 0.78,
      borderRadius: 18,
      borderWidth: 1.5,
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      position: "relative",
      overflow: "hidden",
    },
    badgeUnlocked: {
      backgroundColor: c.amber + "06",
      borderColor: c.amber + "28",
    },
    badgeLocked: {
      backgroundColor: c.cardBg, // Adaptatif au thème
      borderColor: c.cardBorder, // Adaptatif au thème
    },
    unlockedHalo: {
      position: "absolute",
      top: -16,
      right: -16,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: c.amber + "10",
    },
    unlockedAccentBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2.5,
      backgroundColor: c.amber,
      opacity: 0.7,
    },

    // ── Icône badge ──
    badgeIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    iconUnlocked: {
      backgroundColor: c.amber + "14",
      borderWidth: 1,
      borderColor: c.amber + "28",
    },
    iconNewUnlocked: {
      backgroundColor: c.amber + "20",
      borderColor: c.amber + "45",
      borderWidth: 2,
    },
    iconLocked: {
      backgroundColor: c.cardBorder,
      borderWidth: 1,
      borderColor: c.cardBorder,
    },

    // ── Image badge ──
    badgeImage: {
      width: 36,
      height: 36,
    },
    badgeImageNew: {
      width: 40,
      height: 40,
    },
    badgeImageLocked: {
      opacity: 0.25,
    },

    // ── Badge verrouillé avec image ──
    lockedImageContainer: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    lockOverlay: {
      position: "absolute",
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "rgba(0,0,0,0.65)",
      alignItems: "center",
      justifyContent: "center",
    },

    // ── Émoji badge ──
    badgeEmoji: {
      fontSize: 24,
    },
    badgeEmojiNew: {
      fontSize: 28,
    },

    // ── Nom badge ──
    badgeName: {
      color: c.white,
      fontSize: 11,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.2,
      lineHeight: 15,
    },
    badgeNameLocked: {
      color: c.textSubtle,
      fontWeight: "600",
    },
    badgeNameNew: {
      color: c.amber,
      fontWeight: "900",
    },

    // ── Pill date ──
    earnedPill: {
      backgroundColor: c.amber + "15",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: c.amber + "28",
    },
    earnedPillNew: {
      backgroundColor: c.amber + "20",
      borderColor: c.amber + "45",
    },
    earnedPillText: {
      color: c.amber,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    earnedPillTextNew: {
      color: c.amber,
      fontWeight: "800",
    },

    // ── Critères badge verrouillé ──
    badgeCriteria: {
      color: c.textMuted,
      fontSize: 9,
      textAlign: "center",
      lineHeight: 13,
    },

    // ── Nouveau badge : Glow ──
    newBadgeGlow: {
      position: "absolute",
      top: -20,
      left: -20,
      right: -20,
      bottom: -20,
      borderRadius: 30,
      backgroundColor: c.amber + "12",
      zIndex: -1,
    },

    // ── Nouveau badge : Bannière ──
    newBadgeBanner: {
      position: "absolute",
      top: 6,
      right: -28,
      backgroundColor: c.amber,
      paddingHorizontal: 10,
      paddingVertical: 2,
      transform: [{ rotate: "25deg" }],
      shadowColor: c.amber,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4,
    },
    newBadgeBannerText: {
      color: "#1A1A1A",
      fontSize: 7,
      fontWeight: "900",
      letterSpacing: 0.5,
    },
  }));

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!data) return;
    const pct = data.total > 0 ? data.earned / data.total : 0;
    Animated.spring(progressAnim, {
      toValue: pct,
      friction: 7,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [data]);

  if (isLoading || !data) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  const unlockedBadges = data.badges.filter((b) => b.isUnlocked);
  const lockedBadges = data.badges.filter((b) => !b.isUnlocked);
  const progressPct = data.total > 0 ? (data.earned / data.total) * 100 : 0;
  const isComplete = data.earned === data.total;
  const hasNewBadges = unlockedBadges.some((b) => isNewBadge(b));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topHalo} />

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
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Mes <Text style={{ color: colors.amber }}>Badges</Text>
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {data.earned}/{data.total}
            </Text>
          </View>
        </Animated.View>

        {/* ── Carte progression ── */}
        <Animated.View style={[styles.progressCard, { opacity: headerAnim }]}>
          <View style={styles.progressTop}>
            <View style={styles.progressLeft}>
              <Ionicons name="trophy" size={16} color={colors.amber} />
              <Text style={styles.progressLabel}>Collection complète</Text>
            </View>
            <Text style={styles.progressPercent}>
              {Math.round(progressPct)}%
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: isComplete ? colors.success : colors.amber,
                },
              ]}
            />
          </View>

          <Text style={styles.progressHint}>
            {isComplete
              ? "🏆 Tous les badges débloqués !"
              : `${data.total - data.earned} badge${data.total - data.earned > 1 ? "s" : ""} encore à obtenir`}
          </Text>
        </Animated.View>

        {/* ── Badges débloqués ── */}
        {unlockedBadges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Débloqués"
              count={unlockedBadges.length}
              color={colors.amber}
              hasNew={hasNewBadges}
              colors={colors}
              styles={styles}
            />
            <View style={styles.grid}>
              {unlockedBadges.map((badge, i) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  index={i}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Badges verrouillés ── */}
        {lockedBadges.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="À débloquer"
              count={lockedBadges.length}
              color={colors.textMuted}
              colors={colors}
              styles={styles}
            />
            <View style={styles.grid}>
              {lockedBadges.map((badge, i) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  index={unlockedBadges.length + i}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
