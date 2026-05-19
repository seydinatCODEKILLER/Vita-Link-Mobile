import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/src/components/ui/FormInput";
import { useResendOtp } from "@/src/hooks/useAuth";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.13)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.40)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "rgba(255,255,255,0.05)",
  cardBorder: "rgba(255,255,255,0.09)",
  success: "#22C55E",
} as const;

// ─── Schema ────────────────────────────────────────────────────
const reconnectSchema = z.object({
  email: z.string().email("Adresse email invalide"),
});

type ReconnectValues = z.infer<typeof reconnectSchema>;

// ─── Écran principal ───────────────────────────────────────────
export default function ReconnectDonorScreen() {
  const router = useRouter();
  const { mutateAsync: sendOtp, isPending } = useResendOtp();

  // ── Animations ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Form ──
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ReconnectValues>({
    resolver: zodResolver(reconnectSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ReconnectValues) => {
    Keyboard.dismiss();
    try {
      // Envoie l'OTP via l'API existante
      await sendOtp(values.email);

      // Redirige vers l'écran de vérification OTP en passant juste l'email
      router.push({
        pathname: "/(auth)/otp-verify",
        params: {
          email: values.email,
          // On passe des params vides pour les autres car c'est une reco, pas une inscription
          phone: "",
          firstName: "",
          lastName: "",
          bloodType: "",
          gender: "",
          dateOfBirth: "",
        },
      });
    } catch {
      // L'erreur est déjà gérée par le Toast dans le hook useResendOtp
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Halos décoratifs */}
        <View style={styles.haloBottomLeft} />
        <View style={styles.haloTopRight} />

        <SafeAreaView style={styles.safeArea}>
          {/* ── Back ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={COLORS.white} />
          </TouchableOpacity>

          {/* ── Corps ── */}
          <Animated.View
            style={[
              styles.body,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.headerBlock}>
              <View style={styles.iconWrap}>
                <Ionicons name="mail-outline" size={28} color={COLORS.red} />
              </View>
              <View style={styles.titleBlock}>
                <Text style={styles.title}>Bon retour Jambaar 👋</Text>
                <Text style={styles.subtitle}>
                  Entrez l’email de votre compte pour recevoir un code de
                  connexion sécurisé.
                </Text>
              </View>
            </View>

            {/* ── Formulaire ── */}
            <View style={styles.formBlock}>
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Adresse email"
                    icon="mail-outline"
                    placeholder="votre@email.com"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
            </View>

            {/* Info sécurité */}
            <View style={styles.infoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.infoText}>
                Pas besoin de mot de passe. Un code à 6 chiffres sera envoyé
                pour vérifier votre identité.
              </Text>
            </View>

            {/* ── CTA ── */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
              style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>Recevoir mon code</Text>
                  <View style={styles.ctaBtnIcon}>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={COLORS.white}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1, paddingHorizontal: 24 },

  // ── Halos ──
  haloBottomLeft: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.redGlow,
  },
  haloTopRight: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(220,30,30,0.07)",
  },

  // ── Back ──
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 32,
  },

  // ── Body ──
  body: { flex: 1 },

  // ── Header ──
  headerBlock: {
    marginBottom: 32,
    gap: 20,
    alignItems: "center",
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(220,30,30,0.10)",
    borderWidth: 1,
    borderColor: "rgba(220,30,30,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    gap: 8,
    alignItems: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    paddingHorizontal: 16,
  },

  // ── Formulaire ──
  formBlock: {
    marginBottom: 16,
  },

  // ── Info Card ──
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(34,197,94,0.07)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    padding: 14,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    color: "rgba(34,197,94,0.70)",
    fontSize: 12,
    lineHeight: 18,
  },

  // ── CTA ──
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.red,
    borderRadius: 16,
    paddingVertical: 17,
  },
  ctaBtnDisabled: { opacity: 0.5 },
  ctaBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  ctaBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
