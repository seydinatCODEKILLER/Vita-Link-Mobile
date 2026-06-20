import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AppColors } from "@/src/theme/colors";
import { URGENCY_LEVELS } from "@/src/constants/createAlertForm";

interface UrgencySelectorProps {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
  colors: AppColors;
}

export function UrgencySelector({
  value,
  onChange,
  error,
  colors,
}: UrgencySelectorProps) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {URGENCY_LEVELS.map((u) => {
          const selected = value === u.value;
          const isVital = u.value === "VITAL";
          const accentColor = isVital ? colors.red : colors.amber;
          return (
            <TouchableOpacity
              key={u.value}
              onPress={() => {
                onChange(u.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                backgroundColor: selected ? accentColor + "1A" : colors.inputBg,
                borderColor: selected ? accentColor + "4D" : colors.cardBorder,
              }}
            >
              <Ionicons
                name={u.icon}
                size={18}
                color={selected ? accentColor : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: selected ? accentColor : colors.textMuted,
                }}
              >
                {u.label}
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
