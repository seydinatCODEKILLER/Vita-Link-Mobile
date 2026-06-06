import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useBloodRequests } from "@/src/hooks/useBloodRequests";
import { BloodRequest } from "@/src/types/blood-request.types";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { useIsCnts } from "@/src/hooks/useAuthStore";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";
import { BloodRequestStatus } from "@/src/types/shared.types";

dayjs.extend(relativeTime);
dayjs.locale("fr");

// ─── Config ──────────────────────────────────────────────
const STATUS_CONFIG = (colors: AppColors) => ({
  PENDING: {
    label: "En attente",
    color: colors.amber,
    icon: "time-outline" as const,
    stripeColor: colors.amber,
  },
  FULFILLED: {
    label: "Traitée",
    color: colors.success,
    icon: "checkmark-circle-outline" as const,
    stripeColor: colors.success,
  },
  PARTIALLY_FULFILLED: {
    label: "Partiel",
    color: "#60A5FA",
    icon: "pie-chart-outline" as const,
    stripeColor: "#60A5FA",
  },
  ESCALATED_TO_ALERT: {
    label: "Escaladée",
    color: colors.red,
    icon: "alert-circle-outline" as const,
    stripeColor: colors.red,
  },
  REJECTED: {
    label: "Rejetée",
    color: colors.textMuted,
    icon: "close-circle-outline" as const,
    stripeColor: colors.textMuted,
  },
  CANCELLED: {
    label: "Annulée",
    color: colors.textMuted,
    icon: "ban-outline" as const,
    stripeColor: colors.textMuted,
  },
});

const FILTERS: { key: BloodRequestStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "Toutes" },
  { key: "PENDING", label: "En attente" },
  { key: "FULFILLED", label: "Traitées" },
  { key: "ESCALATED_TO_ALERT", label: "Escaladées" },
];

// ─── RequestCard ─────────────────────────────────────────
function RequestCard({
  item,
  colors,
  onPress,
}: {
  item: BloodRequest;
  colors: AppColors;
  onPress: () => void;
}) {
  const config = STATUS_CONFIG(colors)[item.status];
  const isVital = item.urgencyLevel === "VITAL";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 18,
        borderWidth: isVital ? 1.5 : 1,
        borderColor: isVital ? colors.red + "30" : colors.cardBorder,
        overflow: "hidden",
        marginBottom: 10,
      }}
    >
      <View
        style={{
          height: 2.5,
          backgroundColor: config.stripeColor,
          opacity: 0.85,
        }}
      />
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              flex: 1,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: colors.cardBorder,
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Ionicons
                name="business-outline"
                size={18}
                color={colors.textSubtle}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "700",
                  fontSize: 14,
                  marginBottom: 2,
                }}
                numberOfLines={1}
              >
                {item.requestingHospital.name}
              </Text>
              <Text style={{ color: colors.textSubtle, fontSize: 10 }}>
                {dayjs(item.createdAt).fromNow()}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
              backgroundColor: config.color + "14",
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: config.color,
              }}
            />
            <Text
              style={{ color: config.color, fontSize: 10, fontWeight: "700" }}
            >
              {config.label}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 1,
            backgroundColor: colors.cardBorder,
            marginBottom: 12,
          }}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 0 }}>
            <Text
              style={{
                color: colors.red,
                fontWeight: "900",
                fontSize: 26,
                letterSpacing: -1,
                marginRight: 10,
              }}
            >
              {item.bloodType.replace("_", "")}
            </Text>
            <View
              style={{
                width: 1,
                height: 22,
                backgroundColor: colors.cardBorder,
                marginRight: 10,
              }}
            />
            <View>
              <Text
                style={{
                  color: colors.white,
                  fontWeight: "800",
                  fontSize: 14,
                  lineHeight: 16,
                }}
              >
                {item.quantityNeeded}
              </Text>
              <Text
                style={{
                  color: colors.textSubtle,
                  fontSize: 10,
                  lineHeight: 13,
                }}
              >
                poches
              </Text>
            </View>
          </View>

          {isVital && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(220,30,30,0.1)",
                borderWidth: 1,
                borderColor: "rgba(220,30,30,0.2)",
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Ionicons name="flash" size={10} color={colors.red} />
              <Text
                style={{
                  color: colors.red,
                  fontSize: 9,
                  fontWeight: "900",
                  letterSpacing: 0.8,
                }}
              >
                VITAL
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton List ────────────────────────────────────────
function RequestListSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={{ paddingHorizontal: 20, gap: 10, opacity: 0.5 }}>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={{
            height: 150,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            backgroundColor: colors.cardBg,
            overflow: "hidden",
          }}
        >
          {/* Stripe mimicking the top status bar */}
          <View style={{ height: 2.5, backgroundColor: colors.cardBorder }} />
        </View>
      ))}
    </View>
  );
}

