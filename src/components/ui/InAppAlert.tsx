import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { InAppAlertData } from "@/src/store/alerts.store"; // ✅ MODIFIÉ : Import depuis le store

const COLORS = {
  bg: "#1A1A1A",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.55)",
  border: "rgba(255,255,255,0.10)",
  vital: "#DC1E1E",
  standard: "#1D9E75",
} as const;

const AUTO_DISMISS_MS = 5000;

interface InAppAlertProps {
  notification: InAppAlertData; // ✅ MODIFIÉ : Utilise le type du store
  onDismiss: () => void;
}

export function InAppAlert({ notification, onDismiss }: InAppAlertProps) {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-120)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;

  const isVital =
    notification.data?.urgencyLevel === "VITAL" ||
    notification.title?.includes("URGENCE");

  // ── Animation entrée + barre de progression + sortie auto ──
  useEffect(() => {
    // Vibrer à la réception
    Vibration.vibrate(isVital ? [0, 300, 100, 300] : [0, 200]);

    // Slide-in
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Barre de progression qui se vide
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: AUTO_DISMISS_MS,
      useNativeDriver: false, // width ne supporte pas native driver
    }).start();

    // Auto-dismiss
    const timer = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const handlePress = () => {
    const alertId = notification.data?.alertId;
    if (alertId) {
      dismiss();
      router.push(`/(donor)/alerts/${alertId}` as any);
    } else {
      dismiss();
    }
  };

  const accentColor = isVital ? COLORS.vital : COLORS.standard;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          borderLeftColor: accentColor,
        },
      ]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={styles.inner}
      >
        {/* Icône */}
        <View
          style={[styles.iconWrap, { backgroundColor: accentColor + "20" }]}
        >
          <Ionicons
            name={isVital ? "alert-circle" : "heart"}
            size={20}
            color={accentColor}
          />
        </View>

        {/* Texte */}
        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        {/* Bouton fermer */}
        <TouchableOpacity
          onPress={dismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Barre de progression */}
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: accentColor,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 9999,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  body: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  closeBtn: {
    padding: 4,
    flexShrink: 0,
  },
  progressBar: {
    height: 2,
    alignSelf: "flex-start",
  },
});
