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
import { RegisterCntsFormValues, RegisterHospitalFormValues } from "../validators/auth.schema";

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
      return authApi.verifyOtp(payload);
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
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      if (response.user.role === "ADMIN") {
        throw new Error(
          "ADMIN_BLOCKED: L'application mobile est réservée aux donneurs et aux structures de santé.",
        );
      }

      return response;
    },
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
    onError: (err: any) => {
      const isBlockedAdmin = err.message?.includes("ADMIN_BLOCKED");

      if (isBlockedAdmin) {
        Toast.show({
          type: "error",
          text1: "Accès refusé 🚫",
          text2: err.message.replace("ADMIN_BLOCKED: ", ""),
        });
        router.replace("/unauthorized");
      } else {
        Toast.show({
          type: "error",
          text1: "Connexion échouée",
          text2: getErrorMessage(err),
        });
      }
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

// ─── Hook ─────────────────────────────────────────────────────
export const useRegisterCnts = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: RegisterCntsFormValues) =>
      authApi.registerCnts({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        structureName: payload.structureName,
        registrationNumber: payload.registrationNumber,
        region: payload.region,
        address: payload.address,
        structurePhone: payload.structurePhone || undefined,
        structureEmail: payload.structureEmail || undefined,
        latitude: payload.latitude,
        longitude: payload.longitude,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "CNTS enregistrée 🏥",
        text2: "Votre demande est en attente de vérification.",
      });
      router.replace("/pending-review" as Href);
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Erreur d'inscription",
        text2:
          err?.response?.data?.message ||
          err?.message ||
          "Une erreur inattendue est survenue",
      });
    },
  });
};

export const useRegisterHospital = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: RegisterHospitalFormValues) =>
      authApi.registerHospital({
        // Infos Directeur
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        
        // Infos Hôpital
        structureName: payload.structureName,
        structureType: payload.structureType,
        registrationNumber: payload.registrationNumber,
        region: payload.region,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        affiliatedCntsId: payload.affiliatedCntsId,
        
        // Optionnels
        structurePhone: payload.structurePhone || undefined,
        structureEmail: payload.structureEmail || undefined,
      }),
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Établissement enregistré 🏥",
        text2: "Votre demande est en attente de vérification par la CNTS.",
      });
      router.replace("/pending-review" as any); // Remplace par ta route
    },
    onError: (err: any) => {
      Toast.show({
        type: "error",
        text1: "Erreur d'inscription",
        text2:
          err?.response?.data?.message ||
          "Une erreur inattendue est survenue",
      });
    },
  });
};