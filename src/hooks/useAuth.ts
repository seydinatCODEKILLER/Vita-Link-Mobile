import { useMutation } from "@tanstack/react-query";
import { Href, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { authApi } from "@/src/api/auth.api";
import { useAuthStore } from "@/src/store/auth.store";
import { tokenManager } from "@/src/utils/token.utils";
import {
  LoginPayload,
  RegisterDonorPayload,
  RegisterStructurePayload,
  VerifyOtpPayload,
} from "../types/auth.types";
import { registrationManager } from "@/src/utils/registration.utils";

// ─── Helper pour extraire le message d'erreur Axios ──────────
const getErrorMessage = (err: any) =>
  err?.response?.data?.message ||
  err?.message ||
  "Une erreur inattendue est survenue";

// ─── Register Donor ───────────────────────────────────────────
export const useRegisterDonor = () => {
  return useMutation({
    mutationFn: (payload: RegisterDonorPayload) =>
      authApi.registerDonor(payload),
    onSuccess: (data) => {
      Toast.show({
        type: "success",
        text1: "Vérification envoyée 📧",
        text2: data.message || "Un code OTP a été envoyé à votre email.",
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Inscription échouée",
        text2: getErrorMessage(err),
      });
    },
  });
};

// ─── Resend OTP ───────────────────────────────────────────────
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.sendOtp(email),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Code renvoyé 📧",
        text2: "Un nouveau code a été envoyé.",
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: getErrorMessage(err),
      });
    },
  });
};

// ─── Verify OTP → Crée le compte donneur → JWT ───────────────
export const useVerifyOtp = () => {
  const router = useRouter();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => {
      const cleanedPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, v]) => v !== ""),
      );
      return authApi.verifyOtp(cleanedPayload as VerifyOtpPayload);
    },
    onSuccess: async (response) => {
      await tokenManager.saveTokens(
        response.accessToken,
        response.refreshToken,
      );
      await setUser(response.user);
      await registrationManager.clearPendingDonor();
      Toast.show({ type: "success", text1: "Bienvenue Jambaar ! 🩸" });
      router.replace("/(donor)");
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Code invalide",
        text2: getErrorMessage(err),
      });
    },
  });
};

// ─── Login (agents & admins) ──────────────────────────────────
export const useLogin = () => {
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (response) => {
      await tokenManager.saveTokens(
        response.accessToken,
        response.refreshToken,
      );
      await setUser(response.user);

      Toast.show({
        type: "success",
        text1: "Connexion réussie 👋",
        text2: `Bon retour, ${response.user.firstName} !`,
      });
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Connexion échouée",
        text2: getErrorMessage(err),
      });
    },
  });
};

// ─── Register Health Structure ────────────────────────────────
export const useRegisterHealthStructure = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterStructurePayload) =>
      authApi.registerHealthStructure(payload),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Demande soumise 🏥",
        text2: "Votre structure est en attente de vérification.",
      });
      router.replace("/pending-review" as Href);
    },
    onError: (err) => {
      Toast.show({
        type: "error",
        text1: "Erreur d'inscription",
        text2: getErrorMessage(err),
      });
    },
  });
};

// ─── Logout ───────────────────────────────────────────────────
export const useLogout = () => {
  const { logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await logout();
      router.replace("/(auth)/welcome");
    },
  });
};
