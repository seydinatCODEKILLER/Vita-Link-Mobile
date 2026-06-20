import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useColors } from "@/src/theme/useTheme";
import { useAlertDetailStyles } from "@/src/hooks/useAlertDetailStyles";

export function AlertDetailHeader() {
  const router = useRouter();
  const colors = useColors();
  const styles = useAlertDetailStyles();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={19} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Détails Alerte</Text>
      <View style={{ width: 38 }} />
    </View>
  );
}
