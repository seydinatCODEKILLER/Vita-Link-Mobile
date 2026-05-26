import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { usePublishedDays } from "@/src/hooks/useDonationDays";
import { DonationDay } from "@/src/types/donation-day.types";

dayjs.locale("fr");

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonCard({ colors }: { colors: any }) {
  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 20,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        marginBottom: 14,
        overflow: "hidden",
        opacity: 0.45,
      }}
    >
      <View
        style={{ height: 130, backgroundColor: colors.cardBorder + "60" }}
      />
      <View style={{ padding: 16, gap: 10 }}>
        <View
          style={{
            height: 10,
            width: "45%",
            borderRadius: 5,
            backgroundColor: colors.cardBorder,
          }}
        />
        <View
          style={{
            height: 14,
            width: "80%",
            borderRadius: 7,
            backgroundColor: colors.cardBorder,
          }}
        />
        <View style={{ height: 0.5, backgroundColor: colors.cardBorder }} />
        <View style={{ gap: 6 }}>
          <View
            style={{
              height: 10,
              width: "55%",
              borderRadius: 5,
              backgroundColor: colors.cardBorder,
            }}
          />
          <View
            style={{
              height: 10,
              width: "70%",
              borderRadius: 5,
              backgroundColor: colors.cardBorder,
            }}
          />
        </View>
      </View>
    </View>
  );
}

