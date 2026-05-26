import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useMyStructureDays } from "@/src/hooks/useDonationDays";
import { DonationDay } from "@/src/types/donation-day.types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import dayjs from "dayjs";
import "dayjs/locale/fr";
dayjs.locale("fr");

// ─── Filtres ──────────────────────────────────────────────────
const FILTERS = [
  { key: "PUBLISHED", label: "À venir" },
  { key: "COMPLETED", label: "Terminées" },
  { key: "CANCELLED", label: "Annulées" },
] as const;

// ─── Status config ────────────────────────────────────────────
const getThemeStatusConfig = (c: any) => ({
  DRAFT: {
    label: "Brouillon",
    bg: c.cardBorder + "20",
    border: c.cardBorder + "40",
    color: c.textMuted,
    coverBg: c.cardBorder + "10",
    iconName: "create-outline" as const,
  },
  PUBLISHED: {
    label: "À venir",
    bg: "rgba(29,158,117,0.14)",
    border: "rgba(29,158,117,0.28)",
    color: "#1D9E75",
    coverBg: c.red + "08",
    iconName: "calendar-outline" as const,
  },
  COMPLETED: {
    label: "Terminée",
    bg: "rgba(96,165,250,0.14)",
    border: "rgba(96,165,250,0.28)",
    color: "#60A5FA",
    coverBg: "rgba(96,165,250,0.07)",
    iconName: "checkmark-circle-outline" as const,
  },
  CANCELLED: {
    label: "Annulée",
    bg: "rgba(220,30,30,0.12)",
    border: "rgba(220,30,30,0.25)",
    color: "#DC1E1E",
    coverBg: c.red + "05",
    iconName: "close-circle-outline" as const,
  },
});

// ─── Skeleton ─────────────────────────────────────────────────
function SkeletonCard({ colors }: { colors: any }) {
  const styles = useThemedStyles((c) => ({
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 12,
      overflow: "hidden",
      opacity: 0.5,
    },
    imagePlaceholder: { height: 110, backgroundColor: c.cardBorder },
    content: { padding: 12, gap: 8 },
    line1: { height: 13, width: "70%", borderRadius: 7, backgroundColor: c.cardBorder },
    line2: { height: 9, width: "35%", borderRadius: 5, backgroundColor: c.cardBorder },
    line3: { height: 9, width: "40%", borderRadius: 5, backgroundColor: c.cardBorder },
    line4: { height: 3, borderRadius: 2, backgroundColor: c.cardBorder, marginTop: 2 },
  }));

  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder} />
      <View style={styles.content}>
        <View style={styles.line1} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={styles.line2} />
          <View style={styles.line3} />
        </View>
        <View style={styles.line4} />
      </View>
    </View>
  );
}

