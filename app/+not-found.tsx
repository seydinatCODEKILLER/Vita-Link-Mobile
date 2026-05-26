import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export default function NotFound() {
  const router = useRouter();
  const colors = useColors();

  // Animations douces
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const dotsOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Animation d'entrée douce
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation subtile des points décoratifs
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsOpacity, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    // Points décoratifs minimalistes
    dots: {
      position: "absolute",
      top: 80,
      right: 40,
      flexDirection: "row",
      gap: 6,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.red,
    },
    // Contenu principal
    content: {
      alignItems: "center",
      gap: 32,
      width: "100%",
    },
    // Code 404 minimaliste
    errorCode: {
      fontSize: 72,
      fontWeight: "300",
      color: c.white,
      letterSpacing: -2,
      opacity: 0.9,
    },
    // Séparateur élégant
    divider: {
      width: 40,
      height: 2,
      borderRadius: 1,
      backgroundColor: c.red + "40",
      marginVertical: 4,
    },
    // Message
    messageContainer: {
      alignItems: "center",
      gap: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "500",
      color: c.white,
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
      fontWeight: "400",
    },
    // Bouton minimaliste
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 100,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: c.cardBorder + "60",
    },
    buttonText: {
      fontSize: 14,
      fontWeight: "500",
      color: c.white,
      letterSpacing: 0.2,
    },
    // Navigation secondaire
    secondaryNav: {
      flexDirection: "row",
      gap: 24,
      marginTop: 8,
    },
    navLink: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    navLinkText: {
      fontSize: 13,
      color: c.textMuted,
      fontWeight: "400",
    },
  }));

  return (
    <View style={styles.container}>
      {/* Points décoratifs animés */}
      <Animated.View style={[styles.dots, { opacity: dotsOpacity }]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>

      {/* Contenu principal */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Code 404 */}
        <Text style={styles.errorCode}>404</Text>

        {/* Séparateur */}
        <View style={styles.divider} />

        {/* Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.title}>Page introuvable</Text>
          <Text style={styles.description}>
            Cette page n&apos;existe pas ou a été déplacée.
          </Text>
        </View>

        {/* Bouton principal */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.7}
          style={styles.button}
        >
          <Ionicons name="arrow-back" size={16} color={colors.white} />
          <Text style={styles.buttonText}>Retour à l&apos;accueil</Text>
        </TouchableOpacity>

        {/* Navigation secondaire */}
        <View style={styles.secondaryNav}>
          <TouchableOpacity
            onPress={() => router.replace("/(health)/alerts")}
            style={styles.navLink}
            activeOpacity={0.5}
          >
            <Text style={styles.navLinkText}>Alertes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(health)/profile")}
            style={styles.navLink}
            activeOpacity={0.5}
          >
            <Text style={styles.navLinkText}>Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.replace("/(health)/stock")}
            style={styles.navLink}
            activeOpacity={0.5}
          >
            <Text style={styles.navLinkText}>Stock</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
