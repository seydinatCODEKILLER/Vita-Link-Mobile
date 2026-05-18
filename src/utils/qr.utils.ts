import * as SecureStore from "expo-secure-store";

const QR_STORAGE_KEY = "vitalink_pending_qr";

export interface PendingQr {
  qrCode: string;
  alertId: string;
  hospitalName: string;
  bloodType: string;
  confirmedAt: string;
  expiresAt: string; // TTL de 4h après confirmation
}

export const savePendingQr = async (data: PendingQr) => {
  await SecureStore.setItemAsync(QR_STORAGE_KEY, JSON.stringify(data));
};

export const getPendingQr = async (): Promise<PendingQr | null> => {
  const raw = await SecureStore.getItemAsync(QR_STORAGE_KEY);
  if (!raw) return null;

  const parsed: PendingQr = JSON.parse(raw);

  // Vérifier le TTL local (4h)
  if (new Date(parsed.expiresAt) < new Date()) {
    await SecureStore.deleteItemAsync(QR_STORAGE_KEY);
    return null;
  }

  return parsed;
};

export const clearPendingQr = async () => {
  await SecureStore.deleteItemAsync(QR_STORAGE_KEY);
};
