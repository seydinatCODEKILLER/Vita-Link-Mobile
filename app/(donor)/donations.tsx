import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useMyDonations } from "@/src/hooks/useDonations";
import { Donation } from "@/src/types/domain.types";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";

dayjs.extend(relativeTime);
dayjs.locale("fr");

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
} as const;

// ─── Composant Donation Card ───────────────────────────────────
function DonationCard({ item }: { item: Donation }) {
  const alertData = item.alertResponse?.alert;
  const hospitalName = alertData?.healthStructure.name ?? "Hôpital";
  const bloodLabel = alertData?.bloodType
    ? (BLOOD_TYPE_LABELS[alertData.bloodType] ?? alertData.bloodType)
    : "?";
  const isVital = alertData?.urgencyLevel === "VITAL";
  const donatedDate = item.donatedAt
    ? dayjs(item.donatedAt).format("DD MMM YYYY")
    : "";
  const donatedTimeAgo = item.donatedAt ? dayjs(item.donatedAt).fromNow() : "";

  return (
    <View style={styles.card}>
      {/* Top Row: Hospital & Date */}
      <View style={styles.cardTop}>
        <View style={styles.hospitalRow}>
          <View style={styles.hospitalIcon}>
            <Ionicons
              name="business-outline"
              size={14}
              color={COLORS.textMuted}
            />
          </View>
          <Text style={styles.hospitalName} numberOfLines={1}>
            {hospitalName}
          </Text>
        </View>
        <Text style={styles.dateText}>{donatedDate}</Text>
      </View>

      {/* Middle Row: Blood Type + Points */}
      <View style={styles.cardMiddle}>
        <View style={styles.bloodBadge}>
          <Text style={styles.bloodText}>{bloodLabel}</Text>
        </View>

        <View style={styles.pointsBlock}>
          <View style={styles.pointsIcon}>
            <Ionicons name="star" size={14} color={COLORS.amber} />
          </View>
          <View>
            <Text style={styles.pointsValue}>+{item.pointsAwarded}</Text>
            <Text style={styles.pointsLabel}>points Jambaar</Text>
          </View>
        </View>

        {isVital && (
          <View style={styles.vitalBadge}>
            <Ionicons name="flash" size={10} color={COLORS.white} />
            <Text style={styles.vitalText}>VITAL</Text>
          </View>
        )}
      </View>

      {/* Bottom Row: Time ago */}
      <Text style={styles.timeAgoText}>{donatedTimeAgo}</Text>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function DonationsScreen() {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useMyDonations();

  // Aplatir les pages en une seule liste
  const donations: Donation[] =
    data?.pages.flatMap((page) => page.donations) ?? [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loaderMore}>
        <ActivityIndicator color={COLORS.red} size="small" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="arrow-back" size={19} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Mes <Text style={{ color: COLORS.red }}>Dons</Text>
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DonationCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          isError ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cloud-offline-outline"
                size={40}
                color={COLORS.textSubtle}
              />
              <Text style={styles.emptyTitle}>Erreur de chargement</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="water-outline"
                size={40}
                color={COLORS.textSubtle}
              />
              <Text style={styles.emptyTitle}>Aucun don enregistré</Text>
              <Text style={styles.emptySub}>
                Répondez à une alerte pour sauver des vies et gagnez des points
                Jambaar !
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { alignItems: "center", justifyContent: "center" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
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
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 100 : 80,
  },

  // Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hospitalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  hospitalIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  cardMiddle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bloodBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(220,30,30,0.10)",
    borderWidth: 1,
    borderColor: "rgba(220,30,30,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  bloodText: {
    color: COLORS.red,
    fontSize: 16,
    fontWeight: "900",
  },
  pointsBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  pointsIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(250,199,117,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  pointsValue: {
    color: COLORS.amber,
    fontSize: 16,
    fontWeight: "800",
  },
  pointsLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  vitalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(220,30,30,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vitalText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  timeAgoText: {
    color: COLORS.textSubtle,
    fontSize: 11,
    marginTop: -4,
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: COLORS.textMuted,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySub: {
    color: COLORS.textSubtle,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  // Loader
  loaderMore: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
