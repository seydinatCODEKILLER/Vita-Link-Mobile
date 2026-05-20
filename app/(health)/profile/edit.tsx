import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/src/components/ui/FormInput";
import {
  useMyStructure,
  useUpdateMyStructure,
} from "@/src/hooks/useHealthStructure";

// ─── Palette ──────────────────────────────────────────────────
const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  redGlow: "rgba(220,30,30,0.14)",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  textSubtle: "rgba(255,255,255,0.18)",
  cardBg: "#111111",
  cardBorder: "rgba(255,255,255,0.08)",
  inputBg: "#141414",
  inputBorder: "rgba(255,255,255,0.10)",
  success: "#22C55E",
  amber: "#FAC775",
  blue: "#60A5FA",
} as const;

// ─── Schéma Zod ───────────────────────────────────────────────
const editStructureSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères"),
  address: z.string().min(5, "L'adresse est trop courte"),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

type EditStructureValues = z.infer<typeof editStructureSchema>;

// ─── Écran Principal ───────────────────────────────────────────
export default function EditStructureScreen() {
  const router = useRouter();
  const { data: structure, isLoading: isStructureLoading } = useMyStructure();
  const { mutateAsync: updateStructure, isPending: isSaving } =
    useUpdateMyStructure();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditStructureValues>({
    resolver: zodResolver(editStructureSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: null,
      longitude: null,
    },
  });

  // Remplir le formulaire une fois que les données de l'API sont là
  useEffect(() => {
    if (structure) {
      reset({
        name: structure.name,
        address: structure.address,
        latitude: structure.latitude,
        longitude: structure.longitude,
      });
    }
  }, [structure, reset]);

  // ── Submit ──
  const onSubmit = async (data: EditStructureValues) => {
    try {
      await updateStructure({
        name: data.name,
        address: data.address,
        // On n'envoie la localisation que si elle a été définie
        ...(data.latitude && data.longitude
          ? { latitude: data.latitude, longitude: data.longitude }
          : {}),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Mise à jour échouée",
        error?.response?.data?.message ||
          "Impossible de sauvegarder les modifications.",
      );
    }
  };

  if (isStructureLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.red} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.haloTop} />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.75}
          >
            <Ionicons name="arrow-back" size={19} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Modifier la structure</Text>
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator color={COLORS.red} />
            ) : (
              <Text style={styles.saveBtn}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* ── Bannière Info Administrateur ── */}
            <View style={styles.adminBanner}>
              <View style={styles.adminIconWrap}>
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={COLORS.amber}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.adminTitle}>Droits requis</Text>
                <Text style={styles.adminSub}>
                  Seul le directeur de la structure peut modifier ces
                  informations.
                </Text>
              </View>
            </View>

            {/* ── Informations Générales ── */}
            <Text style={styles.sectionTitle}>INFORMATIONS GÉNÉRALES</Text>
            <View style={styles.formBlock}>
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Nom de la structure"
                    icon="business-outline"
                    placeholder="Ex: Hôpital Principal"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Adresse complète"
                    icon="location-outline"
                    placeholder="Ex: Avenue Blaise Diagne, Dakar"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </View>

            {/* ── Localisation (Optionnel) ── */}
            <Text style={styles.sectionTitle}>LOCALISATION (OPTIONNEL)</Text>
            <View style={styles.formBlock}>
              <View style={styles.locationInfoCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={COLORS.blue}
                />
                <Text style={styles.locationInfoText}>
                  Une localisation précise permet aux donneurs de vous trouver
                  plus facilement sur la carte.
                </Text>
              </View>

              <Controller
                control={control}
                name="latitude"
                render={({ field }) => (
                  <FormInput
                    label="Latitude"
                    icon="map-outline"
                    placeholder="Ex: 14.6937"
                    value={field.value?.toString() ?? ""}
                    onChangeText={(val) => {
                      const num = parseFloat(val);
                      setValue("latitude", isNaN(num) ? null : num, {
                        shouldValidate: true,
                      });
                    }}
                    keyboardType="decimal-pad"
                  />
                )}
              />

              <Controller
                control={control}
                name="longitude"
                render={({ field }) => (
                  <FormInput
                    label="Longitude"
                    icon="map-outline"
                    placeholder="Ex: -17.4441"
                    value={field.value?.toString() ?? ""}
                    onChangeText={(val) => {
                      const num = parseFloat(val);
                      setValue("longitude", isNaN(num) ? null : num, {
                        shouldValidate: true,
                      });
                    }}
                    keyboardType="decimal-pad"
                  />
                )}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safeArea: { flex: 1 },
  centered: { alignItems: "center", justifyContent: "center" },
  haloTop: {
    position: "absolute",
    top: -100,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: COLORS.redGlow,
  },

  // Header
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
  headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: "800" },
  saveBtn: { color: COLORS.red, fontSize: 16, fontWeight: "700" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Admin Banner
  adminBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(250,199,117,0.06)",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "rgba(250,199,117,0.20)",
    padding: 14,
    marginBottom: 24,
  },
  adminIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: "rgba(250,199,117,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  adminTitle: {
    color: COLORS.amber,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 1,
  },
  adminSub: {
    color: "rgba(250,199,117,0.70)",
    fontSize: 12,
    lineHeight: 17,
  },

  // Sections
  sectionTitle: {
    color: COLORS.textSubtle,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  formBlock: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 24,
    gap: 4,
  },

  // Location Info
  locationInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(96,165,250,0.06)",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "rgba(96,165,250,0.20)",
    padding: 12,
    marginBottom: 10,
  },
  locationInfoText: {
    flex: 1,
    color: "rgba(96,165,250,0.80)",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
});
