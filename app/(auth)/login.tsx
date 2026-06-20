import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Controller } from "react-hook-form";

import { FormInput } from "@/src/components/ui/FormInput";
import { useLoginScreen } from "@/src/hooks/useLoginScreen";
import { useLoginStyles } from "@/src/hooks/useLoginStyles";
import { useColors } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";

export default function LoginScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);

  const { control, handleSubmit, onSubmit, isPending, fadeAnim, slideAnim } =
    useLoginScreen();

  const { styles } = useLoginStyles();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style={theme === "dark" ? "light" : "dark"} />

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
            <Ionicons name="arrow-back" size={19} color={colors.white} />
          </TouchableOpacity>

          {/* ── Corps ── */}
          <Animated.View
            style={[
              styles.body,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Header : logo + titre */}
            <View style={styles.headerBlock}>
              <View style={styles.proBadgeRow}>
                <View style={styles.proIconWrap}>
                  <Ionicons name="business" size={20} color={colors.white} />
                </View>
                <View style={styles.proBadgeText}>
                  <Text style={styles.proEyebrow}>ESPACE PROFESSIONNEL</Text>
                  <Text style={styles.proTitle}>
                    Vita<Text style={{ color: colors.red }}>Link</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.titleBlock}>
                <Text style={styles.title}>Bon retour 👋</Text>
                <Text style={styles.subtitle}>
                  Connectez-vous à votre espace structure de santé
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
                    placeholder="directeur@hopital.sn"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Mot de passe"
                    icon="lock-closed-outline"
                    placeholder="••••••••"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    isPassword
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />

              {/* Mot de passe oublié */}
              <TouchableOpacity
                style={styles.forgotRow}
                activeOpacity={0.7}
                onPress={() => {
                  // TODO: implémenter la réinitialisation
                }}
              >
                <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>

            {/* ── CTA ── */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
              style={[styles.ctaBtn, isPending && styles.ctaBtnDisabled]}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.ctaBtnText}>Se connecter</Text>
                  <View style={styles.ctaBtnIcon}>
                    <Ionicons
                      name="arrow-forward"
                      size={17}
                      color={colors.white}
                    />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* ── Info sécurité ── */}
          <View style={styles.securityRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={colors.textSubtle}
            />
            <Text style={styles.securityText}>
              Connexion sécurisée · Données chiffrées
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
}
