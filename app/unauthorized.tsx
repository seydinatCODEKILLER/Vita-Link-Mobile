import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogout } from "@/src/hooks/useAuth";

const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
};

export default function UnauthorizedScreen() {
  const router = useRouter();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View className="flex-1 items-center justify-center px-8 gap-6">
        {/* Icône */}
        <View className="w-24 h-24 rounded-full bg-red-600/10 items-center justify-center border border-red-600/20">
          <Ionicons
            name="shield-checkmark-outline"
            size={48}
            color={COLORS.red}
          />
        </View>

        {/* Textes */}
        <View className="items-center gap-3">
          <Text className="text-2xl font-bold text-white">
            Accès non autorisé
          </Text>
          <Text className="text-base text-center text-gray-400 leading-6 max-w-[300px]">
            L&apos;application mobile Vita-Link est réservée aux donneurs et aux
            structures de santé.
          </Text>
          <Text className="text-sm text-center text-gray-500 leading-6 max-w-[280px]">
            En tant qu&apos;administrateur, veuillez utiliser le tableau de bord
            web pour gérer la plateforme.
          </Text>
        </View>

        {/* Bouton Déconnexion */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={isPending}
          className="mt-6 w-full max-w-[260px] rounded-2xl py-4 px-3 flex-row items-center justify-center gap-2.5 border border-red-600/30 bg-red-600/10"
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.red} />
          <Text className="text-red-500 font-bold text-base">
            Se déconnecter
          </Text>
        </TouchableOpacity>

        {/* Retour à l'accueil (au cas où) */}
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text className="text-gray-500 text-sm mt-2">Retour</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
