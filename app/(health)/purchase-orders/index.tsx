import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { usePurchaseOrders } from "@/src/hooks/usePurchaseOrders";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import ExpiredOrderConfirmSheet from "@/src/components/ui/ExpiredOrderConfirmSheet";
import { PurchaseOrder } from "@/src/types/blood-request.types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

// ─── Config Status ──────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PENDING: { label: "En attente", color: "amber", icon: "time-outline" },
  USED: {
    label: "Utilisé",
    color: "success",
    icon: "checkmark-circle-outline",
  },
  // ⚠️ CORRECTION ICI : icon="alert-circle-outline" au lieu de icon="alert-circle-outline"
  EXPIRED: { label: "Expiré", color: "red", icon: "alert-circle-outline" },
  CANCELLED: {
    label: "Annulé",
    color: "textMuted",
    icon: "close-circle-outline",
  },
};

// Onglets de filtrage
const TAB_FILTERS = [
  { label: "En attente", value: "PENDING" },
  { label: "Expirés", value: "EXPIRED" },
  { label: "Utilisés", value: "USED" },
];

export default function CntsPurchaseOrdersScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const goBack = useSmartBack({ defaultRoute: "/(health)" });

  const { data, isLoading, refetch, isRefetching } = usePurchaseOrders({
    status: activeTab,
    limit: 20,
  });

  // ⚠️ CORRECTION ICI : data?.data n'existe pas, c'est data?.orders
  const orders = data?.orders ?? [];

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: c.white, fontSize: 17, fontWeight: "700" },
    scanBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.red,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
    },
    scanBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    tabsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    tabActive: {
      backgroundColor: c.red + "1A",
      borderColor: c.red + "4D",
    },
    tabText: { fontSize: 12, fontWeight: "700", color: c.textMuted },
    tabTextActive: { color: c.red },
    card: {
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 14,
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 10,
    },
    bloodBadge: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    bloodBadgeText: {
      color: c.red,
      fontSize: 14,
      fontWeight: "900",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 0.5,
    },
    statusText: { fontSize: 10, fontWeight: "700" },
    cardBody: { gap: 6 },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    infoText: { color: c.textMuted, fontSize: 12, fontWeight: "500" },
    codeText: {
      color: c.white,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    confirmBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 10,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
    },
    confirmBtnText: { color: c.red, fontSize: 12, fontWeight: "700" },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 10,
    },
    emptyText: { color: c.textMuted, fontSize: 14, textAlign: "center" },
  }));

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleConfirmExpired = (order: PurchaseOrder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOrder(order);
    setIsSheetVisible(true);
  };

  const renderItem = ({ item }: { item: PurchaseOrder }) => {
    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
    const statusColor =
      colors[statusCfg.color as keyof typeof colors] ?? colors.textMuted;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.bloodBadge}>
            <Text style={styles.bloodBadgeText}>
              {item.bloodType.replace("_", "")}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusColor + "14",
                borderColor: statusColor + "38",
              },
            ]}
          >
            <Ionicons name={statusCfg.icon} size={10} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons
              name="business-outline"
              size={13}
              color={colors.textMuted}
            />
            <Text style={styles.infoText}>{item.hospital.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="water-outline" size={13} color={colors.textMuted} />
            <Text style={styles.infoText}>
              {item.quantity} poche(s) — {item.bloodType.replace("_", " ")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="qr-code-outline"
              size={13}
              color={colors.textMuted}
            />
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
        </View>

        {/* Bouton de confirmation si EXPIRED */}
        {item.status === "EXPIRED" && (
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => handleConfirmExpired(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="help-circle-outline" size={14} color={colors.red} />
            <Text style={styles.confirmBtnText}>
              Le sang a-t-il été remis ?
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goBack}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={19} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bons de Commande 📋</Text>

        {/* Bouton vers le Scanner */}
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push("/(health)/scan" as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="scan-outline" size={16} color="#fff" />
          <Text style={styles.scanBtnText}>Scanner</Text>
        </TouchableOpacity>
      </View>

      {/* Onglets de filtre */}
      <View style={styles.tabsContainer}>
        {TAB_FILTERS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => handleTabPress(tab.value)}
            activeOpacity={0.7}
          >
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

      {/* Liste des Bons */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.red}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={colors.textSubtle}
              />
              <Text style={styles.emptyText}>
                Aucun bon{" "}
                {activeTab === "PENDING"
                  ? "en attente"
                  : activeTab === "EXPIRED"
                    ? "expiré"
                    : "utilisé"}
              </Text>
            </View>
          ) : null
        }
      />

      {/* Sheet Confirmation Expiration */}
      <ExpiredOrderConfirmSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        order={selectedOrder}
      />
    </SafeAreaView>
  );
}
