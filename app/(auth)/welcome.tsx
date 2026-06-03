import { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { ThemeToggle } from "@/src/components/ui/ThemeToggle";
import { AppColors } from "@/src/theme/colors";

// ─── Logo ─────────────────────────────────────────────────────
function VitaLinkLogo({ colors }: { colors: AppColors }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
      <View
        style={{
          width: 30,
          height: 30,
          backgroundColor: colors.red,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={14} color="#FFFFFF" />
      </View>
      <Text
        style={{
          color: "#f0e4e4",
          fontSize: 17,
          fontWeight: "700",
          letterSpacing: -0.3,
        }}
      >
        Vita<Text style={{ color: colors.red }}>Link</Text>
      </Text>
    </View>
  );
}

// ─── Bouton d'action ───────────────────────────────────────────
interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  onPress: () => void;
  variant: "primary" | "secondary";
  colors: AppColors;
}

function ActionButton({
  icon,
  label,
  sublabel,
  onPress,
  variant,
  colors,
}: ActionButtonProps) {
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
        backgroundColor: isPrimary ? colors.red : "rgba(255,255,255,0.04)",
        borderWidth: isPrimary ? 0 : 0.5,
        borderColor: "rgba(255,255,255,0.12)",
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: isPrimary
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.08)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary ? "#FFFFFF" : "#e08080"}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isPrimary ? "#FFFFFF" : "#f0e4e4",
            fontSize: 14,
            fontWeight: "600",
            letterSpacing: -0.2,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: isPrimary ? "rgba(255,255,255,0.55)" : "#9b7070",
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
        color={isPrimary ? "rgba(255,255,255,0.55)" : "#9b7070"}
      />
    </TouchableOpacity>
  );
}

