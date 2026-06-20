import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface RadiusSliderProps {
  value: number;
  onChange: (v: number) => void;
}

export function RadiusSlider({ value, onChange }: RadiusSliderProps) {
  const colors = useColors();
  const styles = useThemedStyles((c) => ({
    sliderCard: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 18,
    },
    sliderHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    sliderTitle: { color: c.white, fontSize: 13, fontWeight: "600", flex: 1 },
    sliderValue: { color: c.amber, fontSize: 16, fontWeight: "800" },
    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: -4,
    },
    sliderHint: { color: c.textSubtle, fontSize: 10, fontWeight: "600" },
  }));

  return (
    <View style={styles.sliderCard}>
      <View style={styles.sliderHeader}>
        <Ionicons name="locate-outline" size={16} color={colors.amber} />
        <Text style={styles.sliderTitle}>Rayon de recherche</Text>
        <Text style={styles.sliderValue}>{value} km</Text>
      </View>
      <Slider
        style={{ width: "100%", height: 40 }}
        minimumValue={1}
        maximumValue={50}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.red}
        maximumTrackTintColor={colors.cardBorder}
        thumbTintColor={colors.red}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderHint}>1 km</Text>
        <Text style={styles.sliderHint}>50 km</Text>
      </View>
    </View>
  );
}
