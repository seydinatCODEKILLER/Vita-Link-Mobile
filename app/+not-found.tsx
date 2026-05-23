import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

export default function NotFound() {
  const router = useRouter();
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      position: "relative",
      overflow: "hidden",
    },
    // Gros 404 fantôme en arrière-plan
    ghostTextBg: {
      position: "absolute",
      inset: 0, // Remplace top/right/bottom/left: 0
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.03,
    },
    ghostText: {
      fontSize: 200,
      fontWeight: "900",
      color: c.red,
      lineHeight: 220,
    },
    // Contenu principal
    content: {
      alignItems: "center",
      gap: 24,
      position: "relative",
      zIndex: 10,
    },
    // Branding
    branding: {
      alignItems: "center",
      gap: 16,
      marginBottom: 32,
    },
    logoWrap: {
      width: 80,
      height: 80,
      backgroundColor: c.red + "18",
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    logoEmoji: { fontSize: 40 },
    brandText: {
      fontSize: 28,
      fontWeight: "700",
      color: c.white,
      letterSpacing: -0.5,
    },
    // Erreur
    errorBlock: {
      alignItems: "center",
      gap: 12,
    },
    errorBigText: {
      fontSize: 60,
      fontWeight: "900",
      color: c.red,
      letterSpacing: -2,
      lineHeight: 64,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: c.white,
      letterSpacing: -0.3,
    },
    errorSub: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: "center",
      lineHeight: 22,
      maxWidth: 280,
    },
    // Bouton
    ctaBtn: {
      marginTop: 16,
      width: "100%",
      maxWidth: 260,
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      overflow: "hidden",
      shadowColor: c.red,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
    ctaBtnText: {
      color: c.white,
      fontWeight: "800",
      fontSize: 16,
      letterSpacing: 0.5,
    },
  }));

  return (
    <View style={styles.container}>
      {/* ─── Effet de profondeur : Gros 404 fantôme en arrière-plan ─── */}
      <View style={styles.ghostTextBg}>
        <Text style={styles.ghostText}>404</Text>
      </View>

      {/* ─── Contenu principal ─── */}
      <View style={styles.content}>
        {/* Branding (Identique au SplashScreen pour la continuité) */}
        <View style={styles.branding}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoEmoji}>🩸</Text>
          </View>
          <Text style={styles.brandText}>
            Vita<Text style={{ color: colors.red }}>Link</Text>
          </Text>
        </View>

        {/* Message d'erreur */}
        <View style={styles.errorBlock}>
          <Text style={styles.errorBigText}>404</Text>
          <Text style={styles.errorTitle}>Oups, page introuvable</Text>
          <Text style={styles.errorSub}>
            Il semblerait que la page que vous cherchez n’existe pas ou ait été
            déplacée.
          </Text>
        </View>

        {/* Bouton d'action Premium */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.8}
          style={styles.ctaBtn}
        >
          <Ionicons name="home-outline" size={22} color={colors.white} />
          <Text style={styles.ctaBtnText}>Retour à l’accueil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
