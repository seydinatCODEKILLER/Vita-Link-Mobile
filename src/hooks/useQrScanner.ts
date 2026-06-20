import { useEffect, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Camera } from "expo-camera";
import { useScanDonation } from "@/src/hooks/useDonations";
import { useScanPurchaseOrder } from "@/src/hooks/usePurchaseOrders";

export type ScanMode = "DONATION" | "PURCHASE_ORDER";

/**
 * Centralise toute la logique de l'écran Scan :
 * - permission caméra
 * - routage par préfixe du QR code (VITA- / CMD-)
 * - validation du don ou du bon de commande
 * - état de la modale de succès
 */
export function useQrScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [scanMode, setScanMode] = useState<ScanMode | null>(null);
  const [flashOn, setFlashOn] = useState(false);

  const { mutateAsync: scanDonation, isPending: isScanningDonation } =
    useScanDonation();
  const { mutateAsync: scanPurchaseOrder, isPending: isScanningOrder } =
    useScanPurchaseOrder();
  const isScanning = isScanningDonation || isScanningOrder;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const resetScan = () => {
    setScanned(false);
    setScanMode(null);
  };

  // ── Handler générique pour un mode donné ────────────────────────────────────
  const runScan = async (
    mode: ScanMode,
    action: (data: string) => Promise<any>,
    data: string,
    failureMessage: string,
  ) => {
    setScanMode(mode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await action(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessData(result);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg = error?.response?.data?.message || failureMessage;
      Alert.alert("Échec de la validation", msg, [
        { text: "OK", onPress: resetScan },
      ]);
    }
  };

  // ── Routeur de préfixe ──────────────────────────────────────────────────────
  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isScanning) return;
    setScanned(true);

    if (data.startsWith("VITA-")) {
      return runScan(
        "DONATION",
        scanDonation,
        data,
        "Erreur lors de la validation du don.",
      );
    }

    if (data.startsWith("CMD-")) {
      return runScan(
        "PURCHASE_ORDER",
        scanPurchaseOrder,
        data,
        "Erreur lors de la validation du bon.",
      );
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "QR Code invalide",
      "Ce code ne correspond ni à un pass donneur ni à un bon de commande Vita-Link.",
      [{ text: "OK", onPress: () => setScanned(false) }],
    );
  };

  const handleRescan = () => {
    setSuccessData(null);
    resetScan();
  };

  return {
    hasPermission,
    scanned,
    successData,
    scanMode,
    flashOn,
    setFlashOn,
    handleBarcodeScanned,
    handleRescan,
  };
}
