import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function HealthLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarActiveTintColor: "#dc2626" }}
    >
      <Tabs.Screen
        name="index" // app/(health)/index.tsx
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts/index" // app/(health)/alerts/index.tsx
        options={{
          title: "Alertes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan" // app/(health)/scan.tsx
        options={{
          title: "Scanner QR",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stock" // app/(health)/stock.tsx
        options={{
          title: "Stock Sanguin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
