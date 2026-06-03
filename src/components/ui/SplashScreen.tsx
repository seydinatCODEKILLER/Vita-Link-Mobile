import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

function LoadingDots({ color }: { color: string }) {
  const anims = [
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
    useRef(new Animated.Value(0.2)).current,
  ];

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: color,
            opacity: anim,
            transform: [{ scale: anim }],
          }}
        />
      ))}
    </View>
  );
}

export function SplashScreen() {
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(ring2Anim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Anim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    pulse2.start();
    return () => {
      pulse.stop();
      pulse2.stop();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0a0808" : "#fff5f5",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Halos */}
      <View
        style={{
          position: "absolute",
          top: -80,
          left: -60,
          width: 260,
          height: 220,
          borderRadius: 130,
          backgroundColor: isDark
            ? "rgba(200,20,20,0.12)"
            : "rgba(200,20,20,0.06)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -60,
          right: -50,
          width: 200,
          height: 180,
          borderRadius: 100,
          backgroundColor: isDark
            ? "rgba(200,20,20,0.07)"
            : "rgba(200,20,20,0.04)",
        }}
      />

      <Animated.View style={{ alignItems: "center", opacity: fadeAnim }}>
        {/* Orbe */}
        <View
          style={{
            width: 120,
            height: 120,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 1,
              borderColor: "rgba(200,20,20,0.12)",
              transform: [{ scale: pulseAnim }],
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              width: 92,
              height: 92,
              borderRadius: 46,
              borderWidth: 1,
              borderColor: "rgba(200,20,20,0.18)",
              transform: [{ scale: ring2Anim }],
            }}
          />
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: 18,
              backgroundColor: colors.red,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="water" size={30} color="#FFFFFF" />
          </View>
        </View>

        {/* Nom */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            letterSpacing: -0.8,
            color: isDark ? "#f0e4e4" : "#1a0a0a",
            marginBottom: 8,
          }}
        >
          Vita<Text style={{ color: colors.red }}>Link</Text>
        </Text>

        {/* Tagline */}
        <Text
          style={{
            color: isDark ? "#5a3535" : "#9b7070",
            fontSize: 11,
            letterSpacing: 1.5,
            fontWeight: "500",
            marginBottom: 36,
          }}
        >
          L&apos;HONNEUR QUI ENGAGE
        </Text>

        {/* Loader */}
        <LoadingDots color={colors.red} />
      </Animated.View>
    </View>
  );
}
