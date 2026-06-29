import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ExpiredOrderConfirmSheet from "@/src/components/ui/ExpiredOrderConfirmSheet";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";

import { PurchaseOrderCard } from "@/src/components/purchase-orders/PurchaseOrderCard";
import { PurchaseOrdersEmpty } from "@/src/components/purchase-orders/PurchaseOrdersEmpty";
import { PurchaseOrderSkeleton } from "@/src/components/purchase-orders/PurchaseOrderSkeleton";
import { TAB_FILTERS } from "@/src/constants/purchaseOrderConfig";
import { usePurchaseOrdersScreen } from "@/src/hooks/usePurchaseOrdersScreen";
import { usePurchaseOrdersStyles } from "@/src/styles/usePurchaseOrdersStyles";
import { useColors } from "@/src/theme/useTheme";

export default function CntsPurchaseOrdersScreen() {
  const {
    activeTab,
    isSheetVisible,
    selectedOrder,
    orders,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    goBack,
    handleTabPress,
    handleConfirmExpired,
    handleScanPress,
    handleCloseSheet,
    emptyLabel,
  } = usePurchaseOrdersScreen();

  const styles = usePurchaseOrdersStyles();
  const colors = useColors();

  // ── Error State ──
  if (isError) {
    if (isNetworkError(error)) {
      return (
        <SafeAreaView style={styles.container} edges={["top"]}>
          <NetworkErrorScreen onRetry={refetch} />
        </SafeAreaView>
      );
    }

    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Impossible de charger les bons de commande.";

    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.errorContainer}>
          <View style={styles.errorIconWrap}>
            <Ionicons
              name="alert-circle-outline"
              size={28}
              color={colors.red}
            />
          </View>
          <Text style={styles.errorTitle}>Une erreur est survenue</Text>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.retryBtnText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bons de Commande</Text>
          <Text style={styles.headerSub}>
            {orders.length > 0 ? `${orders.length} bon(s)` : "Aucun résultat"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.scanBtn}
          onPress={handleScanPress}
          activeOpacity={0.8}
        >
          <Ionicons name="scan-outline" size={16} color="#fff" />
          <Text style={styles.scanBtnText}>Scanner</Text>
        </TouchableOpacity>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsContainer}>
        {TAB_FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => handleTabPress(tab.value)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={12}
              color={activeTab === tab.value ? colors.red : colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.value && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {isLoading ? (
        <>
          <PurchaseOrderSkeleton />
          <PurchaseOrderSkeleton />
          <PurchaseOrderSkeleton />
        </>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PurchaseOrderCard
              order={item}
              onConfirmExpired={handleConfirmExpired}
            />
          )}
          contentContainerStyle={{ paddingBottom:  16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.red}
            />
          }
          ListEmptyComponent={<PurchaseOrdersEmpty label={emptyLabel} />}
        />
      )}

      {/* ── Sheet Confirmation Expiration ── */}
      <ExpiredOrderConfirmSheet
        visible={isSheetVisible}
        onClose={handleCloseSheet}
        order={selectedOrder}
      />
    </SafeAreaView>
  );
}
