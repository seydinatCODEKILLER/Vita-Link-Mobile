import React from "react";
import { View, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";

interface HeroOrbProps {
  pulseAnim: Animated.Value;
  ring2Anim: Animated.Value;
}

export function HeroOrb({ pulseAnim, ring2Anim }: HeroOrbProps) {
  const colors = useColors(); // ← Autonome

  return (
    <View
      style={{
        width: 176,
        height: 176,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 26,
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: 176,
          height: 176,
          borderRadius: 88,
          borderWidth: 1,
          borderColor: colors.red + "24",
          transform: [{ scale: pulseAnim }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: 134,
          height: 134,
          borderRadius: 67,
          borderWidth: 1,
          borderColor: colors.red + "33",
          transform: [{ scale: ring2Anim }],
        }}
      />
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 1,
          borderColor: colors.red + "52",
          backgroundColor: colors.red + "17",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={40} color={colors.red} />
      </View>
    </View>
  );
}
