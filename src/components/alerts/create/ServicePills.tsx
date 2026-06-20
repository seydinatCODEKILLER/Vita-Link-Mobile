import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { AppColors } from "@/src/theme/colors";
import { SERVICE_UNITS } from "@/src/constants/createAlertForm";

interface ServicePillsProps {
  value?: string;
  onChange: (v: string) => void;
  colors: AppColors;
}

export function ServicePills({ value, onChange, colors }: ServicePillsProps) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {SERVICE_UNITS.map((s) => {
        const selected = value === s.value;
        return (
          <TouchableOpacity
            key={s.value}
            onPress={() => {
              onChange(s.value);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              backgroundColor: selected
                ? "rgba(220,30,30,0.10)"
                : colors.cardBg,
              borderColor: selected
                ? "rgba(220,30,30,0.30)"
                : colors.cardBorder,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selected ? colors.red : colors.textMuted,
              }}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