// ─── Carte journée ────────────────────────────────────────────
function DayCard({
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
  const STATUS_CONFIG = getThemeStatusConfig(colors);
  const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.PUBLISHED;

  const styles = useThemedStyles((c) => ({
    card: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.cardBorder,
      marginBottom: 12,
      overflow: "hidden",
    },
    title: {
      color: c.white,
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 19,
      marginBottom: 7,
    },
    metaIcon: { color: c.textSubtle },
    metaText: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
    bloodPillBg: {
      backgroundColor: c.red + "12",
      borderWidth: 1,
      borderColor: c.red + "30",
    },
    bloodPillText: { color: c.red, fontSize: 10, fontWeight: "700" },
    emptyPillBg: {
      backgroundColor: c.cardBorder + "15",
      borderWidth: 1,
      borderColor: c.cardBorder + "30",
    },
    emptyPillText: { color: c.textMuted, fontSize: 10, fontWeight: "700" },
    progressLabel: { color: c.textMuted, fontSize: 10, fontWeight: "600" },
    progressValue: { color: c.white, fontSize: 11, fontWeight: "700" },
    progressSub: { color: c.textMuted, fontWeight: "500" },
    progressBg: {
      height: 3,
      borderRadius: 2,
      backgroundColor: c.cardBorder,
      overflow: "hidden",
    },
    footerBorder: { borderTopWidth: 1, borderTopColor: c.cardBorder },
    footerText: { color: c.textMuted, fontSize: 11 },
    divider: {
      width: 1,
      height: 12,
      backgroundColor: c.cardBorder,
      marginHorizontal: 6,
    },
    ctaBg: {
      backgroundColor: c.red + "12",
      borderWidth: 1,
      borderColor: c.red + "30",
      borderRadius: 8,
      paddingHorizontal: 9,
      paddingVertical: 4,
    },
    ctaText: { color: c.red, fontSize: 11, fontWeight: "700" },
    overlayBg: { backgroundColor: c.bg + "CC" },
    dateBadgeBg: {
      backgroundColor: c.bg + "AA",
      borderWidth: 1,
      borderColor: c.cardBorder,
      borderRadius: 9,
      paddingHorizontal: 8,
      paddingVertical: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    dateDay: {
      color: c.white,
      fontSize: 13,
      fontWeight: "800",
      lineHeight: 15,
    },
    dateMonth: {
      color: c.textMuted,
      fontSize: 9,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
  }));

  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.card}>
      {/* ── Cover ── */}
      <View style={{ height: 110, backgroundColor: statusConf.coverBg }}>
        {item.photoUrl && item.photoUrl.startsWith("http") ? (
          <Image
            source={{ uri: item.photoUrl }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={statusConf.iconName} size={36} color={colors.red + "25"} />
          </View>
        )}

        {/* Overlay */}
        <View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: 12,
              paddingBottom: 8,
              paddingTop: 20,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            },
            styles.overlayBg,
          ]}
        >
          {/* Badge date */}
          <View style={styles.dateBadgeBg}>
            <Ionicons name="calendar-outline" size={11} color={colors.textMuted} />
            <View>
              <Text style={styles.dateDay}>{dayjs(item.scheduledDate).format("DD")}</Text>
              <Text style={styles.dateMonth}>{dayjs(item.scheduledDate).format("MMM YYYY")}</Text>
            </View>
          </View>

          {/* Badge statut */}
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 7,
              backgroundColor: statusConf.bg,
              borderWidth: 1,
              borderColor: statusConf.border,
            }}
          >
            <Text
              style={{
                color: statusConf.color,
                fontSize: 9,
                fontWeight: "800",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {statusConf.label}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Corps ── */}
      <View style={{ padding: 12 }}>
        <Text numberOfLines={1} style={styles.title}>{item.title}</Text>

        {/* Meta */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="time-outline" size={11} style={styles.metaIcon} />
            <Text style={styles.metaText}>{item.startTime} – {item.endTime}</Text>
          </View>
          {item.address ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flex: 1 }}>
              <Ionicons name="location-outline" size={11} style={styles.metaIcon} />
              <Text numberOfLines={1} style={[styles.metaText, { flex: 1 }]}>{item.address}</Text>
            </View>
          ) : null}
        </View>

        {/* Groupes sanguins */}
        <View style={{ flexDirection: "row", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
          {item.bloodTypesNeeded.length === 0 ? (
            <View style={[{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }, styles.emptyPillBg]}>
              <Text style={styles.emptyPillText}>Tous les groupes</Text>
            </View>
          ) : (
            item.bloodTypesNeeded.map((bt) => (
              <View key={bt} style={[{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }, styles.bloodPillBg]}>
                <Text style={styles.bloodPillText}>{bt.replace("_POS", "+").replace("_NEG", "−")}</Text>
              </View>
            ))
          )}
        </View>

        {/* Barre de progression */}
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <Text style={styles.progressLabel}>Inscrits</Text>
            <Text style={styles.progressValue}>
              {registrationsCount}
              <Text style={styles.progressSub}> / {item.targetDonors}</Text>
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 2,
                backgroundColor: isFull ? colors.success : colors.red,
              }}
            />
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 10,
            ...styles.footerBorder,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
            <Text style={{ color: isFull ? colors.success : colors.white, fontSize: 12, fontWeight: "700" }}>
              {isFull ? "Complet" : remainingSpots}
            </Text>
            {!isFull && <Text style={styles.footerText}> places restantes</Text>}
            <View style={styles.divider} />
            <Text style={[styles.footerText, { fontWeight: "600" }]} numberOfLines={1}>
              {Math.round(pct)}% rempli
            </Text>
          </View>

          <View style={styles.ctaBg}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={styles.ctaText}>Voir</Text>
              <Ionicons name="arrow-forward" size={11} color={colors.red} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Écran principal ──────────────────────────────────────────
