import React from "react";
import { View, StyleSheet } from "react-native";
import { CameraView } from "expo-camera";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { useAuthStore } from "@/src/store/auth.store";
import { useThemedStyles } from "@/src/theme/useTheme";

import { useQrScanner } from "@/src/hooks/useQrScanner";
import {
  ScanGateScreen,
  ScanLoadingScreen,
} from "@/src/components/scan/ScanGateScreen";
import { ScannerOverlay } from "@/src/components/scan/ScannerOverlay";
import { ScanSuccessModal } from "@/src/components/scan/ScanSuccessModal";

export default function ScanScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();
  const user = useAuthStore((s) => s.user);
  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
  }));

  const isCntsUser = user?.role === "CNTS_ADMIN" || user?.role === "CNTS_AGENT";

  const goBack = useSmartBack({
    defaultRoute: "/(health)",
    routeMap: { profile: "/(health)/profile", alerts: "/(health)/alerts" },
  });

  const {
    hasPermission,
    scanned,
    successData,
    scanMode,
    flashOn,
    setFlashOn,
    handleBarcodeScanned,
    handleRescan,
  } = useQrScanner();

  // ── Garde rôle (sécurité UI supplémentaire) ─────────────────────────────────
  if (!isCntsUser) {
    return (
      <ScanGateScreen
        icon="lock-closed-outline"
        title="Accès restreint"
        subtitle="Seuls les agents de la CNTS peuvent valider les dons de sang par scan."
      />
    );
  }

  // ── Structure en attente ────────────────────────────────────────────────────
  if (isPending) {
    return (
      <ScanGateScreen
        icon="time-outline"
        title="Structure en attente"
        subtitle="Votre CNTS doit être validée avant de pouvoir scanner les pass donneurs."
      />
    );
  }

  // ── Permission caméra en cours de résolution ────────────────────────────────
  if (hasPermission === null) {
    return <ScanLoadingScreen />;
  }

  // ── Permission caméra refusée ────────────────────────────────────────────────
  if (hasPermission === false) {
    return (
      <ScanGateScreen
        icon="camera-outline"
        title="Accès à la caméra requis"
        subtitle="Vous devez autoriser l'accès à la caméra pour scanner les pass donneurs."
      />
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        enableTorch={flashOn}
      >
        <ScannerOverlay
          tabBarHeight={tabBarHeight}
          flashOn={flashOn}
          onToggleFlash={() => setFlashOn(!flashOn)}
          onClose={goBack}
        />
      </CameraView>

      <ScanSuccessModal
        visible={!!successData}
        scanMode={scanMode}
        successData={successData}
        tabBarHeight={tabBarHeight}
        onRescan={handleRescan}
      />
    </View>
  );
}
