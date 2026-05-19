import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
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

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.14)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.09)",
  inputBg: "#141414",
  inputBorder: "rgba(255,255,255,0.10)",
  amber: "#FAC775",
  green: "#1D9E75",
} as const;

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
  {
    value: "VITAL",
    label: "Vital",
    icon: "flash" as const,
    color: COLORS.red,
    bg: "rgba(220,30,30,0.10)",
    border: "rgba(220,30,30,0.30)",
  },
  {
    value: "STANDARD",
    label: "Standard",
    icon: "time-outline" as const,
    color: COLORS.amber,
    bg: "rgba(250,199,117,0.08)",
    border: "rgba(250,199,117,0.25)",
  },
] as const;

const SERVICE_UNITS = [
  { value: "EMERGENCY_ROOM", label: "Urgences" },
  { value: "OPERATING_ROOM", label: "Bloc op." },
  { value: "MATERNITY", label: "Maternité" },
  { value: "GENERAL", label: "Général" },
  { value: "PEDIATRICS", label: "Pédiatrie" },
] as const;

// ─── Composants Sélecteurs ────────────────────────────────────

function BloodTypeGrid({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.grid}>
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
              style={[
                styles.gridCell,
                selected ? styles.gridCellSelected : styles.gridCellDefault,
              ]}
            >
              <Text
                style={[styles.gridLabel, selected && styles.gridLabelSelected]}
              >
                {bt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function UrgencySelector({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.urgencyRow}>
        {URGENCY_LEVELS.map((u) => {
          const selected = value === u.value;
          return (
            <TouchableOpacity
              key={u.value}
              onPress={() => {
                onChange(u.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              activeOpacity={0.7}
              style={[
                styles.urgencyBtn,
                {
                  backgroundColor: selected ? u.bg : COLORS.inputBg,
                  borderColor: selected ? u.border : COLORS.inputBorder,
                },
              ]}
            >
              <Ionicons
                name={u.icon}
                size={18}
                color={selected ? u.color : COLORS.textMuted}
              />
              <Text
                style={[
                  styles.urgencyLabel,
                  { color: selected ? u.color : COLORS.textMuted },
                ]}
              >
                {u.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

function ServicePills({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.pillsRow}>
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
            style={[
              styles.pill,
              selected ? styles.pillSelected : styles.pillDefault,
            ]}
          >
            <Text
              style={[styles.pillText, selected && styles.pillTextSelected]}
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarHeight = useBottomTabBarHeight();

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

  const onSubmit = async (data: CreateAlertFormValues) => {
    Keyboard.dismiss();
    try {
      const response = await createAlert(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log(response);
      

      Alert.alert(
        "🚨 Alerte Lancée !",
        `${response.notifiedDonors} donneurs compatibles dans un rayon de ${data.radiusKm}km ont été notifiés.`,
        [
          {
            text: "Voir l'alerte",
            onPress: () =>
              router.replace(
                `/(health)/alerts/${response.alert.id}/dashboard` as any,
              ),
          },
          { text: "OK", style: "cancel" },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error?.response?.data?.message || "Impossible de créer l'alerte.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.haloTop} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color={COLORS.white} />
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
            {/* Groupe Sanguin */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Groupe sanguin requis *</Text>
              <Controller
                control={control}
                name="bloodType"
                render={({ field, fieldState }) => (
                  <BloodTypeGrid
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            {/* Niveau d'urgence */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Niveau d&apos;urgence *</Text>
              <Controller
                control={control}
                name="urgencyLevel"
                render={({ field, fieldState }) => (
                  <UrgencySelector
                    value={field.value}
                    onChange={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            {/* Quantité */}
            <View style={styles.fieldBlock}>
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

            {/* Service */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Service médical</Text>
              <Controller
                control={control}
                name="serviceUnit"
                render={({ field }) => (
                  <ServicePills value={field.value} onChange={field.onChange} />
                )}
              />
            </View>

            {/* Info Expiration Auto (Pas de sélecteur de date !) */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardIcon}>
                <Ionicons name="timer-outline" size={18} color={COLORS.green} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.infoCardTitle}>Expiration automatique</Text>
                <Text style={styles.infoCardText}>
                  Les alertes VITAL expirent après{" "}
                  <Text style={styles.highlight}>1 heure</Text> et les alertes
                  STANDARD après <Text style={styles.highlight}>4 heures</Text>.
                  Vous pourrez aussi la fermer manuellement à tout moment.
                </Text>
              </View>
            </View>

            {/* Rayon de recherche */}
            <View style={[styles.fieldBlock, styles.cardBg]}>
              <View style={styles.sliderHeader}>
                <Ionicons
                  name="locate-outline"
                  size={16}
                  color={COLORS.amber}
                />
                <Text style={styles.sliderTitle}>Rayon de recherche</Text>
                <Text style={styles.sliderValue}>{radiusKm} km</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={50}
                step={1}
                value={radiusKm}
                onValueChange={(val) => setValue("radiusKm", val)}
                minimumTrackTintColor={COLORS.red}
                maximumTrackTintColor="rgba(255,255,255,0.10)"
                thumbTintColor={COLORS.red}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderHint}>1 km</Text>
                <Text style={styles.sliderHint}>50 km</Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer CTA */}
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
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={!isValid ? COLORS.textSubtle : COLORS.white}
                />
                <Text
                  style={[
                    styles.ctaBtnText,
                    !isValid && styles.ctaBtnTextDisabled,
                  ]}
                >
                  Lancer l&apos;alerte
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },
  haloTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.redGlow,
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
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: "800" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 10 },
  fieldBlock: { gap: 10 },
  fieldLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
    backgroundColor: "rgba(220,30,30,0.4)", // ✅ Rouge pâle au lieu du rouge vif
  },
  ctaBtnTextDisabled: {
    color: "rgba(255,255,255,0.5)", // ✅ Texte moins contrasté
  },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4, marginLeft: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridCell: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  gridCellDefault: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
  },
  gridCellSelected: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  gridLabel: { color: COLORS.textMuted, fontSize: 17, fontWeight: "800" },
  gridLabelSelected: { color: COLORS.white },
  urgencyRow: { flexDirection: "row", gap: 12 },
  urgencyBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "rgba(34,197,94,0.07)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.18)",
    padding: 14,
  },
  infoCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCardTitle: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  infoCardText: {
    color: "rgba(34,197,94,0.70)",
    fontSize: 12,
    lineHeight: 18,
  },
  highlight: {
    color: COLORS.green,
    fontWeight: "700",
  },
  urgencyLabel: { fontSize: 15, fontWeight: "700" },
  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillDefault: {
    backgroundColor: COLORS.cardBg,
    borderColor: COLORS.cardBorder,
  },
  pillSelected: {
    backgroundColor: "rgba(220,30,30,0.10)",
    borderColor: "rgba(220,30,30,0.30)",
  },
  pillText: { color: COLORS.textMuted, fontSize: 12, fontWeight: "600" },
  pillTextSelected: { color: COLORS.red },
  cardBg: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 0.5,
    borderColor: COLORS.cardBorder,
    padding: 18,
  },
  sliderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sliderTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  sliderValue: { color: COLORS.amber, fontSize: 16, fontWeight: "800" },
  slider: { width: "100%", height: 40 },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  sliderHint: { color: COLORS.textSubtle, fontSize: 10, fontWeight: "600" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "rgba(8,8,8,0.85)",
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
  ctaBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
