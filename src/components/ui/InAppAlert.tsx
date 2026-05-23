import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Vibration,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { InAppAlertData } from "@/src/store/alerts.store";
import { useThemedStyles } from "@/src/theme/useTheme";

// Couleurs sémantiques fixes — indépendantes du thème
const VITAL_COLOR = "#DC1E1E";
const STANDARD_COLOR = "#1D9E75";

const AUTO_DISMISS_MS = 5000;

interface InAppAlertProps {
  notification: InAppAlertData;
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

  const accentColor = isVital ? VITAL_COLOR : STANDARD_COLOR;

  const styles = useThemedStyles((c) => ({
    container: {
      position: "absolute",
      top: 0,
      left: 12,
      right: 12,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.cardBorder,
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
    textBlock: { flex: 1, gap: 2 },
    title: {
      color: c.white,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 0.1,
    },
    body: { color: c.textMuted, fontSize: 12, lineHeight: 17 },
    closeBtn: { padding: 4, flexShrink: 0 },
    progressBar: { height: 2, alignSelf: "flex-start" },
  }));

  useEffect(() => {
    Vibration.vibrate(isVital ? [0, 300, 100, 300] : [0, 200]);

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

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: AUTO_DISMISS_MS,
      useNativeDriver: false,
    }).start();

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
    dismiss();
    if (alertId) router.push(`/(donor)/alerts/${alertId}` as any);
  };

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
        <View
          style={[styles.iconWrap, { backgroundColor: accentColor + "20" }]}
        >
          <Ionicons
            name={isVital ? "alert-circle" : "heart"}
            size={20}
            color={accentColor}
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {notification.body}
          </Text>
        </View>

        <TouchableOpacity
          onPress={dismiss}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={16} color="#ffffff88" />
        </TouchableOpacity>
      </TouchableOpacity>

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
