import { View, ActivityIndicator, Text } from "react-native";

export function SplashScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center gap-4">
      <View className="w-20 h-20 bg-red-600 rounded-3xl items-center justify-center">
        <Text className="text-white font-bold text-4xl">🩸</Text>
      </View>
      <Text className="text-3xl font-bold text-gray-900">
        Vita<Text className="text-red-600">Link</Text>
      </Text>
      <ActivityIndicator color="#dc2626" className="mt-4" />
    </View>
  );
}
