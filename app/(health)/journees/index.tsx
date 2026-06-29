import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { DonationDayCard } from "@/src/components/donation-days/DonationDayCard";
import { DonationDaySkeleton } from "@/src/components/donation-days/DonationDaySkeleton";
import { useDonationDaysScreen } from "@/src/hooks/useDonationDaysScreen";
import { useDonationDayStyles } from "@/src/styles/useDonationDayStyles";
import { DAY_FILTERS } from "@/src/constants/donationDayConfig";

export default function JourneesScreen() {
  const {
    isPending,
    activeFilter,
    setActiveFilter,
    days,
    isLoading,
    isRefetching,
    refetch,
    isError,
    hasNetworkError,
    handleCreate,
    handlePressCard,
  } = useDonationDaysScreen();

  const { styles, colors, tabBarHeight } = useDonationDayStyles();

  // ── 1. Chargement initial ──
  if (isLoading && !days.length) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.red,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
              opacity: 0.5,
            }}
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
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              Créer
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {[1, 2, 3].map((i) => (
            <DonationDaySkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  // ── 2. Erreur réseau sans cache ──
  if (hasNetworkError) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
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
        </View>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── 3. Rendu normal ──
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

        {activeFilter === "PUBLISHED" && (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: isPending ? colors.cardBg : colors.red,
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 14,
            }}
            onPress={handleCreate}
            activeOpacity={isPending ? 0.6 : 0.8}
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
              <Ionicons
                name="add"
                size={14}
                color={isPending ? colors.textSubtle : "#fff"}
              />
            </View>
            <Text
              style={{
                color: isPending ? colors.textSubtle : "#fff",
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              Créer
            </Text>
          </TouchableOpacity>
        )}
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
        {DAY_FILTERS.map((f) => {
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
                isActive
                  ? styles.filterActiveBorder
                  : styles.filterInactiveBorder,
                isActive ? styles.filterActiveBg : styles.filterInactiveBg,
              ]}
            >
              <View
                style={[
                  { width: 6, height: 6, borderRadius: 3 },
                  isActive
                    ? { backgroundColor: colors.red }
                    : styles.filterDotInactive,
                ]}
              />
              <Text
                style={[
                  { fontSize: 12, fontWeight: "600" },
                  isActive
                    ? { color: colors.white }
                    : styles.filterTextInactive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Contenu ── */}
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
          <View
            style={{
              alignItems: "center",
              paddingTop: 60,
              paddingHorizontal: 32,
              gap: 16,
            }}
          >
            <View
              style={[
                {
                  width: 84,
                  height: 84,
                  borderRadius: 26,
                  alignItems: "center",
                  justifyContent: "center",
                },
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
                  backgroundColor: isPending ? colors.cardBg : colors.red,
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  borderRadius: 14,
                  opacity: isPending ? 0.6 : 1,
                }}
                onPress={handleCreate}
                activeOpacity={isPending ? 0.6 : 0.85}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={isPending ? colors.textSubtle : "#fff"}
                />
                <Text
                  style={{
                    color: isPending ? colors.textSubtle : "#fff",
                    fontSize: 15,
                    fontWeight: "700",
                  }}
                >
                  Créer une journée
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <DonationDayCard
            item={item}
            onPress={() => handlePressCard(item.id)}
          />
        )}
      />
    </SafeAreaView>
  );
}
