import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { usePurchaseOrders } from "@/src/hooks/usePurchaseOrders";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { PurchaseOrder } from "@/src/types/blood-request.types";

export function usePurchaseOrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [isSheetVisible, setIsSheetVisible] = useState(false);

  const goBack = useSmartBack({ defaultRoute: "/(health)" });

  const { data, isLoading, isError, error, refetch, isRefetching } =
    usePurchaseOrders({ status: activeTab, limit: 20 });

  const orders = data?.orders ?? [];

  // ── Handlers ──────────────────────────────────────────────
  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleConfirmExpired = (order: PurchaseOrder) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOrder(order);
    setIsSheetVisible(true);
  };

  const handleScanPress = () => {
    router.push("/(health)/scan" as any);
  };

  const handleCloseSheet = () => {
    setIsSheetVisible(false);
  };

  // ── Dérivés ───────────────────────────────────────────────
  const emptyLabel =
    activeTab === "PENDING"
      ? "en attente"
      : activeTab === "EXPIRED"
        ? "expiré"
        : "utilisé";

  return {
    // State
    activeTab,
    isSheetVisible,
    selectedOrder,
    // Data
    orders,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    // Handlers
    goBack,
    handleTabPress,
    handleConfirmExpired,
    handleScanPress,
    handleCloseSheet,
    // Dérivés
    emptyLabel,
  };
}
