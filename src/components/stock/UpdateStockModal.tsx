import React from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { BloodType } from "@/src/types/shared.types";
import { BLOOD_TYPES_CONFIG } from "@/src/constants/stockScreen";

interface UpdateStockModalProps {
  visible: boolean;
  selectedBloodType: BloodType | null;
  inputQuantity: string;
  onChangeQuantity: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isUpdating: boolean;
}

export function UpdateStockModal({
  visible,
  selectedBloodType,
  inputQuantity,
  onChangeQuantity,
  onCancel,
  onConfirm,
  isUpdating,
}: UpdateStockModalProps) {
  const colors = useColors();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const styles = useThemedStyles((c) => ({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.85)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: c.cardBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 24,
      paddingTop: 16,
      gap: 14,
      alignItems: "center",
    },
    pullBar: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.textSubtle,
      marginBottom: 6,
    },
    modalTitle: { color: c.white, fontSize: 17, fontWeight: "800" },
    modalBloodBadge: {
      backgroundColor: c.red + "12",
      borderWidth: 0.5,
      borderColor: c.red + "30",
      paddingHorizontal: 18,
      paddingVertical: 7,
      borderRadius: 10,
    },
    modalBloodText: { color: c.red, fontSize: 22, fontWeight: "900" },
    modalLabel: {
      color: c.textMuted,
      fontSize: 13,
      fontWeight: "600",
      alignSelf: "flex-start",
    },
    modalInput: {
      backgroundColor: c.inputBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      borderRadius: 13,
      padding: 16,
      color: c.white,
      fontSize: 20,
      fontWeight: "700",
      width: "100%",
      textAlign: "center",
    },
    modalActions: { flexDirection: "row", gap: 10, width: "100%", marginTop: 4 },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 13,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      alignItems: "center",
    },
    cancelBtnText: { color: c.textMuted, fontSize: 14, fontWeight: "700" },
    confirmBtn: {
      flex: 1,
      backgroundColor: c.red,
      paddingVertical: 14,
      borderRadius: 13,
      alignItems: "center",
    },
    confirmBtnText: { color: c.white, fontSize: 14, fontWeight: "700" },
    btnDisabled: { opacity: 0.5 },
  }));

  const selectedLabel = BLOOD_TYPES_CONFIG.find(
    (b) => b.value === selectedBloodType,
  )?.label;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            { paddingBottom: Math.max(24, tabBarHeight + insets.bottom) },
          ]}
        >
          <View style={styles.pullBar} />
          <Text style={styles.modalTitle}>Mettre à jour le stock</Text>
          <View style={styles.modalBloodBadge}>
            <Text style={styles.modalBloodText}>{selectedLabel}</Text>
          </View>
          <Text style={styles.modalLabel}>Nombre de poches disponibles</Text>
          <TextInput
            style={styles.modalInput}
            keyboardType="number-pad"
            value={inputQuantity}
            onChangeText={onChangeQuantity}
            maxLength={3}
            selectTextOnFocus
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, isUpdating && styles.btnDisabled]}
              onPress={onConfirm}
              disabled={isUpdating}
              activeOpacity={0.8}
            >
              {isUpdating ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}