// ─── Carte Journée ────────────────────────────────────────────
function DonorDayCard({
  item,
  colors,
  onPress,
}: {
  item: DonationDay;
  colors: any;
  onPress: () => void;
}) {
  const registrationsCount = item._count?.registrations ?? 0;
  const pct =
    item.targetDonors > 0
      ? Math.min((registrationsCount / item.targetDonors) * 100, 100)
      : 0;
  const remainingSpots = Math.max(0, item.targetDonors - registrationsCount);
  const isFull = remainingSpots === 0;

  const styles = useThemedStyles((c) => ({
    // ── Card shell ──
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 20,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      marginBottom: 14,
      overflow: "hidden",
    },

    // ── Cover ──
    cover: {
      height: 130,
      backgroundColor: c.cardBorder + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    coverImage: { width: "100%", height: "100%" },

    // Top badges row (absolute over cover)
    coverTop: {
      position: "absolute",
      top: 10,
      left: 12,
      right: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    // Date badge
    dateBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.bg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    dateDay: {
      color: c.white,
      fontSize: 18,
      fontWeight: "500",
      lineHeight: 22,
    },
    dateSep: {
      width: 0.5,
      height: 16,
      backgroundColor: c.cardBorder,
    },
    dateMonth: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    // Status badge
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 0.5,
    },
    statusOpen: {
      backgroundColor: c.red + "18",
      borderColor: c.red + "40",
    },
    statusFull: {
      backgroundColor: c.success + "18",
      borderColor: c.success + "40",
    },
    statusText: {
      fontSize: 11,
      fontWeight: "500",
    },
    statusTextOpen: { color: c.red },
    statusTextFull: { color: c.success },

    // ── Body ──
    body: {
      padding: 16,
      gap: 10,
    },
    structure: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: c.white,
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 22,
    },
    divider: {
      height: 0.5,
      backgroundColor: c.cardBorder,
    },

    // Meta
    metaRow: { gap: 6 },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    metaText: {
      color: c.textMuted,
      fontSize: 13,
      flex: 1,
    },

    // Blood type pills
    bloodRow: { flexDirection: "row", gap: 5, flexWrap: "wrap" },
    pill: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 99,
      backgroundColor: c.red + "15",
      borderWidth: 0.5,
      borderColor: c.red + "40",
    },
    pillText: { color: c.red, fontSize: 11, fontWeight: "500" },
    pillAll: {
      paddingHorizontal: 9,
      paddingVertical: 3,
      borderRadius: 99,
      backgroundColor: c.cardBorder + "20",
      borderWidth: 0.5,
      borderColor: c.cardBorder,
    },
    pillAllText: { color: c.textMuted, fontSize: 11, fontWeight: "500" },

    // Progress
    progressSection: { gap: 6 },
    progressLabelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    progressLabel: { color: c.textMuted, fontSize: 12 },
    progressValue: { color: c.white, fontSize: 12, fontWeight: "500" },
    progressSub: { color: c.textMuted, fontWeight: "400" },
    progressTrack: {
      height: 3,
      borderRadius: 99,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },

    // CTA
    cta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 0.5,
    },
    ctaOpen: {
      backgroundColor: c.red + "15",
      borderColor: c.red + "40",
    },
    ctaFull: {
      backgroundColor: c.cardBorder + "20",
      borderColor: c.cardBorder,
    },
    ctaText: { fontSize: 13, fontWeight: "500" },
    ctaTextOpen: { color: c.red },
    ctaTextFull: { color: c.textMuted },
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.card}
    >
      {/* Cover */}
      <View style={styles.cover}>
        {item.photoUrl ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={styles.coverImage}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons
            name="calendar-outline"
            size={42}
            color={colors.cardBorder}
          />
        )}

        {/* Top badges */}
        <View style={styles.coverTop}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>
              {dayjs(item.scheduledDate).format("DD")}
            </Text>
            <View style={styles.dateSep} />
            <Text style={styles.dateMonth}>
              {dayjs(item.scheduledDate).format("MMM")}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              isFull ? styles.statusFull : styles.statusOpen,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isFull ? styles.statusTextFull : styles.statusTextOpen,
              ]}
            >
              {isFull ? "Complet" : `${remainingSpots} places`}
            </Text>
          </View>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Structure + titre */}
        {item.healthStructure?.name ? (
          <Text style={styles.structure}>{item.healthStructure.name}</Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.divider} />

        {/* Méta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {item.startTime} – {item.endTime}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name="location-outline"
              size={15}
              color={colors.textMuted}
            />
            <Text style={styles.metaText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>

        {/* Groupes sanguins */}
        <View style={styles.bloodRow}>
          {item.bloodTypesNeeded.length === 0 ? (
            <View style={styles.pillAll}>
              <Text style={styles.pillAllText}>Tous les groupes</Text>
            </View>
          ) : (
            item.bloodTypesNeeded.map((bt) => (
              <View key={bt} style={styles.pill}>
                <Text style={styles.pillText}>
                  {bt.replace("_POS", "+").replace("_NEG", "−")}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Progression */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Inscrits</Text>
            <Text style={styles.progressValue}>
              {registrationsCount}
              <Text style={styles.progressSub}> / {item.targetDonors}</Text>
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 99,
                backgroundColor: isFull ? colors.success : colors.red,
              }}
            />
          </View>
        </View>

        {/* CTA */}
        <View style={[styles.cta, isFull ? styles.ctaFull : styles.ctaOpen]}>
          <Text
            style={[
              styles.ctaText,
              isFull ? styles.ctaTextFull : styles.ctaTextOpen,
            ]}
          >
            {isFull ? "Liste d'attente" : "Voir les détails"}
          </Text>
          <Ionicons
            name={isFull ? "time-outline" : "arrow-forward"}
            size={14}
            color={isFull ? colors.textMuted : colors.red}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran Principal ──────────────────────────────────────────
export default function DonorDonationDaysScreen() {
  const router = useRouter();
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();

  const { data, isLoading, isRefetching, refetch, isError } =
    usePublishedDays();
  const days = data?.data ?? [];

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
      gap: 3,
    },
    headerEyebrow: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "600",
      letterSpacing: -0.5,
    },
    emptyWrap: {
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 32,
      gap: 16,
    },
    emptyIconBg: {
      width: 80,
      height: 80,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "25",
    },
    emptyTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "500",
      textAlign: "center",
    },
    emptySub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEyebrow}>Collectes planifiées</Text>
        <Text style={styles.headerTitle}>
          Journées <Text style={{ color: colors.red }}>de don</Text>
        </Text>
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={{ paddingHorizontal: 20 }}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} colors={colors} />
          ))}
        </View>
      ) : (
        <FlatList
          data={days}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 4,
            paddingBottom: tabBarHeight + 40,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <DonorDayCard
              item={item}
              colors={colors}
              onPress={() =>
                router.push(`/(donor)/donation-days/${item.id}` as any)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconBg}>
                <Ionicons
                  name={isError ? "cloud-offline-outline" : "calendar-outline"}
                  size={36}
                  color={colors.red + "60"}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {isError ? "Erreur de chargement" : "Aucune collecte prévue"}
              </Text>
              <Text style={styles.emptySub}>
                {isError
                  ? "Tirez vers le bas pour réessayer."
                  : "Les nouvelles journées de don compatibles avec votre groupe sanguin apparaîtront ici."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
