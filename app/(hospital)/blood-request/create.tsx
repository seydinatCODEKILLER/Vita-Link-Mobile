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
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { FormInput } from "@/src/components/ui/FormInput";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { useThemeStore } from "@/src/store/theme.store";
import { AppColors } from "@/src/theme/colors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bloodRequestsApi } from "@/src/api/blood-requests.api";
import { QUERY_KEYS } from "@/src/constants/query_key";
import { CreateBloodRequestFormValues, createBloodRequestSchema } from "@/src/validators/blood-requests.schema";

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
    desc: "Moins de 1h",
  },
  {
    value: "STANDARD",
    label: "Standard",
    icon: "time-outline" as const,
    desc: "Dans la journée",
  },
] as const;

const SERVICE_UNITS = [
  { value: "EMERGENCY_ROOM", label: "Urgences" },
  { value: "OPERATING_ROOM", label: "Bloc opératoire" },
  { value: "MATERNITY", label: "Maternité" },
  { value: "GENERAL", label: "Général" },
  { value: "PEDIATRICS", label: "Pédiatrie" },
] as const;

// ─── Components UI ─────────────────────────────────────────────
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
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                gap: 4,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selected ? accentColor + "1A" : colors.cardBg,
                borderColor: selected ? accentColor + "4D" : colors.cardBorder,
              }}
            >
              <Ionicons
                name={u.icon}
                size={20}
                color={selected ? accentColor : colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: selected ? accentColor : colors.textMuted,
                }}
              >
                {u.label}
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                {u.desc}
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
export default function CreateBloodRequestScreen() {
  const router = useRouter();
  const colors = useColors();
  const theme = useThemeStore((s) => s.theme);
  const queryClient = useQueryClient();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarHeight = useBottomTabBarHeight();

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
    infoCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: c.amber + "12",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.amber + "2E",
      padding: 14,
    },
    infoCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.amber + "1F",
      alignItems: "center",
      justifyContent: "center",
    },
    infoCardTitle: {
      color: c.amber,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 2,
    },
    infoCardText: { color: c.amber + "B3", fontSize: 12, lineHeight: 18 },
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

  const { control, handleSubmit, formState } =
    useForm<CreateBloodRequestFormValues>({
      resolver: zodResolver(createBloodRequestSchema),
      mode: "onChange",
      defaultValues: {
        bloodType: undefined,
        quantityNeeded: 1,
        urgencyLevel: undefined,
        serviceUnit: "GENERAL",
        clinicalContext: "",
      },
    });

  const { isValid } = formState;

  const createMutation = useMutation({
    mutationFn: (payload: CreateBloodRequestFormValues) =>
      bloodRequestsApi.createRequest(payload),
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bloodRequests() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hospitalDashboard(),
      });

      Alert.alert(
        "✅ Demande Transmise",
        "Votre CNTS d'affiliation a été notifiée et traitera votre demande dans les plus brefs délais.",
        [
          {
            text: "Voir la demande",
            onPress: () =>
              router.replace(`/(hospital)/blood-request/${data.id}` as any),
          },
          { text: "OK", style: "cancel", onPress: () => router.back() },
        ],
      );
    },
    onError: (err: any) => {
      Alert.alert(
        "Erreur",
        err?.response?.data?.message || "Impossible de soumettre la demande.",
      );
    },
  });

  const onSubmit = async (data: CreateBloodRequestFormValues) => {
    Keyboard.dismiss();
    createMutation.mutate(data);
  };

  return (
    <View style={styles.container}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <View style={styles.haloTop} />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Demande de Sang</Text>
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
            {/* Bannière info CNTS */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.amber}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.infoCardTitle}>Canal Sécurisé</Text>
                <Text style={styles.infoCardText}>
                  Cette demande sera envoyée directement à votre CNTS
                  d&apos;affiliation. Si le stock est insuffisant, la CNTS lancera
                  une alerte aux donneurs.
                </Text>
              </View>
            </View>

            {/* Groupe Sanguin */}
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

            {/* Urgence */}
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

            {/* Quantité */}
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                name="quantityNeeded"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Nombre de poches requis *"
                    icon="water-outline"
                    placeholder="Ex: 3"
                    value={String(field.value)}
                    onChangeText={(val) => field.onChange(Number(val))}
                    error={fieldState.error?.message}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                )}
              />
            </View>

            {/* Service */}
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

            {/* Contexte Clinique */}
            <View style={{ gap: 10 }}>
              <Controller
                control={control}
                name="clinicalContext"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Contexte clinique (opt.)"
                    icon="document-text-outline"
                    placeholder="Ex: Hémorragie post-opératoire..."
                    value={field.value || ""}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />
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
              (!isValid || createMutation.isPending) && styles.ctaBtnDisabled,
            ]}
            disabled={!isValid || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={20}
                  color={!isValid ? "rgba(255,255,255,0.5)" : "#FFFFFF"}
                />
                <Text
                  style={[
                    styles.ctaBtnText,
                    !isValid && styles.ctaBtnTextDisabled,
                  ]}
                >
                  Soumettre à la CNTS
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
