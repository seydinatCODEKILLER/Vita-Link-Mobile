import * as SecureStore from "expo-secure-store";
import { RegisterDonorFormValues } from "@/src/validators/auth.schema";

const PENDING_DONOR_KEY = "vitalink_pending_donor";

class RegistrationManager {
  // Sauvegarder l'inscription en cours (à appeler dans register-donor.tsx)
  async savePendingDonor(data: RegisterDonorFormValues): Promise<void> {
    await SecureStore.setItemAsync(PENDING_DONOR_KEY, JSON.stringify(data));
  }

  // Récupérer l'inscription en cours
  async getPendingDonor(): Promise<RegisterDonorFormValues | null> {
    try {
      const raw = await SecureStore.getItemAsync(PENDING_DONOR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Supprimer l'inscription en cours (à appeler après vérification OTP réussie)
  async clearPendingDonor(): Promise<void> {
    await SecureStore.deleteItemAsync(PENDING_DONOR_KEY);
  }
}

export const registrationManager = new RegistrationManager();
