import { useEffect, useRef } from "react";
import { Alert, Animated, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { z } from "zod";
import { useCreateAlert } from "@/src/hooks/useAlerts";
import {
  CreateAlertFormValues,
  createAlertSchema,
} from "@/src/validators/alert.schema";

/**
 * Centralise la logique du formulaire de création d'alerte :
 * - configuration react-hook-form + validation zod
 * - animation de fade à l'entrée
 * - soumission et feedback (succès/erreur)
 */
export function useCreateAlertForm() {
  const router = useRouter();
  const { mutateAsync: createAlert, isPending } = useCreateAlert();
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  return {
    control,
    fadeAnim,
    radiusKm,
    setValue,
    isValid,
    isPending,
    handleSubmit: handleSubmit(onSubmit),
  };
}
