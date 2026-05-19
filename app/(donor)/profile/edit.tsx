import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Image,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { StatusBar } from "expo-status-bar";
import { FormInput } from "@/src/components/ui/FormInput";
import { useAuthStore } from "@/src/store/auth.store";
import { usersApi } from "@/src/api/users.api";
import { UpdateProfilePayload, User } from "@/src/types/user.types";
import { Gender } from "@/src/types/shared.types";
import {
  editProfileSchema,
  EditProfileValues,
} from "@/src/validators/profile.schema";

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
} as const;

// ─── Données statiques ─────────────────────────────────────────
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

const GENDERS = [
  { value: "MALE", label: "Homme", icon: "male-outline" as const },
  { value: "FEMALE", label: "Femme", icon: "female-outline" as const },
] as const;

// ─── Composants réutilisés (Gender / Blood / Date) ─────────────

function GenderSelector({
  value,
  onChange,
}: {
  value: string | undefined | null;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.genderRow}>
      {GENDERS.map((g) => {
        const selected = value === g.value;
        return (
          <TouchableOpacity
            key={g.value}
            onPress={() => onChange(g.value)}
            activeOpacity={0.75}
            style={[
              styles.genderBtn,
              selected ? styles.genderBtnSelected : styles.genderBtnDefault,
            ]}
          >
            <View
              style={[
                styles.genderIconWrap,
                selected
                  ? styles.genderIconWrapSelected
                  : styles.genderIconWrapDefault,
              ]}
            >
              <Ionicons
                name={g.icon}
                size={20}
                color={selected ? COLORS.white : COLORS.textMuted}
              />
            </View>
            <Text
              style={[
                styles.genderLabel,
                selected && styles.genderLabelSelected,
              ]}
            >
              {g.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function BloodTypeGrid({
  value,
  onChange,
}: {
  value: string | undefined | null;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.bloodGrid}>
      {BLOOD_TYPES.map((bt) => {
        const selected = value === bt.value;
        return (
          <TouchableOpacity
            key={bt.value}
            onPress={() => onChange(bt.value)}
            activeOpacity={0.75}
            style={[
              styles.bloodCell,
              selected ? styles.bloodCellSelected : styles.bloodCellDefault,
            ]}
          >
            <Text
              style={[styles.bloodLabel, selected && styles.bloodLabelSelected]}
            >
              {bt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Écran Principal ───────────────────────────────────────────
export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

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
    watch,
    formState: { errors },
  } = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      gender: user?.gender || undefined,
      bloodType: user?.bloodType || undefined,
      dateOfBirth: user?.dateOfBirth || null,
    },
  });

  // ── Upload Avatar ──
  const handlePickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission requise",
        "Autorisez l'accès à la galerie pour changer votre photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      await uploadAvatar(imageUri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      const updatedUser = await usersApi.updateAvatar(uri);
      await updateUser({ avatarUrl: updatedUser.avatarUrl });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour la photo de profil.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Date Picker ──
  const openDatePicker = useCallback(() => {
    const currentValue = watch("dateOfBirth");
    const dateValue = currentValue
      ? new Date(currentValue)
      : new Date(2000, 0, 1);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: dateValue,
        mode: "date",
        maximumDate: new Date(),
        minimumDate: new Date(1920, 0, 1),
        onChange: (_, date) => {
          if (date)
            setValue("dateOfBirth", date.toISOString(), {
              shouldValidate: true,
            });
        },
      });
    } else {
      setShowDatePicker(true);
    }
  }, [watch, setValue]);

  // ── Submit ──
  const onSubmit = async (data: EditProfileValues) => {
    setIsSaving(true);
    try {
      const payload: UpdateProfilePayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender as Gender | undefined,
        bloodType: data.bloodType,
        dateOfBirth: data.dateOfBirth ?? undefined,
      };

      // Mise à jour des infos classiques
      let updatedUser: User = await usersApi.updateProfile(payload);

      // Mise à jour du groupe sanguin (si modifié)
      if (data.bloodType && data.bloodType !== user?.bloodType) {
        // Si ton backend sépare la mise à jour du groupe sanguin, fais un call spécifique ici
        // Sinon, inclus bloodType dans le payload du UpdateProfilePayload
      }

      await updateUser({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        gender: updatedUser.gender,
        bloodType: updatedUser.bloodType,
        dateOfBirth: updatedUser.dateOfBirth,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Alert.alert(
        "Mise à jour échouée",
        error?.response?.data?.message || "Une erreur est survenue.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const dateOfBirthValue = watch("dateOfBirth");

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
          <Text style={styles.headerTitle}>Modifier le profil</Text>
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
            {/* ── Avatar Section ── */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={handlePickImage}
                activeOpacity={0.8}
                disabled={isUploading}
              >
                <View style={styles.avatarWrap}>
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons
                        name="person"
                        size={36}
                        color={COLORS.textSubtle}
                      />
                    </View>
                  )}
                  {isUploading ? (
                    <View style={styles.avatarBadge}>
                      <ActivityIndicator size="small" color={COLORS.white} />
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.avatarBadge,
                        { backgroundColor: COLORS.red },
                      ]}
                    >
                      <Ionicons name="camera" size={11} color={COLORS.white} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.avatarHint}>Changer la photo de profil</Text>
            </View>

            {/* ── Identité ── */}
            <Text style={styles.sectionTitle}>IDENTITÉ</Text>
            <View style={styles.formBlock}>
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <FormInput
                    label="Prénom"
                    icon="person-outline"
                    placeholder="Votre prénom"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
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
                    placeholder="Votre nom"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={fieldState.error?.message}
                  />
                )}
              />

              <Text style={styles.fieldLabel}>Genre</Text>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <GenderSelector
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </View>

            {/* ── Infos Médicales ── */}
            <Text style={styles.sectionTitle}>PROFIL MÉDICAL</Text>
            <View style={styles.formBlock}>
              <Text style={styles.fieldLabel}>Groupe sanguin *</Text>
              <Controller
                control={control}
                name="bloodType"
                render={({ field, fieldState }) => (
                  <View>
                    <BloodTypeGrid
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.error && (
                      <Text style={styles.errorText}>
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                )}
              />

              <View style={styles.divider} />

              <Text style={styles.fieldLabel}>
                Date de naissance{" "}
                <Text style={styles.optionalText}>(optionnel)</Text>
              </Text>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <View>
                    <TouchableOpacity
                      onPress={openDatePicker}
                      activeOpacity={0.75}
                      style={[
                        styles.datePickerBtn,
                        field.value && styles.datePickerBtnFilled,
                      ]}
                    >
                      <View style={styles.datePickerLeft}>
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={field.value ? COLORS.red : COLORS.textMuted}
                        />
                        <Text
                          style={[
                            styles.datePickerText,
                            field.value && styles.datePickerTextFilled,
                          ]}
                        >
                          {field.value
                            ? dayjs(field.value).format("DD MMMM YYYY")
                            : "Sélectionner une date"}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {showDatePicker && Platform.OS === "ios" && (
                      <View style={styles.iosPickerContainer}>
                        <DateTimePicker
                          value={
                            field.value
                              ? new Date(field.value)
                              : new Date(2000, 0, 1)
                          }
                          mode="date"
                          maximumDate={new Date()}
                          minimumDate={new Date(1920, 0, 1)}
                          onChange={(_, date) => {
                            if (date) field.onChange(date.toISOString());
                          }}
                          display="spinner"
                          themeVariant="dark"
                        />
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(false)}
                          style={styles.iosPickerDone}
                        >
                          <Text style={styles.iosPickerDoneText}>
                            Confirmer
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
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

  // Avatar
  avatarSection: {
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
    paddingTop: 10,
  },
  avatarWrap: { position: "relative" },
  avatarImage: { width: 96, height: 96, borderRadius: 28 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  avatarHint: { color: COLORS.textMuted, fontSize: 13, fontWeight: "500" },

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
  fieldLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  optionalText: { color: COLORS.textSubtle, fontWeight: "400" },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 16,
  },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 6, marginLeft: 4 },

  // Gender
  genderRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  genderBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  genderBtnDefault: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
  },
  genderBtnSelected: {
    backgroundColor: "rgba(220,30,30,0.12)",
    borderColor: COLORS.red,
  },
  genderIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  genderIconWrapDefault: { backgroundColor: "rgba(255,255,255,0.06)" },
  genderIconWrapSelected: { backgroundColor: COLORS.red },
  genderLabel: { color: COLORS.textMuted, fontSize: 14, fontWeight: "600" },
  genderLabelSelected: { color: COLORS.white },

  // Blood Grid
  bloodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  bloodCell: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  bloodCellDefault: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.inputBorder,
  },
  bloodCellSelected: { backgroundColor: COLORS.red, borderColor: COLORS.red },
  bloodLabel: { color: COLORS.textMuted, fontSize: 17, fontWeight: "800" },
  bloodLabelSelected: { color: COLORS.white },

  // Date Picker
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    padding: 15,
  },
  datePickerBtnFilled: {
    borderColor: "rgba(220,30,30,0.35)",
    backgroundColor: "rgba(220,30,30,0.06)",
  },
  datePickerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  datePickerText: { color: COLORS.textMuted, fontSize: 14 },
  datePickerTextFilled: { color: COLORS.white, fontWeight: "500" },
  iosPickerContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    marginTop: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iosPickerDone: {
    alignItems: "flex-end",
    padding: 12,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iosPickerDoneText: { color: COLORS.red, fontWeight: "700", fontSize: 15 },
});
