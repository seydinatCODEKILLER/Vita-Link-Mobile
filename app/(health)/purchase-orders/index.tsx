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
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";
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
  EXPIRED: { label: "Expiré", color: "red", icon: "alert-circle-outline" },
  CANCELLED: {
    label: "Annulé",
    color: "textMuted",
    icon: "close-circle-outline",
  },
};

// ─── Onglets de filtrage ────────────────────────────────────
const TAB_FILTERS = [
  {
    label: "En attente",
    value: "PENDING",
    icon: "time-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    label: "Expirés",
    value: "EXPIRED",
    icon: "alert-circle-outline" as keyof typeof Ionicons.glyphMap,
  },
  {
    label: "Utilisés",
    value: "USED",
    icon: "checkmark-circle-outline" as keyof typeof Ionicons.glyphMap,
  },
];

// ─── Skeleton Card ──────────────────────────────────────────
function SkeletonCard() {
  const styles = useThemedStyles((c) => ({
    card: {
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 16,
      gap: 12,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    circle: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: c.cardBorder,
    },
    badge: {
      width: 80,
      height: 22,
      borderRadius: 8,
      backgroundColor: c.cardBorder,
    },
    line: { height: 12, borderRadius: 6, backgroundColor: c.cardBorder },
  }));

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.circle} />
        <View style={styles.badge} />
      </View>
      <View style={[styles.line, { width: "70%" }]} />
      <View style={[styles.line, { width: "50%" }]} />
      <View style={[styles.line, { width: "40%" }]} />
    </View>
  );
}

// ─── Écran principal ────────────────────────────────────────
export default function CntsPurchaseOrdersScreen() {
  const router = useRouter();
  const colors = useColors();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const goBack = useSmartBack({ defaultRoute: "/(health)" });

  const { data, isLoading, isError, error, refetch, isRefetching } =
    usePurchaseOrders({
      status: activeTab,
      limit: 20,
    });

  const orders = data?.orders ?? [];

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },

    // ── Header ──
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
    headerCenter: { alignItems: "center", gap: 2 },
    headerTitle: { color: c.white, fontSize: 17, fontWeight: "700" },
    headerSub: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
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

    // ── Tabs ──
    tabsContainer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      marginBottom: 16,
      gap: 8,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.cardBorder,
      backgroundColor: c.cardBg,
    },
    tabActive: {
      backgroundColor: c.red + "1A",
      borderColor: c.red + "4D",
    },
    tabText: { fontSize: 11, fontWeight: "700", color: c.textMuted },
    tabTextActive: { color: c.red },

    // ── Card ──
    card: {
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 16,
      overflow: "hidden",
    },
    cardAccent: {
      position: "absolute",
      top: 0,
      left: 0,
      width: 3,
      height: "100%",
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    cardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    bloodBadge: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    bloodBadgeText: { color: c.red, fontSize: 15, fontWeight: "900" },
    cardTitleGroup: { gap: 3 },
    cardCode: {
      color: c.white,
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    cardDate: { color: c.textMuted, fontSize: 11, fontWeight: "500" },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 0.5,
    },
    statusText: { fontSize: 10, fontWeight: "700" },

    // ── Divider ──
    divider: {
      height: 0.5,
      backgroundColor: c.cardBorder,
      marginBottom: 12,
    },

    // ── Card Body ──
    cardBody: { gap: 7 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 7,
      backgroundColor: c.cardBorder + "80",
      alignItems: "center",
      justifyContent: "center",
    },
    infoText: { color: c.textMuted, fontSize: 12, fontWeight: "500", flex: 1 },
    infoTextBold: { color: c.white, fontSize: 12, fontWeight: "700" },

    // ── Confirm Btn ──
    confirmBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 12,
      paddingVertical: 11,
      borderRadius: 11,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
    },
    confirmBtnText: { color: c.red, fontSize: 12, fontWeight: "700" },

    // ── Empty ──
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
      gap: 12,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 20,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: { color: c.white, fontSize: 15, fontWeight: "700" },
    emptyText: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 19,
    },

    // ── Error ──
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      gap: 12,
    },
    errorIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: c.red + "14",
      borderWidth: 1,
      borderColor: c.red + "30",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    errorTitle: { color: c.white, fontSize: 16, fontWeight: "700" },
    errorText: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    retryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.red,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 4,
    },
    retryBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  }));

  // ── Handlers ──
  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleConfirmExpired = (order: PurchaseOrder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOrder(order);
    setIsSheetVisible(true);
  };

  // ── Render Card ──
  const renderItem = ({ item }: { item: PurchaseOrder }) => {
    const statusCfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.PENDING;
    const statusColor =
      colors[statusCfg.color as keyof typeof colors] ?? colors.textMuted;

    return (
      <View style={styles.card}>
        {/* Accent bar gauche colorée selon statut */}
        <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />

        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <View style={styles.bloodBadge}>
              <Text style={styles.bloodBadgeText}>
                {item.bloodType.replace("_", "")}
              </Text>
            </View>
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

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="business-outline"
                size={12}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.infoText} numberOfLines={1}>
              {item.hospital.name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons
                name="water-outline"
                size={12}
                color={colors.textMuted}
              />
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.infoTextBold}>{item.quantity}</Text> poche(s)
              — {item.bloodType.replace("_", " ")}
            </Text>
          </View>

          {item.expiresAt && (
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <Ionicons
                  name="hourglass-outline"
                  size={12}
                  color={colors.textMuted}
                />
              </View>
              <Text style={styles.infoText}>
                Expire {dayjs(item.expiresAt).fromNow()}
              </Text>
            </View>
          )}
        </View>

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

  // ── Empty State ──
  const emptyLabel =
    activeTab === "PENDING"
      ? "en attente"
      : activeTab === "EXPIRED"
        ? "expiré"
        : "utilisé";

  const ListEmpty = !isLoading ? (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons
          name="document-text-outline"
          size={32}
          color={colors.textSubtle}
        />
      </View>
      <Text style={styles.emptyTitle}>Aucun bon {emptyLabel}</Text>
      <Text style={styles.emptyText}>
        Les bons de commande {emptyLabel}s apparaîtront ici.
      </Text>
    </View>
  ) : null;

  // ── Error State ──
  const renderError = () => {
    if (isNetworkError(error)) {
      return <NetworkErrorScreen onRetry={refetch} />;
    }

    const errorMessage =
      (error as any)?.response?.data?.message ||
      "Impossible de charger les bons de commande.";

    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconWrap}>
          <Ionicons name="alert-circle-outline" size={28} color={colors.red} />
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
    );
  };

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
          onPress={() => router.push("/(health)/scan" as any)}
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
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : isError ? (
        renderError()
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.red}
            />
          }
          ListEmptyComponent={ListEmpty}
        />
      )}

      {/* ── Sheet Confirmation Expiration ── */}
      <ExpiredOrderConfirmSheet
        visible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        order={selectedOrder}
      />
    </SafeAreaView>
  );
}
