import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
  variant: "primary" | "secondary";
}

export function ActionButton({
  icon,
  label,
  sublabel,
  onPress,
  variant,
}: ActionButtonProps) {
  const colors = useColors(); // ← Autonome
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 13,
        borderRadius: 16,
        padding: 15,
        backgroundColor: isPrimary ? colors.red : colors.cardBg,
        borderWidth: isPrimary ? 0 : 0.5,
        borderColor: isPrimary ? "transparent" : colors.cardBorder,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: isPrimary
            ? "rgba(255,255,255,0.15)"
            : colors.cardBorder,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary ? "#FFFFFF" : colors.red}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isPrimary ? "#FFFFFF" : colors.white,
            fontSize: 14,
            fontWeight: "600",
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: isPrimary ? "rgba(255,255,255,0.55)" : colors.textMuted,
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {sublabel}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={15}
        color={isPrimary ? "rgba(255,255,255,0.55)" : colors.textMuted}
      />
    </TouchableOpacity>
  );
}
