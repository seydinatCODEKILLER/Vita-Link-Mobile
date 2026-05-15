import { useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { registrationManager } from "@/src/utils/registration.utils";

export const useCheckPendingRegistration = () => {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const pendingData = await registrationManager.getPendingDonor();

      if (pendingData) {
        Alert.alert(
          "Inscription en cours",
          `Il semble que vous n'ayez pas validé votre inscription avec le code OTP envoyé à ${pendingData.email || "votre email"}.\n\nVoulez-vous reprendre où vous en étiez ?`,
          [
            {
              text: "Recommencer",
              style: "cancel",
              onPress: async () => {
                await registrationManager.clearPendingDonor();
              },
            },
            {
              text: "Reprendre",
              onPress: async () => {
                router.replace({
                  pathname: "/otp-verify",
                  params: {
                    email: pendingData.email,
                    phone: pendingData.phone,
                    firstName: pendingData.firstName,
                    lastName: pendingData.lastName,
                    bloodType: pendingData.bloodType,
                    gender: pendingData.gender,
                    dateOfBirth: pendingData.dateOfBirth || "",
                  },
                });
              },
            },
          ],
          { cancelable: false },
        );
      }
    };

    check();
  }, [router]);
};
