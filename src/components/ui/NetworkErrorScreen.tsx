import { View, Text, Pressable, Animated } from "react-native";
import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface NetworkErrorScreenProps {
  onRetry?: () => void;
  message?: string;
}

const TIPS = [
  {
    icon: "wifi-outline" as const,
    text: "Activez le Wi-Fi ou les données mobiles",
  },
  {
    icon: "refresh-outline" as const,
    text: "Rechargez si le problème persiste",
  },
] satisfies { icon: string; text: string }[];

export const NetworkErrorScreen = ({
  onRetry,
  message = "Vérifiez votre connexion internet et réessayez.",
}: NetworkErrorScreenProps) => {
  const queryClient = useQueryClient();
  const colors = useColors();
  const [isRetrying, setIsRetrying] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      backgroundColor: c.bg,
    },
    // ── Icon ──
    iconRing: {
      width: 96,
      height: 96,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: c.red + "1E",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    iconWrap: {
      width: 80,
      height: 80,
      borderRadius: 22,
      backgroundColor: c.red + "1A",
      borderWidth: 0.5,
      borderColor: c.red + "38",
      alignItems: "center",
      justifyContent: "center",
    },
    // ── Text ──
    title: {
      color: c.white,
      fontSize: 20,
      fontWeight: "700",
      letterSpacing: -0.3,
      textAlign: "center",
      marginTop: 24,
      marginBottom: 8,
    },
    message: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 240,
      marginBottom: 24,
    },
    // ── Tips ──
    tipsContainer: {
      width: "100%",
      gap: 8,
      marginBottom: 28,
    },
    tip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.cardBg,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      borderRadius: 11,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    tipText: {
      color: c.textMuted,
      fontSize: 12,
      flex: 1,
    },
    // ── Button ──
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      backgroundColor: c.red,
      borderRadius: 14,
      paddingVertical: 15,
    },
    buttonRetrying: {
      backgroundColor: c.red + "80",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
  }));

  const triggerSpinAnimation = useCallback(() => {
    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, [spinAnim]);

  const handleRetry = useCallback(async () => {
    if (isRetrying) return;
    setIsRetrying(true);
    triggerSpinAnimation();
    try {
      await queryClient.invalidateQueries();
      onRetry?.();
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [queryClient, onRetry, isRetrying, triggerSpinAnimation]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Icon */}
      <View style={styles.iconRing}>
        <View style={styles.iconWrap}>
          <Ionicons name="wifi-outline" size={36} color={colors.red} />
        </View>
      </View>

      {/* Text */}
      <Text style={styles.title}>Pas de connexion</Text>
      <Text style={styles.message}>{message}</Text>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        {TIPS.map((tip) => (
          <View key={tip.text} style={styles.tip}>
            <Ionicons name={tip.icon} size={15} color={colors.textMuted} />
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      {/* Button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          isRetrying && styles.buttonRetrying,
          pressed && { opacity: 0.85 },
        ]}
        onPress={handleRetry}
        disabled={isRetrying}
      >
        <Animated.View
          style={{ transform: [{ rotate: isRetrying ? spin : "0deg" }] }}
        >
          <Ionicons name="refresh-outline" size={17} color="#fff" />
        </Animated.View>
        <Text style={styles.buttonText}>
          {isRetrying ? "Reconnexion…" : "Réessayer"}
        </Text>
      </Pressable>
    </View>
  );
};

// ─── Wrapper QueryNetworkGuard ─────────────────────────────────
interface QueryNetworkGuardProps {
  isError: boolean;
  error: unknown;
  children: React.ReactNode;
  onRetry?: () => void;
}

export const QueryNetworkGuard = ({
  isError,
  error,
  children,
  onRetry,
}: QueryNetworkGuardProps) => {
  const isOffline = isError && !(error as any)?.response;

  if (isOffline) {
    return <NetworkErrorScreen onRetry={onRetry} />;
  }

  return <>{children}</>;
};