export default function JourneesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeFilter, setActiveFilter] = useState<string>("PUBLISHED");
  const tabBarHeight = useBottomTabBarHeight();

  const { data, isLoading, isRefetching, refetch, isError } =
    useMyStructureDays({ status: activeFilter as any });
  const days = data?.data ?? [];

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    headerEyebrow: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "600",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    filterInactiveBorder: { borderColor: c.cardBorder },
    filterInactiveBg: { backgroundColor: c.cardBg },
    filterActiveBorder: { borderColor: c.red + "40" },
    filterActiveBg: { backgroundColor: c.red + "15" },
    filterDotInactive: { backgroundColor: c.textSubtle },
    filterTextInactive: { color: c.textMuted },
    emptyStateIconBg: {
      backgroundColor: c.red + "12",
      borderWidth: 1,
      borderColor: c.red + "20",
    },
    emptyStateTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    emptyStateSub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-end",
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 14,
        }}
      >
        <View style={{ gap: 3 }}>
          <Text style={styles.headerEyebrow}>Collectes planifiées</Text>
          <Text style={styles.headerTitle}>
            Nos <Text style={{ color: colors.red }}>Journées</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor: colors.red,
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 14,
          }}
          onPress={() => router.push("/(health)/journees/create" as any)}
          activeOpacity={0.8}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              backgroundColor: "rgba(255,255,255,0.18)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={14} color="#fff" />
          </View>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filtres ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          paddingBottom: 14,
          alignItems: "center",
        }}
        style={{ flexShrink: 0, flexGrow: 0 }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.75}
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 7,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1,
                },
                isActive ? styles.filterActiveBorder : styles.filterInactiveBorder,
                isActive ? styles.filterActiveBg : styles.filterInactiveBg,
              ]}
            >
              <View
                style={[
                  { width: 6, height: 6, borderRadius: 3 },
                  isActive ? { backgroundColor: colors.red } : styles.filterDotInactive,
                ]}
              />
              <Text
                style={[
                  { fontSize: 12, fontWeight: "600" },
                  isActive ? { color: colors.white } : styles.filterTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Contenu ── */}
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
            paddingTop: 2,
            paddingBottom: tabBarHeight + 40,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 60, paddingHorizontal: 32, gap: 16 }}>
              <View
                style={[
                  { width: 84, height: 84, borderRadius: 26, alignItems: "center", justifyContent: "center" },
                  styles.emptyStateIconBg,
                ]}
              >
                <Ionicons
                  name={isError ? "cloud-offline-outline" : "calendar-outline"}
                  size={40}
                  color={colors.red + "50"}
                />
              </View>
              <Text style={styles.emptyStateTitle}>
                {isError ? "Erreur de chargement" : "Aucune journée planifiée"}
              </Text>
              <Text style={styles.emptyStateSub}>
                {isError
                  ? "Tirez vers le bas pour réessayer."
                  : "Créez votre première journée de don pour recruter des donneurs à l'avance."}
              </Text>
              {!isError && (
                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: colors.red,
                    paddingVertical: 14,
                    paddingHorizontal: 28,
                    borderRadius: 14,
                  }}
                  onPress={() => router.push("/(health)/journees/create" as any)}
                  activeOpacity={0.85}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Créer une journée</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <DayCard
              item={item}
              colors={colors}
              onPress={() => router.push(`/(health)/journees/${item.id}` as any)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}