// ─── Orbe central avec pulsation ──────────────────────────────
function HeroOrb({
  colors,
  pulseAnim,
  ring2Anim,
}: {
  colors: AppColors;
  pulseAnim: Animated.Value;
  ring2Anim: Animated.Value;
}) {
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
      {/* Anneau extérieur */}
      <Animated.View
        style={{
          position: "absolute",
          width: 176,
          height: 176,
          borderRadius: 88,
          borderWidth: 1,
          borderColor: "rgba(200,20,20,0.14)",
          transform: [{ scale: pulseAnim }],
        }}
      />
      {/* Anneau intermédiaire */}
      <Animated.View
        style={{
          position: "absolute",
          width: 134,
          height: 134,
          borderRadius: 67,
          borderWidth: 1,
          borderColor: "rgba(200,20,20,0.20)",
          transform: [{ scale: ring2Anim }],
        }}
      />
      {/* Noyau */}
      <View
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          borderWidth: 1,
          borderColor: "rgba(200,20,20,0.32)",
          backgroundColor: "rgba(200,20,20,0.09)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="heart" size={40} color={colors.red} />
      </View>
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function WelcomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const isDark = theme === "dark";

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ring2Anim = useRef(new Animated.Value(1)).current;

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0a0808" : "#fff5f5",
    },
    haloTop: {
      position: "absolute",
      top: -80,
      left: -60,
      width: 280,
      height: 260,
      borderRadius: 140,
      backgroundColor: isDark ? "rgba(200,20,20,0.16)" : "rgba(200,20,20,0.06)",
    },
    haloBottom: {
      position: "absolute",
      bottom: 100,
      right: -50,
      width: 220,
      height: 200,
      borderRadius: 110,
      backgroundColor: isDark ? "rgba(180,10,10,0.10)" : "rgba(200,20,20,0.04)",
    },
    safeArea: { flex: 1, paddingHorizontal: 22 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(34,197,94,0.10)",
      borderWidth: 0.5,
      borderColor: "rgba(34,197,94,0.28)",
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: "#22c55e",
    },
    statusText: {
      color: "#22c55e",
      fontSize: 10,
      fontWeight: "500",
      letterSpacing: 0.3,
    },
    heroBlock: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 8,
    },
    eyebrow: {
      color: isDark ? "#9b5c5c" : "#9b5c5c",
      fontSize: 9,
      fontWeight: "600",
      letterSpacing: 3,
      textTransform: "uppercase",
      marginBottom: 10,
      textAlign: "center",
    },
    heroTitle: {
      fontSize: 36,
      fontWeight: "800",
      lineHeight: 40,
      textAlign: "center",
      letterSpacing: -1.5,
      marginBottom: 12,
    },
    heroTitleBase: {
      color: isDark ? "#f0e4e4" : "#1a0a0a",
    },
    heroTitleRed: {
      color: c.red,
    },
    heroSubtitle: {
      color: isDark ? "#c49090" : "#7a4444",
      fontSize: 12.5,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 230,
    },
    heroSubtitleAccent: {
      color: isDark ? "#e08080" : "#9b5050",
    },
    actionsBlock: {
      gap: 10,
      marginBottom: 12,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingVertical: 4,
      marginBottom: 8,
    },
    footerText: {
      color: isDark ? "#a07070" : "#9b7070",
      fontSize: 13,
    },
    footerLink: {
      color: c.red,
      fontSize: 13,
      fontWeight: "500",
    },
    slogan: {
      alignItems: "center",
      paddingBottom: 8,
    },
    sloganText: {
      color: isDark ? "#7a5050" : "#c4a0a0",
      fontSize: 10,
      letterSpacing: 1,
      fontStyle: "italic",
    },
  }));

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btnAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulse2 = Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2Anim, {
          toValue: 1.1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Anim, {
          toValue: 1,
          duration: 1800,
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

  const fadeSlide = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.haloTop} />
      <View style={styles.haloBottom} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, fadeSlide]}>
          <VitaLinkLogo colors={colors} />
          <View style={styles.headerRight}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Opérationnel</Text>
            </View>
            <ThemeToggle size={34} />
          </View>
        </Animated.View>

        {/* ── Hero ── */}
        <Animated.View style={[styles.heroBlock, fadeSlide]}>
          <HeroOrb
            colors={colors}
            pulseAnim={pulseAnim}
            ring2Anim={ring2Anim}
          />

          <Text style={styles.eyebrow}>Plateforme d&apos;urgence médicale</Text>

          <Text style={styles.heroTitle}>
            <Text style={styles.heroTitleBase}>Le lien qui{"\n"}</Text>
            <Text style={styles.heroTitleRed}>sauve des vies.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Gérez alertes sanguines et stocks en temps réel pour{" "}
            <Text style={styles.heroSubtitleAccent}>structures de santé</Text>{" "}
            au Sénégal.
          </Text>
        </Animated.View>

        {/* ── Actions ── */}
        <Animated.View style={[styles.actionsBlock, { opacity: btnAnim }]}>
          <ActionButton
            icon="business"
            label="Je suis un hôpital"
            sublabel="Inscription structure de soin"
            onPress={() => router.push("/register-hospital")}
            variant="primary"
            colors={colors}
          />
          <ActionButton
            icon="water-outline"
            label="Je suis la CNTS"
            sublabel="Centre National de Transfusion"
            onPress={() => router.push("/register-cnts")}
            variant="secondary"
            colors={colors}
          />
        </Animated.View>

        {/* ── Footer ── */}
        <Animated.View style={[styles.footer, { opacity: btnAnim }]}>
          <Text style={styles.footerText}>Déjà membre ?</Text>
          <TouchableOpacity
            onPress={() => router.push("/login")}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={styles.footerLink}>Se connecter</Text>
            <Ionicons
              name="arrow-forward-circle"
              size={16}
              color={colors.red}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Slogan ── */}
        <Animated.View style={[styles.slogan, { opacity: btnAnim }]}>
          <Text style={styles.sloganText}>
            L&apos;honneur qui engage, le lien qui sauve.
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
