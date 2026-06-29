import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RequestCard } from "@/src/components/blood-requests/RequestCard";
import { RequestListSkeleton } from "@/src/components/blood-requests/RequestListSkeleton";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { FILTERS } from "@/src/constants/bloodRequestConfig";
import { useBloodRequestListScreen } from "@/src/hooks/useBloodRequestListScreen";
import { useBloodRequestListStyles } from "@/src/styles/useBloodRequestListStyles";

export default function BloodRequestListScreen() {
  const {
    isCnts,
    activeFilter,
    fadeAnim,
    requests,
    isRefetching,
    refetch,
    hasNetworkError,
    showSkeleton,
    handlePress,
    handleFilterPress,
  } = useBloodRequestListScreen();

  const { styles, colors, tabBarHeight } = useBloodRequestListStyles();

  // ── 1. Erreur réseau SANS data en cache ──
  if (hasNetworkError) {
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

  // ── 2. Rendu normal ──
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
          paddingBottom: 8,
          paddingTop: 2,
          alignItems: "center",
          height: 44,
        }}
      >
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => handleFilterPress(f.key, showSkeleton)}
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
        <RequestListSkeleton />
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
            <RequestCard item={item} onPress={() => handlePress(item.id)} />
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
