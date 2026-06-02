import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBloodRequests } from "@/src/hooks/useBloodRequests";
import { useColors } from "@/src/theme/useTheme";
import { NetworkErrorScreen } from "@/src/components/ui/NetworkErrorScreen";
import { isNetworkError } from "@/src/utils/error.utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

export default function HospitalDetailScreen() {
  const { id, name, status, address, region } = useLocalSearchParams<{
    id: string;
    name: string;
    status: string;
    address: string;
    region: string;
  }>();
  const router = useRouter();
  const colors = useColors();

  // On réutilise le hook des demandes en filtrant par l'ID de l'hôpital
  // Côté backend, getRequests renvoie les demandes selon le rôle.
  // Pour voir les demandes d'un hôpital spécifique, il faut que le backend
  // accepte un filtre hospitalId (ou alors on filtre côté client).
  // Ici on suppose qu'on filtre côté client pour l'instant :
  const { data, isLoading, isError, error, refetch } = useBloodRequests();

  const hospitalRequests =
    data?.requests.filter((r) => r.requestingHospital.id === id) ?? [];

  const isVerified = status === "VERIFIED";

  if (isLoading)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.red} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  if (isError && isNetworkError(error))
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        <NetworkErrorScreen onRetry={refetch} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.bg }}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.cardBg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={18} color={colors.white} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.white,
              fontSize: 18,
              fontWeight: "800",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>

        {/* Info Card */}
        <View
          style={{
            backgroundColor: colors.cardBg,
            borderRadius: 18,
            borderWidth: 0.5,
            borderColor: colors.cardBorder,
            padding: 18,
            gap: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 20, fontWeight: "700" }}
            >
              Informations
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: isVerified
                  ? colors.success + "14"
                  : colors.amber + "14",
              }}
            >
              <Ionicons
                name={isVerified ? "shield-checkmark" : "time-outline"}
                size={10}
                color={isVerified ? colors.success : colors.amber}
              />
              <Text
                style={{
                  color: isVerified ? colors.success : colors.amber,
                  fontSize: 10,
                  fontWeight: "700",
                }}
              >
                {isVerified ? "Vérifié" : "En attente"}
              </Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="location-outline" size={14} color={colors.red} />
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {address}, {region}
              </Text>
            </View>
          </View>
        </View>

        {/* Historique des demandes */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              color: colors.textSubtle,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 1.5,
            }}
          >
            HISTORIQUE DES DEMANDES
          </Text>

          {hospitalRequests.length === 0 ? (
            <View
              style={{
                alignItems: "center",
                padding: 30,
                backgroundColor: colors.cardBg,
                borderRadius: 14,
                borderWidth: 0.5,
                borderColor: colors.cardBorder,
              }}
            >
              <Ionicons
                name="document-text-outline"
                size={32}
                color={colors.textSubtle}
              />
              <Text
                style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}
              >
                Aucune demande de sang
              </Text>
            </View>
          ) : (
            hospitalRequests.map((req) => (
              <TouchableOpacity
                key={req.id}
                onPress={() =>
                  router.push(`/(health)/blood-requests/${req.id}`)
                }
                style={{
                  backgroundColor: colors.cardBg,
                  borderRadius: 12,
                  borderWidth: 0.5,
                  borderColor: colors.cardBorder,
                  padding: 12,
                  gap: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      color: colors.red,
                      fontWeight: "800",
                      fontSize: 16,
                    }}
                  >
                    {req.bloodType.replace("_", "")}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                    {dayjs(req.createdAt).fromNow()}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 13 }}>
                    {req.quantityNeeded} poches
                  </Text>
                  <Text
                    style={{
                      color:
                        req.status === "PENDING"
                          ? colors.amber
                          : colors.success,
                      fontSize: 11,
                      fontWeight: "600",
                    }}
                  >
                    {req.status === "PENDING"
                      ? "En attente"
                      : req.status.replace("_", " ")}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