// ─── Écran Principal ──────────────────────────────────────
export default function BloodRequestListScreen() {
  const router = useRouter();
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();
  const isCnts = useIsCnts();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data, isLoading, isError, error, refetch, isRefetching } =
    useBloodRequests({
      status:
        activeFilter === "ALL"
          ? undefined
          : (activeFilter as BloodRequestStatus),
    });

  const requests = data?.requests ?? [];

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(health)/blood-requests/${id}?from=list`);
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.6,
      lineHeight: 30,
    },
    headerSub: {
      color: c.textSubtle,
      fontSize: 12,
      marginTop: 4,
    },
    separator: {
      height: 1,
      backgroundColor: c.cardBorder,
      marginHorizontal: 20,
      marginBottom: 16,
      marginTop: 6,
      opacity: 0.5,
    },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 6, // ✅ réduit
      paddingHorizontal: 12, // ✅ réduit
      borderRadius: 20,
      borderWidth: 1,
    },
    filterText: {
      fontSize: 12,
      fontWeight: "500",
    },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 70,
      gap: 12,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: {
      color: c.white,
      fontSize: 17,
      fontWeight: "700",
    },
    emptySub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 240,
    },
  }));

  // ── 1. Erreur réseau SANS data en cache ──
  if (isError && isNetworkError(error) && !requests.length) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Demandes de <Text style={{ color: colors.red }}>Sang</Text>
          </Text>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 2. Chargement initial SANS data en cache ──
  const showSkeleton = isLoading && !requests.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>
          Demandes de <Text style={{ color: colors.red }}>Sang</Text>
        </Text>
        {requests.length > 0 && !showSkeleton && (
          <Text style={styles.headerSub}>
            {requests.length} demande{requests.length > 1 ? "s" : ""} · Mis à
            jour{" "}
          </Text>
        )}
      </Animated.View>

      {/* ── Filters ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          paddingBottom: 8, // ✅ réduit
          paddingTop: 2,
          alignItems: "center",
          height: 44, // ✅ hauteur fixe pour éviter que le ScrollView grandisse
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                if (showSkeleton) return; // Empêche le spam pendant le load
                setActiveFilter(f.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterBtn,
                {
                  borderColor: isActive ? colors.red + "40" : colors.cardBorder,
                  backgroundColor: isActive ? colors.red + "14" : colors.cardBg,
                },
              ]}
              activeOpacity={0.7}
              disabled={showSkeleton}
            >
              {isActive && (
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 3,
                    backgroundColor: colors.red,
                  }}
                />
              )}
              <Text
                style={[
                  styles.filterText,
                  {
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? colors.white : colors.textMuted,
                  },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Thin separator ── */}
      <View style={styles.separator} />

      {/* ── Skeleton ou List ── */}
      {showSkeleton ? (
        <RequestListSkeleton colors={colors} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: tabBarHeight + 40,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <RequestCard
              item={item}
              colors={colors}
              onPress={() => handlePress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {
                    backgroundColor: colors.red + "10",
                    borderColor: colors.red + "20",
                  },
                ]}
              >
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color={colors.red + "80"}
                />
              </View>
              <Text style={styles.emptyTitle}>Aucune demande</Text>
              <Text style={styles.emptySub}>
                {isCnts
                  ? "Les demandes des hôpitaux apparaîtront ici."
                  : "Vos demandes de sang apparaîtront ici."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
