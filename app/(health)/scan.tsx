import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { CameraView, Camera } from "expo-camera";
import { useScanDonation } from "@/src/hooks/useDonations";
import { useIsStructurePending } from "@/src/hooks/useIsStructurePending";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_SIZE = SCREEN_WIDTH * 0.7;

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const isPending = useIsStructurePending();
  const colors = useColors();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [flashOn, setFlashOn] = useState(false);

  const goBack = useSmartBack({
    defaultRoute: "/(health)",
    routeMap: {
      profile: "/(health)/profile",
      alerts: "/(health)/alerts",
    },
  });

  const { mutateAsync: scanDonation, isPending: isScanning } =
    useScanDonation();

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    centered: {
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 24,
    },
    permissionTitle: {
      color: c.white,
      fontSize: 18,
      fontWeight: "700",
      marginTop: 16,
      textAlign: "center",
    },
    permissionSub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    // ── Camera overlay — toujours sombre, indépendant du thème ──
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
    headerBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    scanArea: { flex: 1, alignItems: "center", justifyContent: "center" },
    scanFrame: { width: SCAN_SIZE, height: SCAN_SIZE, position: "relative" },
    corner: { position: "absolute", width: 30, height: 30, borderColor: c.red },
    topLeft: {
      top: 0,
      left: 0,
      borderTopWidth: 4,
      borderLeftWidth: 4,
      borderTopLeftRadius: 12,
    },
    topRight: {
      top: 0,
      right: 0,
      borderTopWidth: 4,
      borderRightWidth: 4,
      borderTopRightRadius: 12,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderBottomWidth: 4,
      borderLeftWidth: 4,
      borderBottomLeftRadius: 12,
    },
    bottomRight: {
      bottom: 0,
      right: 0,
      borderBottomWidth: 4,
      borderRightWidth: 4,
      borderBottomRightRadius: 12,
    },
    instructions: { alignItems: "center", paddingBottom: 24, gap: 8 },
    instructionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
    // ── Modal succès ──
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "flex-end",
    },
    successCard: {
      backgroundColor: c.cardBg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: 24,
      gap: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.cardBorder,
    },
    successIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.success + "26",
      alignItems: "center",
      justifyContent: "center",
      marginTop: -64,
      borderWidth: 4,
      borderColor: c.bg,
    },
    successTitle: { color: c.success, fontSize: 24, fontWeight: "800" },
    successSub: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
    },
    donorInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.cardBg,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: c.cardBorder,
      width: "100%",
    },
    donorInfoText: { color: c.white, fontSize: 14, fontWeight: "700" },
    pointsRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: c.amber + "14",
      borderWidth: 1,
      borderColor: c.amber + "33",
      borderRadius: 14,
      padding: 16,
    },
    pointsLabel: { color: c.textMuted, fontSize: 13, fontWeight: "600" },
    pointsValue: { color: c.amber, fontSize: 18, fontWeight: "900" },
    gradeBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.amber + "1A",
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.amber + "4D",
    },
    gradeText: { color: c.amber, fontSize: 13, fontWeight: "700" },
    rescanBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      backgroundColor: c.red,
      paddingVertical: 16,
      borderRadius: 16,
      marginTop: 8,
    },
    rescanBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  }));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isScanning) return;
    setScanned(true);
    if (!data.startsWith("VITA-")) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "QR Code invalide",
        "Ce code ne correspond pas à un pass Vita-Link. Vérifiez que le donneur affiche bien son pass sur l'application.",
        [{ text: "OK", onPress: () => setScanned(false) }],
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const result = await scanDonation(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessData(result);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const msg =
        error?.response?.data?.message ||
        "Erreur lors de la validation du don.";
      Alert.alert("Échec de la validation", msg, [
        { text: "OK", onPress: () => setScanned(false) },
      ]);
    }
  };

  const handleRescan = () => {
    setSuccessData(null);
    setScanned(false);
  };

  // ── Structure en attente ──
  if (isPending) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="time-outline" size={64} color={colors.textSubtle} />
        <Text style={styles.permissionTitle}>Structure en attente</Text>
        <Text style={styles.permissionSub}>
          Votre structure doit être validée par nos équipes avant de pouvoir
          scanner les pass donneurs.
        </Text>
      </View>
    );
  }

  // ── Permissions en attente ──
  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  // ── Permissions refusées ──
  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="camera-outline" size={64} color={colors.textSubtle} />
        <Text style={styles.permissionTitle}>Accès à la caméra requis</Text>
        <Text style={styles.permissionSub}>
          Vous devez autoriser l&apos;accès à la caméra pour scanner les pass
          donneurs.
        </Text>
      </View>
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
        <SafeAreaView
          style={[styles.overlay, { paddingBottom: tabBarHeight }]}
          edges={["top"]}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={goBack}
              style={styles.headerBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scanner le Pass</Text>
            <TouchableOpacity
              onPress={() => setFlashOn(!flashOn)}
              style={styles.headerBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={flashOn ? "flash" : "flash-off"}
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* ── Zone de viseur ── */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>

          {/* ── Instructions ── */}
          <View style={styles.instructions}>
            <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
            <Text style={styles.instructionText}>
              Placez le QR Code du donneur dans le cadre
            </Text>
          </View>
        </SafeAreaView>
      </CameraView>

      {/* ── Modal succès ── */}
      <Modal visible={!!successData} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.successCard, { paddingBottom: 24 + tabBarHeight }]}>
            <View style={styles.successIconWrap}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.success}
              />
            </View>
            <Text style={styles.successTitle}>Don validé ! 🩸</Text>
            <Text style={styles.successSub}>
              Le don a été enregistré et les points ont été crédités au donneur.
            </Text>

            <View style={styles.donorInfoRow}>
              <Ionicons name="person-outline" size={16} color={colors.white} />
              <Text style={styles.donorInfoText}>
                {successData?.donation?.donor?.firstName}{" "}
                {successData?.donation?.donor?.lastName} —{" "}
                {successData?.donation?.bloodType?.replace("_", "")}
              </Text>
            </View>

            <View style={styles.pointsRow}>
              <Text style={styles.pointsLabel}>Points Jambaar crédités</Text>
              <Text style={styles.pointsValue}>
                +{successData?.jambaar?.pointsAwarded} pts
              </Text>
            </View>

            {successData?.jambaar?.gradeChanged && (
              <View style={styles.gradeBanner}>
                <Ionicons name="trophy" size={16} color={colors.amber} />
                <Text style={styles.gradeText}>
                  Nouveau grade : {successData?.jambaar?.newGrade} !
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={handleRescan}
              activeOpacity={0.8}
            >
              <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
              <Text style={styles.rescanBtnText}>Scanner un autre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
