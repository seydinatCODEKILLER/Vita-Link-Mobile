import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DonorLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#dc2626" }}>
      <Tabs.Screen
        name="index" // app/(donor)/index.tsx
        options={{
          title: "Alertes",
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="jambaar/index" // app/(donor)/jambaar/index.tsx
        options={{
          title: "Jambaar",
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="donations" // app/(donor)/donations.tsx
        options={{
          title: "Mes Dons",
          tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index" // app/(donor)/profile/index.tsx
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}