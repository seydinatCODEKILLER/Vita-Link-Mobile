import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/src/store/auth.store";

export default function UnauthorizedScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const logout = useAuthStore((s) => s.logout);
  const isDark = theme === "dark";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0a0808" : "#fff5f5",
    },
    haloTop: {
      position: "absolute",
      top: -80,
      left: -60,
      width: 260,
      height: 220,
      borderRadius: 130,
      backgroundColor: isDark ? "rgba(200,20,20,0.10)" : "rgba(200,20,20,0.05)",
    },
    haloBottom: {
      position: "absolute",
      bottom: -60,
      right: -50,
      width: 200,
      height: 180,
      borderRadius: 100,
      backgroundColor: isDark ? "rgba(200,20,20,0.06)" : "rgba(200,20,20,0.03)",
    },
    safeArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    ring1: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 1,
      borderColor: "rgba(200,20,20,0.15)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 32,
    },
    ring2: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 1,
      borderColor: "rgba(200,20,20,0.22)",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrap: {
      width: 62,
      height: 62,
      borderRadius: 18,
      backgroundColor: "rgba(200,20,20,0.10)",
      borderWidth: 1,
      borderColor: "rgba(200,20,20,0.28)",
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: {
      alignItems: "center",
      gap: 10,
      marginBottom: 40,
    },
    eyebrow: {
      color: isDark ? "#6b4040" : "#9b7070",
      fontSize: 10,
      fontWeight: "600",
      letterSpacing: 2.5,
      textTransform: "uppercase",
    },
    title: {
      color: isDark ? "#f0e4e4" : "#1a0a0a",
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
      letterSpacing: -0.6,
      lineHeight: 28,
    },
    divider: {
      width: 32,
      height: 1,
      backgroundColor: "rgba(200,20,20,0.25)",
    },
    subtitle: {
      color: isDark ? "#7a4a4a" : "#9b6060",
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 260,
    },
    actionsBlock: {
      width: "100%",
      gap: 10,
    },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 16,
    },
    primaryBtnText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    secondaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
      borderRadius: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    },
    secondaryBtnText: {
      color: isDark ? "#a07070" : "#7a5050",
      fontSize: 14,
      fontWeight: "500",
    },
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 9,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(auth)/welcome");
    }
  };

  const handleLogout = async () => {
    await logout("unauthorized");
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={{
            alignItems: "center",
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Orbe */}
          <View style={styles.ring1}>
            <View style={styles.ring2}>
              <View style={styles.iconWrap}>
                <Ionicons name="lock-closed" size={28} color={colors.red} />
              </View>
            </View>
          </View>

          {/* Texte */}
          <View style={styles.textBlock}>
            <Text style={styles.eyebrow}>Accès refusé</Text>
            <Text style={styles.title}>
              Vous n&apos;êtes pas{"\n"}autorisé ici
            </Text>
            <View style={styles.divider} />
            <Text style={styles.subtitle}>
              Cette section est réservée à d&apos;autres rôles. Revenez en
              arrière ou déconnectez-vous pour changer de compte.
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsBlock}>
            <TouchableOpacity
              onPress={handleGoBack}
              activeOpacity={0.82}
              style={styles.primaryBtn}
            >
              <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Retour</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.75}
              style={styles.secondaryBtn}
            >
              <Ionicons
                name="log-out-outline"
                size={17}
                color={isDark ? "#a07070" : "#7a5050"}
              />
              <Text style={styles.secondaryBtnText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
