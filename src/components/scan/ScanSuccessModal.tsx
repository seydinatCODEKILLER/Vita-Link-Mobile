import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { BLOOD_TYPE_LABELS } from "@/src/utils/format.utils";
import { ScanMode } from "@/src/hooks/useQrScanner";

interface ScanSuccessModalProps {
  visible: boolean;
  scanMode: ScanMode | null;
  successData: any;
  tabBarHeight: number;
  onRescan: () => void;
}

export function ScanSuccessModal({
  visible,
  scanMode,
  successData,
  tabBarHeight,
  onRescan,
}: ScanSuccessModalProps) {
  const colors = useColors();
  const styles = useThemedStyles((c) => ({
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
    hospitalRow: {
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
    hospitalText: { color: c.white, fontSize: 14, fontWeight: "700" },
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

  const isDonation = scanMode === "DONATION";

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[styles.successCard, { paddingBottom: 24 + tabBarHeight }]}
        >
          <View style={styles.successIconWrap}>
            <Ionicons
              name={isDonation ? "water" : "checkmark-circle"}
              size={48}
              color={isDonation ? colors.red : colors.success}
            />
          </View>

          {isDonation ? (
            <DonationSuccess
              data={successData}
              styles={styles}
              colors={colors}
            />
          ) : (
            <PurchaseOrderSuccess
              data={successData}
              styles={styles}
              colors={colors}
            />
          )}

          <TouchableOpacity
            style={[
              styles.rescanBtn,
              !isDonation && { backgroundColor: colors.success },
            ]}
            onPress={onRescan}
            activeOpacity={0.8}
          >
            <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
            <Text style={styles.rescanBtnText}>Scanner un autre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Variante : succès donation ─────────────────────────────────────────────
function DonationSuccess({
  data,
  styles,
  colors,
}: {
  data: any;
  styles: any;
  colors: any;
}) {
  return (
    <>
      <Text style={styles.successTitle}>Don validé ! 🩸</Text>
      <Text style={styles.successSub}>
        Le don a été enregistré, le stock a été mis à jour et les points ont été
        crédités au donneur.
      </Text>

      <View style={styles.donorInfoRow}>
        <Ionicons name="person-outline" size={16} color={colors.white} />
        <Text style={styles.donorInfoText}>
          {data?.donation?.donor?.firstName} {data?.donation?.donor?.lastName} —{" "}
          {data?.donation?.bloodType?.replace("_", "")}
        </Text>
      </View>

      <View style={styles.pointsRow}>
        <Text style={styles.pointsLabel}>Points Jambaar crédités</Text>
        <Text style={styles.pointsValue}>
          +{data?.jambaar?.pointsAwarded} pts
        </Text>
      </View>

      {data?.jambaar?.gradeChanged && (
        <View style={styles.gradeBanner}>
          <Ionicons name="trophy" size={16} color={colors.amber} />
          <Text style={styles.gradeText}>
            Nouveau grade : {data?.jambaar?.newGrade} !
          </Text>
        </View>
      )}
    </>
  );
}

// ─── Variante : succès bon de commande ──────────────────────────────────────
function PurchaseOrderSuccess({
  data,
  styles,
  colors,
}: {
  data: any;
  styles: any;
  colors: any;
}) {
  return (
    <>
      <Text style={[styles.successTitle, { color: colors.success }]}>
        Bon validé ! 🏥
      </Text>
      <Text style={styles.successSub}>
        Remise du sang confirmée. L&apos;hôpital a été notifié en temps réel.
      </Text>

      <View style={styles.donorInfoRow}>
        <Ionicons name="water-outline" size={16} color={colors.red} />
        <Text style={styles.donorInfoText}>
          {data?.order?.quantity} poche(s) —{" "}
          {BLOOD_TYPE_LABELS[data?.order?.bloodType] ??
            data?.order?.bloodType?.replace("_", " ")}
        </Text>
      </View>

      <View style={styles.hospitalRow}>
        <Ionicons name="business-outline" size={16} color={colors.white} />
        <Text style={styles.hospitalText}>{data?.order?.hospital?.name}</Text>
      </View>

      <View
        style={[
          styles.pointsRow,
          {
            backgroundColor: colors.success + "14",
            borderColor: colors.success + "33",
          },
        ]}
      >
        <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>
          Statut du bon
        </Text>
        <Text style={[styles.pointsValue, { color: colors.success }]}>
          UTILISÉ
        </Text>
      </View>
    </>
  );
}
