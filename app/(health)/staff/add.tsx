import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs"; // <-- AJOUT ICI
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/src/components/ui/FormInput";
import { healthStructuresApi } from "@/src/api/healthStructures.api";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/src/constants/query_key";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.07)",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.40)",
  textSubtle: "rgba(255,255,255,0.18)",
  success: "#22C55E",
  amber: "#FAC775",
} as const;

// ─── Schéma Zod ────────────────────────────────────────────────
const addStaffSchema = z.object({
  firstName: z.string().min(2, "Min. 2 caractères"),
  lastName: z.string().min(2, "Min. 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(9, "Numéro invalide"),
  password: z.string().min(8, "Min. 8 caractères"),
});

type AddStaffValues = z.infer<typeof addStaffSchema>;

export default function AddStaffScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight(); // <-- UTILISATION DU HOOK
  const [isPending, setIsPending] = useState(false);

  const { control, handleSubmit, watch } = useForm<AddStaffValues>({
    resolver: zodResolver(addStaffSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const watchedPassword = watch("password");

  const getPasswordStrength = () => {
    if (!watchedPassword)
      return { pct: 0, color: COLORS.textSubtle, label: "" };
    const hasUpper = /[A-Z]/.test(watchedPassword);
    const hasDigit = /[0-9]/.test(watchedPassword);
    const score = [watchedPassword.length >= 8, hasUpper, hasDigit].filter(
      Boolean,
    ).length;
    if (score === 3) return { pct: 100, color: COLORS.success, label: "Fort" };
    if (score === 2) return { pct: 66, color: COLORS.amber, label: "Moyen" };
    return { pct: 33, color: COLORS.red, label: "Faible" };
  };

  const strength = getPasswordStrength();

  const onSubmit = async (data: AddStaffValues) => {
    Keyboard.dismiss();
    setIsPending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await healthStructuresApi.addStaff(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myStructureStaff });
      Alert.alert("Succès", "L'agent a été ajouté à votre structure.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Échec",
        error?.response?.data?.message || "Erreur lors de l'ajout.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={19} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Nouvel Agent</Text>
            <View style={{ width: 38 }} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              // On inclut la tabBarHeight ici aussi pour le scroll
              { paddingBottom: 120 + tabBarHeight },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info Block */}
            <View style={styles.infoCard}>
              <Ionicons
                name="information-circle-outline"
                size={17}
                color={COLORS.success}
              />
              <Text style={styles.infoText}>
                L&apos;agent créé sera automatiquement rattaché à votre
                structure de santé.
              </Text>
            </View>

            <View style={{ gap: 2 }}>
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Prénom"
                    icon="person-outline"
                    placeholder="Mamadou"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Nom"
                    icon="person-outline"
                    placeholder="Diop"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    autoCapitalize="words"
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Email professionnel"
                    icon="mail-outline"
                    placeholder="m.diop@hopital.sn"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Téléphone"
                    sublabel="(+221)"
                    icon="call-outline"
                    placeholder="77 123 45 67"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="phone-pad"
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
                    placeholder="Min. 8 caractères"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    isPassword
                  />
                )}
              />

              {/* Indicateur force mot de passe */}
              {watchedPassword.length > 0 && (
                <View style={styles.strengthRow}>
                  <View style={styles.strengthBg}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${strength.pct}%` as any,
                          backgroundColor: strength.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.strengthLabel, { color: strength.color }]}
                  >
                    {strength.label}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* ── Footer fixe — respecte la home indicator iOS ET la Tab Bar ── */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom > 0 ? insets.bottom : 16,
              marginBottom: tabBarHeight, // <-- AJOUT ICI : pousse le footer au-dessus de la Tab Bar
            },
          ]}
        >
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
                <Text style={styles.ctaBtnText}>Créer le compte agent</Text>
                <View style={styles.ctaBtnIcon}>
                  <Ionicons
                    name="checkmark-outline"
                    size={17}
                    color={COLORS.white}
                  />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.cardBg,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800" },

  // Info card
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(34,197,94,0.06)",
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: "rgba(34,197,94,0.18)",
    padding: 13,
    marginBottom: 22,
  },
  infoText: {
    flex: 1,
    color: "rgba(34,197,94,0.80)",
    fontSize: 12,
    lineHeight: 18,
  },

  // Password strength
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -4,
    marginBottom: 8,
    marginLeft: 4,
  },
  strengthBg: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  strengthFill: { height: "100%", borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "700" },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.cardBorder,
  },
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
  ctaBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  ctaBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
});
