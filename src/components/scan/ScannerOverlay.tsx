import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useThemedStyles } from "@/src/theme/useTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SCAN_SIZE = SCREEN_WIDTH * 0.7;

interface ScannerOverlayProps {
  tabBarHeight: number;
  flashOn: boolean;
  onToggleFlash: () => void;
  onClose: () => void;
}

export function ScannerOverlay({
  tabBarHeight,
  flashOn,
  onToggleFlash,
  onClose,
}: ScannerOverlayProps) {
  const styles = useThemedStyles((c) => ({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
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
  }));

  return (
    <SafeAreaView
      style={[styles.overlay, { paddingBottom: tabBarHeight }]}
      edges={["top"]}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.headerBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Validation CNTS 🩸</Text>
        <TouchableOpacity
          onPress={onToggleFlash}
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

      {/* ── Viseur ──────────────────────────────────────────────────────────── */}
      <View style={styles.scanArea}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* ── Instructions ────────────────────────────────────────────────────── */}
      <View style={styles.instructions}>
        <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
        <Text style={styles.instructionText}>
          Scannez un Pass Donneur ou un Bon de Commande
        </Text>
      </View>
    </SafeAreaView>
  );
}
