import { View, Text, Pressable } from "react-native";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useThemedStyles } from "@/src/theme/useTheme";

interface NetworkErrorScreenProps {
  onRetry?: () => void;
  message?: string;
}

export const NetworkErrorScreen = ({
  onRetry,
  message = "Vérifiez votre connexion internet et réessayez.",
}: NetworkErrorScreenProps) => {
  const queryClient = useQueryClient();
  const [isRetrying, setIsRetrying] = useState(false);

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
      gap: 16,
      backgroundColor: c.bg,
    },
    icon: { fontSize: 56 },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: c.white,
      textAlign: "center",
    },
    message: {
      fontSize: 15,
      color: c.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
    button: {
      marginTop: 8,
      backgroundColor: c.red,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 12,
    },
    buttonPressed: { opacity: 0.8 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  }));

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await queryClient.invalidateQueries();
      onRetry?.();
    } finally {
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [queryClient, onRetry]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.title}>Pas de connexion</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isRetrying && styles.buttonDisabled,
        ]}
        onPress={handleRetry}
        disabled={isRetrying}
      >
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
