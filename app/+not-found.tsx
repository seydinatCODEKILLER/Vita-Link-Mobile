import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NotFound() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center px-8 relative overflow-hidden">
      {/* ─── Effet de profondeur : Gros 404 fantôme en arrière-plan ─── */}
      <View className="absolute inset-0 items-center justify-center opacity-[0.03]">
        <Text className="text-[200px] font-black text-red-600 leading-none select-none">
          404
        </Text>
      </View>

      {/* ─── Contenu principal ─── */}
      <View className="items-center gap-6 relative z-10">
        {/* Branding (Identique au SplashScreen pour la continuité) */}
        <View className="items-center gap-4 mb-8">
          <View
            className="w-20 h-20 bg-gray-200 rounded-3xl items-center justify-center"
            style={{
              shadowColor: "#dc2626",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text className="text-white font-bold text-4xl">🩸</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900">
            Vita<Text className="text-red-600">Link</Text>
          </Text>
        </View>

        {/* Message d'erreur */}
        <View className="items-center gap-3">
          <Text className="text-6xl font-black text-red-600 tracking-tight">
            404
          </Text>
          <Text className="text-gray-900 font-bold text-xl tracking-tight">
            Oups, page introuvable
          </Text>
          <Text className="text-gray-500 text-sm text-center leading-6 max-w-[280px]">
            Il semblerait que la page que vous cherchez n’existe pas ou ait été
            déplacée.
          </Text>
        </View>

        {/* Bouton d'action Premium */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
          activeOpacity={0.8}
          className="mt-4 w-full max-w-[260px] rounded-2xl py-4 px-3 flex-row items-center justify-center gap-2.5 bg-red-600 overflow-hidden"
          style={{
            shadowColor: "#dc2626",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <Ionicons name="home-outline" size={22} color="white" />
          <Text className="text-white font-extrabold text-base tracking-wide">
            Retour à l’accueil
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
