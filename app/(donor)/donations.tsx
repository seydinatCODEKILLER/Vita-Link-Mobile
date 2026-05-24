import React, { useCallback } from "react";
import {
  View,
  Text,
  FlatList,
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
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";

// ─── Imports pour l'erreur réseau ─────────────────────────────
import { isNetworkError } from "@/src/utils/error.utils";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";

dayjs.extend(relativeTime);
dayjs.locale("fr");

// ─── Skeleton Dons ─────────────────────────────────────────────
function DonationsSkeleton({ colors }: { colors: AppColors }) {
  const styles = useThemedStyles((c) => ({
    cardBg: {
      backgroundColor: c.cardBg,
      borderRadius: 16,
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
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.cardBg, { padding: 16, gap: 12 }]}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
                width: "50%",
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  backgroundColor: colors.cardBorder,
                }}
              />
              <View style={[styles.line, { flex: 1 }]} />
            </View>
            <View style={[styles.line, { width: "20%" }]} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.cardBorder,
              }}
            />
            <View style={{ gap: 6, flex: 1 }}>
              <View style={[styles.line, { width: "30%" }]} />
              <View style={[styles.line, { width: "50%", height: 8 }]} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Donation Card ─────────────────────────────────────────────
function DonationCard({ item, colors }: { item: Donation; colors: AppColors }) {
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
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        padding: 16,
        marginBottom: 12,
        gap: 12,
      }}
    >
      {/* Top Row */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              backgroundColor: colors.cardBorder,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.textMuted}
            />
          </View>
          <Text
            style={{
              color: colors.white,
              fontSize: 14,
              fontWeight: "700",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {hospitalName}
          </Text>
        </View>
        <Text
          style={{ color: colors.textMuted, fontSize: 12, fontWeight: "500" }}
        >
          {donatedDate}
        </Text>
      </View>

      {/* Middle Row */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: "rgba(220,30,30,0.10)",
            borderWidth: 1,
            borderColor: "rgba(220,30,30,0.25)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: colors.red, fontSize: 16, fontWeight: "900" }}>
            {bloodLabel}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            flex: 1,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: colors.amber + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="star" size={14} color={colors.amber} />
          </View>
          <View>
            <Text
              style={{ color: colors.amber, fontSize: 16, fontWeight: "800" }}
            >
              +{item.pointsAwarded}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              points Jambaar
            </Text>
          </View>
        </View>

        {isVital && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: "rgba(220,30,30,0.15)",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
            }}
          >
            <Ionicons name="flash" size={10} color={colors.white} />
            <Text
              style={{
                color: colors.white,
                fontSize: 9,
                fontWeight: "800",
                letterSpacing: 0.5,
              }}
            >
              VITAL
            </Text>
          </View>
        )}
      </View>

      {/* Time ago */}
      <Text style={{ color: colors.textSubtle, fontSize: 11, marginTop: -4 }}>
        {donatedTimeAgo}
      </Text>
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function DonationsScreen() {
  const router = useRouter();
  const colors = useColors();
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useMyDonations();

  const donations: Donation[] =
    data?.pages.flatMap((page) => page.donations) ?? [];

  // ─── LOGIQUE D'ERREUR RÉSEAU ────────────────────────────────
  const hasNetworkError = isError && isNetworkError(error);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: { alignItems: "center", justifyContent: "center" },
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
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: c.white,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.5,
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "ios" ? 100 : 80,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      color: c.textMuted,
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    emptySub: {
      color: c.textSubtle,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    loaderMore: { paddingVertical: 20, alignItems: "center" },
  }));

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.75}
      >
        <Ionicons name="arrow-back" size={19} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        Mes <Text style={{ color: colors.red }}>Dons</Text>
      </Text>
      <View style={{ width: 40 }} />
    </View>
  );

  // ── 1. Chargement initial (Skeleton) ───────────────────────
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <DonationsSkeleton colors={colors} />
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ────────────────────────────
  if (hasNetworkError && !data) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        {renderHeader()}
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <DonationCard item={item} colors={colors} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loaderMore}>
              <ActivityIndicator color={colors.red} size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          isError ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="cloud-offline-outline"
                size={40}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyTitle}>Erreur de chargement</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="water-outline"
                size={40}
                color={colors.textSubtle}
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
