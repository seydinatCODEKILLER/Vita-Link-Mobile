import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useMyStocks } from "@/src/hooks/useBloodStocks";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useColors } from "@/src/theme/useTheme";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";
import { BloodStockLevel } from "@/src/types/shared.types";

import { StockCard } from "@/src/components/stock/StockCard";
import { UpdateStockModal } from "@/src/components/stock/UpdateStockModal";
import { useStockUpdate } from "@/src/hooks/useStockUpdate";
import { useStockScreenStyles } from "@/src/styles/useStockScreenStyles";
import {
  BLOOD_TYPES_CONFIG,
  calculateStockLevel,
  getStockLevelConfig,
} from "@/src/constants/stockScreen";

export default function StockScreen() {
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();
  const STOCK_LEVEL_CONFIG = getStockLevelConfig(colors);
  const styles = useStockScreenStyles();

  const { data: stocks, isLoading, isError, error, refetch } = useMyStocks();
  const {
    selectedBloodType,
    inputQuantity,
    setInputQuantity,
    isUpdating,
    openModal,
    closeModal,
    confirmUpdate,
  } = useStockUpdate();

  // ── Structure en attente ───────────────────────────────────────────────────
  if (isPending) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="time-outline" size={64} color={colors.textSubtle} />
        <Text style={styles.pendingTitle}>Structure en attente</Text>
        <Text style={styles.pendingSub}>
          Votre CNTS doit être validée avant de pouvoir gérer les stocks.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  // ── Gestion robuste des erreurs ──────────────────────────────────────────────
  if (isError) {
    if (isNetworkError(error)) {
      return (
        <View style={styles.container}>
          <NetworkErrorScreen onRetry={refetch} />
        </View>
      );
    }

    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Impossible de charger les stocks. Vous n'avez peut-être pas les droits nécessaires.";

    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.red} />
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.errorBack}>
          <Text style={styles.errorBackText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stockMap = new Map(stocks?.map((s) => [s.bloodType, s]));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              Stocks de <Text style={{ color: colors.red }}>Sang</Text>
            </Text>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.headerSub}>Mise à jour en temps réel</Text>
            </View>
          </View>
        </View>

        {/* ── Légende ─────────────────────────────────────────────────────── */}
        <View style={styles.legendRow}>
          {(
            Object.entries(STOCK_LEVEL_CONFIG) as [
              BloodStockLevel,
              (typeof STOCK_LEVEL_CONFIG)[BloodStockLevel],
            ][]
          ).map(([level, conf]) => (
            <View key={level} style={styles.legendItem}>
              <View
                style={[
                  styles.legendIconWrap,
                  { backgroundColor: conf.color + "15" },
                ]}
              >
                <Ionicons name={conf.icon} size={13} color={conf.color} />
              </View>
              <Text style={[styles.legendText, { color: conf.color }]}>
                {conf.label}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Grille ──────────────────────────────────────────────────────── */}
        <View style={styles.grid}>
          {BLOOD_TYPES_CONFIG.map((bt) => {
            const apiStock = stockMap.get(bt.value);
            const stock = {
              bloodType: bt.value,
              quantity: apiStock?.quantity ?? 0,
              level: calculateStockLevel(apiStock?.quantity ?? 0),
            };

            return (
              <StockCard
                key={bt.value}
                stock={stock}
                onPress={() => openModal(bt.value, stock.quantity)}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* ── Modale de mise à jour ──────────────────────────────────────────── */}
      <UpdateStockModal
        visible={!!selectedBloodType}
        selectedBloodType={selectedBloodType}
        inputQuantity={inputQuantity}
        onChangeQuantity={setInputQuantity}
        onCancel={closeModal}
        onConfirm={confirmUpdate}
        isUpdating={isUpdating}
      />
    </SafeAreaView>
  );
}
