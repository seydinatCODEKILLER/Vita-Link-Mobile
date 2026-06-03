import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Keyboard,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import { zodResolver } from "@hookform/resolvers/zod";
import Slider from "@react-native-community/slider";
import * as Haptics from "expo-haptics";
import { FormInput } from "@/src/components/ui/FormInput";
import { useCreateAlert } from "@/src/hooks/useAlerts";
import {
  CreateAlertFormValues,
  createAlertSchema,
} from "@/src/validators/alert.schema";
import { z } from "zod";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";

// ─── Données statiques UI ──────────────────────────────────────
const BLOOD_TYPES = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A−" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B−" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O−" },
] as const;

const URGENCY_LEVELS = [
  { value: "VITAL", label: "Vital", icon: "flash" as const },
  { value: "STANDARD", label: "Standard", icon: "time-outline" as const },
] as const;

const SERVICE_UNITS = [
  { value: "EMERGENCY_ROOM", label: "Urgences" },
  { value: "OPERATING_ROOM", label: "Bloc op." },
  { value: "MATERNITY", label: "Maternité" },
  { value: "GENERAL", label: "Général" },
  { value: "PEDIATRICS", label: "Pédiatrie" },
] as const;

// ─── BloodTypeGrid ─────────────────────────────────────────────
function BloodTypeGrid({
  value,
  onChange,
  error,
  colors,
}: {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
  colors: AppColors;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {BLOOD_TYPES.map((bt) => {
          const selected = value === bt.value;
          return (
            <TouchableOpacity
              key={bt.value}
              onPress={() => {
                onChange(bt.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              activeOpacity={0.7}
              style={{
                width: "22%",
                aspectRatio: 1,
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                backgroundColor: selected ? colors.red : colors.cardBg,
                borderColor: selected ? colors.red : colors.cardBorder,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "800",
                  color: selected ? "#FFFFFF" : colors.textMuted,
                }}
              >
                {bt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text
          style={{
            color: "#EF4444",
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ─── UrgencySelector ───────────────────────────────────────────
function UrgencySelector({
  value,
  onChange,
  error,
  colors,
}: {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
  colors: AppColors;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {URGENCY_LEVELS.map((u) => {
          const selected = value === u.value;
          const isVital = u.value === "VITAL";
          const accentColor = isVital ? colors.red : colors.amber;
          return (
            <TouchableOpacity
              key={u.value}
              onPress={() => {
                onChange(u.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              activeOpacity={0.7}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                backgroundColor: selected ? accentColor + "1A" : colors.inputBg,
                borderColor: selected ? accentColor + "4D" : colors.cardBorder,
              }}
            >
              <Ionicons
                name={u.icon}
                size={18}
                color={selected ? accentColor : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: selected ? accentColor : colors.textMuted,
                }}
              >
                {u.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && (
        <Text
          style={{
            color: "#EF4444",
            fontSize: 12,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}

// ─── ServicePills ──────────────────────────────────────────────
function ServicePills({
  value,
  onChange,
  colors,
}: {
  value?: string;
  onChange: (v: string) => void;
  colors: AppColors;
}) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {SERVICE_UNITS.map((s) => {
        const selected = value === s.value;
        return (
          <TouchableOpacity
            key={s.value}
            onPress={() => {
              onChange(s.value);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 20,
              borderWidth: 1,
              backgroundColor: selected
                ? "rgba(220,30,30,0.10)"
                : colors.cardBg,
              borderColor: selected
                ? "rgba(220,30,30,0.30)"
                : colors.cardBorder,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: selected ? colors.red : colors.textMuted,
              }}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Écran principal ───────────────────────────────────────────
export default function CreateAlertScreen() {
  const router = useRouter();
  const { mutateAsync: createAlert, isPending } = useCreateAlert();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarHeight = useBottomTabBarHeight();

  const goBack = useSmartBack({
    defaultRoute: "/(hospital)/alerts",
    routeMap: {
      dashboardAlerts: "/(hospital)/alerts",
    },
  });

  const styles = useThemedStyles((c) => ({
    container: { flex: 1, backgroundColor: c.bg },
    safeArea: { flex: 1 },
    haloTop: {
      position: "absolute",
      top: -100,
      right: -80,
      width: 260,
      height: 260,
      borderRadius: 130,
      backgroundColor: c.redGlow,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.cardBg,
      borderWidth: 1,
      borderColor: c.cardBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: { color: c.white, fontSize: 20, fontWeight: "800" },
    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 10 },
    fieldLabel: {
      color: c.white,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.3,
      opacity: 0.75,
    },
    // Carte info standard (expiration)
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: c.success + "12",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.success + "2E",
      padding: 14,
    },
    infoCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.success + "1F",
      alignItems: "center",
      justifyContent: "center",
    },
    infoCardTitle: {
      color: c.success,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    infoCardText: { color: c.success + "B3", fontSize: 12, lineHeight: 18 },
    // Carte info Escalade CNTS (Ambre)
    escalationCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: c.amber + "12",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.amber + "2E",
      padding: 14,
    },
    escalationIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.amber + "1F",
      alignItems: "center",
      justifyContent: "center",
    },
    escalationTitle: {
      color: c.amber,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    escalationText: { color: c.amber + "B3", fontSize: 12, lineHeight: 18 },
    sliderCard: {
      backgroundColor: c.cardBg,
      borderRadius: 18,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 18,
    },
    sliderHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    sliderTitle: { color: c.white, fontSize: 13, fontWeight: "600", flex: 1 },
    sliderValue: { color: c.amber, fontSize: 16, fontWeight: "800" },
    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: -4,
    },
    sliderHint: { color: c.textSubtle, fontSize: 10, fontWeight: "600" },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 24,
      paddingTop: 16,
      backgroundColor: c.bg + "D9",
    },
    ctaBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: c.red,
      borderRadius: 16,
      paddingVertical: 17,
    },
    ctaBtnDisabled: { opacity: 0.6, backgroundColor: c.red + "66" },
    ctaBtnText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    ctaBtnTextDisabled: { color: "rgba(255,255,255,0.5)" },
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const { control, handleSubmit, watch, setValue, formState } = useForm<
    z.input<typeof createAlertSchema>,
    any,
    CreateAlertFormValues
  >({
    resolver: zodResolver(createAlertSchema),
    mode: "onChange",
    defaultValues: {
      bloodType: undefined,
      urgencyLevel: undefined,
      quantityNeeded: 1,
      serviceUnit: "GENERAL",
      radiusKm: 10,
    },
  });

  const { isValid } = formState;
  const radiusKm = watch("radiusKm");

  // ✅ LOGIQUE DE SOUMISSION AVEC ESCALADE CNTS
  const onSubmit = async (data: CreateAlertFormValues) => {
    Keyboard.dismiss();

    // 1. Alerte de Confirmation spéciale Hôpital
    Alert.alert(
      "⚠️ Confirmer et Escalader",
      "En lançant cette alerte, les donneurs proches seront notifiés ET votre CNTS d'affiliation sera immédiatement informée pour sécuriser l'approvisionnement. Confirmez-vous l'urgence ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer l'urgence",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await createAlert(data);
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );

              // 2. Message de succès adapté
              Alert.alert(
                "🚨 Alerte Lancée & CNTS Notifiée",
                `${response.notifiedDonors} donneurs notifiés. La CNTS a été informée de votre demande critique.`,
                [
                  {
                    text: "Voir l'alerte",
                    onPress: () =>
                      router.replace(
                        `/(hospital)/alerts/${response.alert.id}` as any,
                      ),
                  },
                  {
                    text: "OK",
                    style: "cancel",
                    onPress: () => router.back(),
                  },
                ],
              );
            } catch (error: any) {
              Alert.alert(
                "Erreur",
                error?.response?.data?.message ||
                  "Impossible de créer l'alerte.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloTop} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={goBack}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle Alerte</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 80 + tabBarHeight + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, gap: 24 }}>
            {/* ── Groupe Sanguin ── */}
            <View style={{ gap: 10 }}>
              <Text style={styles.fieldLabel}>Groupe sanguin requis *</Text>
              <Controller
                control={control}
                name="bloodType"
                render={({ field, fieldState }) => (
                  <BloodTypeGrid
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    colors={colors}
                  />
                )}
              />
            </View>

            {/* ── Urgence ── */}
            <View style={{ gap: 10 }}>
              <Text style={styles.fieldLabel}>Niveau d&apos;urgence *</Text>
              <Controller
                control={control}
                name="urgencyLevel"
                render={({ field, fieldState }) => (
                  <UrgencySelector
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                    colors={colors}
                  />
                )}
              />
            </View>

            {/* ── Quantité ── */}
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                name="quantityNeeded"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Nombre de donneurs requis *"
                    icon="people-outline"
                    placeholder="Ex: 3"
                    value={String(field.value)}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                )}
              />
            </View>

            {/* ── Service ── */}
            <View style={{ gap: 10 }}>
              <Text style={styles.fieldLabel}>Service médical</Text>
              <Controller
                control={control}
                name="serviceUnit"
                render={({ field }) => (
                  <ServicePills
                    value={field.value}
                    onChange={field.onChange}
                    colors={colors}
                  />
                )}
              />
            </View>

            {/* ── Bannière Escalade CNTS ── */}
            <View style={styles.escalationCard}>
              <View style={styles.escalationIcon}>
                <Ionicons
                  name="megaphone-outline"
                  size={18}
                  color={colors.amber}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.escalationTitle}>Escalade CNTS</Text>
                <Text style={styles.escalationText}>
                  Toute alerte lancée depuis l&apos;hôpital sera automatiquement
                  signalée à la CNTS régionale pour suivi et approvisionnement.
                </Text>
              </View>
            </View>

            {/* ── Info Expiration ── */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardIcon}>
                <Ionicons
                  name="timer-outline"
                  size={18}
                  color={colors.success}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.infoCardTitle}>Expiration automatique</Text>
                <Text style={styles.infoCardText}>
                  Les alertes VITAL expirent après{" "}
                  <Text style={{ color: colors.success, fontWeight: "700" }}>
                    1 heure
                  </Text>{" "}
                  et les alertes STANDARD après{" "}
                  <Text style={{ color: colors.success, fontWeight: "700" }}>
                    4 heures
                  </Text>
                  . Vous pourrez aussi la fermer manuellement à tout moment.
                </Text>
              </View>
            </View>

            {/* ── Rayon ── */}
            <View style={styles.sliderCard}>
              <View style={styles.sliderHeader}>
                <Ionicons
                  name="locate-outline"
                  size={16}
                  color={colors.amber}
                />
                <Text style={styles.sliderTitle}>Rayon de recherche</Text>
                <Text style={styles.sliderValue}>{radiusKm} km</Text>
              </View>
              <Slider
                style={{ width: "100%", height: 40 }}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={radiusKm}
                onValueChange={(val) => setValue("radiusKm", val)}
                minimumTrackTintColor={colors.red}
                maximumTrackTintColor={colors.cardBorder}
                thumbTintColor={colors.red}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderHint}>1 km</Text>
                <Text style={styles.sliderHint}>50 km</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* ── Footer CTA ── */}
        <View style={[styles.footer, { paddingBottom: tabBarHeight + 20 }]}>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.85}
            style={[
              styles.ctaBtn,
              (!isValid || isPending) && styles.ctaBtnDisabled,
            ]}
            disabled={!isValid || isPending}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={!isValid ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.ctaBtnText,
                    !isValid && styles.ctaBtnTextDisabled,
                  ]}
                >
                  Escalader à la CNTS
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
