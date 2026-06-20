import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useSmartBack } from "@/src/hooks/useSmartBack";
import {
  useDayDetail,
  useDayRegistrations,
  useMarkAttendance,
  useCancelDay,
} from "@/src/hooks/useDonationDays";
import { RegistrationStatus } from "@/src/types/donation-day.types";
import { isNetworkError } from "@/src/utils/error.utils";

export function useDayDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const goBack = useSmartBack({
    defaultRoute: "/(health)/journees",
    routeMap: {
      journees: "/(health)/journees",
      edit: `/(health)/journees/${id}/edit`,
    },
  });

  const {
    data: day,
    isLoading: isLoadingDay,
    isError: isDayError,
    error: dayError,
    refetch: refetchDay,
  } = useDayDetail(id);
  const {
    data: registrationsData,
    isLoading: isLoadingReg,
    isError: isRegError,
    error: regError,
    refetch: refetchReg,
  } = useDayRegistrations(id);

  const { mutateAsync: markAttendance } = useMarkAttendance();
  const { mutateAsync: cancelDay, isPending: isCancelling } = useCancelDay();

  const [activeRegFilter, setActiveRegFilter] = useState<
    RegistrationStatus | "ALL"
  >("ALL");
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (isCancelModalVisible) {
      const unsubscribe = navigation.addListener("beforeRemove", (e) =>
        e.preventDefault(),
      );
      return unsubscribe;
    }
  }, [isCancelModalVisible, navigation]);

  const handleMarkAttendance = (
    registrationId: string,
    status: "ATTENDED" | "NO_SHOW",
  ) => {
    markAttendance({ dayId: id, registrationId, status }).catch(() => {});
  };

  const handleCancelDay = () => {
    setCancelReason("");
    setIsCancelModalVisible(true);
  };

  const confirmCancelDay = async () => {
    if (cancelReason.trim().length < 5) {
      Alert.alert(
        "Raison requise",
        "Veuillez saisir une raison d'au moins 5 caractères.",
      );
      return;
    }
    try {
      await cancelDay({ dayId: id, cancelReason: cancelReason.trim() });
      setIsCancelModalVisible(false);
      router.back();
    } catch (error) {
      // Géré globalement
    }
  };

  // Dérivés
  const hasNetworkError = isDayError && !day && isNetworkError(dayError);
  const registrations = registrationsData?.registrations ?? [];
  const summary = registrationsData?.summary ?? {
    registered: 0,
    attended: 0,
    noShow: 0,
    cancelled: 0,
  };

  const filteredRegistrations =
    activeRegFilter === "ALL"
      ? registrations
      : registrations.filter((r) => r.status === activeRegFilter);

  return {
    id,
    goBack,
    day,
    isLoadingDay,
    hasNetworkError,
    refetchDay,
    registrationsData,
    isLoadingReg,
    isRegError,
    regError,
    refetchReg,
    isCancelling,
    activeRegFilter,
    setActiveRegFilter,
    isCancelModalVisible,
    setIsCancelModalVisible,
    cancelReason,
    setCancelReason,
    handleMarkAttendance,
    handleCancelDay,
    confirmCancelDay,
    registrations,
    summary,
    filteredRegistrations,
  };
}
