import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useAffiliatedHospitals } from "@/src/hooks/useHealthStructure";
import { AffiliatedHospital } from "@/src/types/healthStructure.type";
import { HealthStructureStatus } from "@/src/types/shared.types";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { AppColors } from "@/src/theme/colors";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";

// ─── Config ──────────────────────────────────────────────
const STATUS_CONFIG = (colors: AppColors) => ({
  VERIFIED: {
    label: "Vérifié",
    color: colors.success,
    icon: "shield-checkmark" as const,
  },
  PENDING_REVIEW: {
    label: "En attente",
    color: colors.amber,
    icon: "time-outline" as const,
  },
  SUSPENDED: {
    label: "Suspendu",
    color: colors.red,
    icon: "alert-circle-outline" as const,
  },
});

const FILTERS = [
  { key: "ALL", label: "Tous" },
  { key: "VERIFIED", label: "Vérifiés" },
  { key: "PENDING_REVIEW", label: "En attente" },
] as const;

// ─── HospitalCard ────────────────────────────────────────
function HospitalCard({
  item,
  colors,
  onPress,
}: {
  item: AffiliatedHospital;
  colors: AppColors;
  onPress: () => void;
}) {
  const statusConf = STATUS_CONFIG(colors)[item.status];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 16,
        borderWidth: 0.5,
        borderColor: colors.cardBorder,
        padding: 14,
        marginBottom: 10,
        gap: 10,
      }}
    >
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
            gap: 10,
            flex: 1,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: statusConf.color + "14",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="business-outline"
              size={18}
              color={statusConf.color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.white, fontWeight: "700", fontSize: 14 }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>
              {item.region}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 8,
            backgroundColor: statusConf.color + "14",
          }}
        >
          <Ionicons name={statusConf.icon} size={10} color={statusConf.color} />
          <Text
            style={{ color: statusConf.color, fontSize: 9, fontWeight: "700" }}
          >
            {statusConf.label}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 6,
          borderTopWidth: 0.5,
          borderTopColor: colors.cardBorder,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {item._count.staffMembers} membre
          {item._count.staffMembers > 1 ? "s" : ""}
        </Text>
        <Ionicons name="chevron-forward" size={14} color={colors.textSubtle} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Skeleton List ────────────────────────────────────────
function HospitalListSkeleton({ colors }: { colors: AppColors }) {
  return (
    <View style={{ paddingHorizontal: 20, gap: 10, opacity: 0.5 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            height: 100,
            borderRadius: 16,
            borderWidth: 0.5,
            borderColor: colors.cardBorder,
            backgroundColor: colors.cardBg,
          }}
        />
      ))}
    </View>
  );
}

// ─── Écran Principal ──────────────────────────────────────
export default function AffiliatedHospitalsScreen() {
  const router = useRouter();
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const {
    data: hospitals = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useAffiliatedHospitals(
    activeFilter !== "ALL"
      ? { status: activeFilter as HealthStructureStatus }
      : undefined,
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(health)/hospitals/${id}`);
  };

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
    headerTitle: {
      color: c.white,
      fontSize: 26,
      fontWeight: "800",
      letterSpacing: -0.5,
    },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterText: { fontSize: 11 },
    emptyContainer: {
      alignItems: "center",
      paddingTop: 60,
      gap: 12,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
    },
    emptySub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
  }));

  // ── 1. Erreur réseau SANS data en cache ──
  if (isError && isNetworkError(error) && !hospitals?.length) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Hôpitaux <Text style={{ color: colors.red }}>Affiliés</Text>
          </Text>
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 2. Chargement initial SANS data en cache ──
  const showSkeleton = isLoading && !hospitals?.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.headerTitle}>
          Hôpitaux <Text style={{ color: colors.red }}>Affiliés</Text>
        </Text>
      </Animated.View>

      {/* ── Filters ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 6,
          paddingBottom: 10,
          paddingTop: 2,
          alignItems: "center",
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => {
                if (showSkeleton) return;
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

      {/* ── Skeleton ou List ── */}
      {showSkeleton ? (
        <HospitalListSkeleton colors={colors} />
      ) : (
        <FlatList
          data={hospitals ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: tabBarHeight + 40,
          }}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isRefetching}
          renderItem={({ item }) => (
            <HospitalCard
              item={item}
              colors={colors}
              onPress={() => handlePress(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="business-outline"
                size={48}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyTitle}>Aucun hôpital</Text>
              <Text style={styles.emptySub}>
                Les hôpitaux de votre région apparaîtront ici une fois affiliés
                à votre CNTS.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
