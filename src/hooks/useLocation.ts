import { useState, useCallback } from "react";
import * as Location from "expo-location";
import { usersApi } from "@/src/api/users.api";
import { useAuthStore } from "@/src/store/auth.store";
import logger from "@/src/utils/logger.utils";

interface LocationState {
  granted: boolean;
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export const useLocation = () => {
  const { updateUser } = useAuthStore();
  const [state, setState] = useState<LocationState>({
    granted: false,
    latitude: null,
    longitude: null,
    error: null,
  });

  /**
   * Demande la permission de géolocalisation et envoie la position au backend.
   * Appelé au montage du layout donneur.
   */
  const requestAndSync = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setState((prev) => ({
          ...prev,
          granted: false,
          error: "Permission géolocalisation refusée",
        }));
        logger.warn("Permission géolocalisation refusée");
        return;
      }

      setState((prev) => ({ ...prev, granted: true }));

      // Récupérer la position avec haute précision
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      setState((prev) => ({ ...prev, latitude, longitude }));

      // Envoyer au backend — fire and forget
      // Ne bloque pas le démarrage si l'API est lente
      usersApi
        .updateLocation({ latitude, longitude })
        .then(() => {
          // Mettre à jour le store local
          updateUser({ latitude, longitude });
          logger.info("Position synchronisée", { latitude, longitude });
        })
        .catch((err) => {
          logger.warn("Échec sync position", err);
        });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message ?? "Erreur géolocalisation",
      }));
      logger.error("Erreur géolocalisation", err);
    }
  }, [updateUser]);

  return { ...state, requestAndSync };
};
