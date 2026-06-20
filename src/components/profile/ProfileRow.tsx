import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppColors } from "@/src/theme/colors";

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string | null;
  valueColor?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: AppColors;
}

export function ProfileRow({
  icon,
  label,
  value,
  valueColor,
  onPress,
  rightElement,
  colors,
}: ProfileRowProps) {
  const rowColor = valueColor ?? colors.textMuted;

  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 11,
        padding: 13,
        minHeight: 50,
      }}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
      disabled={!onPress}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: valueColor ? valueColor + "14" : colors.cardBorder,
        }}
      >
        <Ionicons name={icon} size={17} color={rowColor} />
      </View>

      <Text
        style={{
          flex: 1,
          color: colors.white,
          fontSize: 14,
          fontWeight: "500",
        }}
      >
        {label}
      </Text>

      {value && (
        <Text
          style={{
            color: rowColor,
            fontSize: 13,
            fontWeight: "600",
            marginRight: 2,
            maxWidth: 130,
          }}
          numberOfLines={1}
        >
          {value}
        </Text>
      )}

      {rightElement}
      {onPress && !rightElement && (
        <Ionicons name="chevron-forward" size={14} color={colors.textSubtle} />
      )}
    </TouchableOpacity>
  );
}
