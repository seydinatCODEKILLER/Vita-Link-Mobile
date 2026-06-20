import { useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useUpdateMyStock } from "@/src/hooks/useBloodStocks";
import { BloodType } from "@/src/types/shared.types";

/**
 * Centralise l'état et les actions liées à la modale
 * de mise à jour d'un stock de sang.
 */
export function useStockUpdate() {
  const { mutateAsync: updateStock, isPending: isUpdating } =
    useUpdateMyStock();

  const [selectedBloodType, setSelectedBloodType] = useState<BloodType | null>(
    null,
  );
  const [inputQuantity, setInputQuantity] = useState("");

  const openModal = (bloodType: BloodType, currentQty: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBloodType(bloodType);
    setInputQuantity(currentQty.toString());
  };

  const closeModal = () => setSelectedBloodType(null);

  const confirmUpdate = async () => {
    if (!selectedBloodType || inputQuantity === "") return;

    const qty = parseInt(inputQuantity, 10);
    if (isNaN(qty) || qty < 0 || qty > 500) {
      Alert.alert("Invalide", "La quantité doit être entre 0 et 500.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateStock({ bloodType: selectedBloodType, quantity: qty });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeModal();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Mise à jour échouée.";
      Alert.alert("Erreur", errorMsg);
    }
  };

  return {
    selectedBloodType,
    inputQuantity,
    setInputQuantity,
    isUpdating,
    openModal,
    closeModal,
    confirmUpdate,
  };
}
