import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { AppColors } from "@/src/theme/colors";
import { BLOOD_TYPES } from "@/src/constants/createAlertForm";

interface BloodTypeGridProps {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
  colors: AppColors;
}

export function BloodTypeGrid({
  value,
  onChange,
  error,
  colors,
}: BloodTypeGridProps) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {BLOOD_TYPES.map((bt) => {
          const selected = value === bt.value;
          return (
            <TouchableOpacity
              key={bt.value}
              onPress={() => {
                onChange(bt.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
              style={{
                width: "22%",
                aspectRatio: 1,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                backgroundColor: selected ? colors.red : colors.cardBg,
                borderColor: selected ? colors.red : colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: selected ? "#FFFFFF" : colors.textMuted,
                }}
              >
                {bt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text
          style={{
            color: "#EF4444",
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}
