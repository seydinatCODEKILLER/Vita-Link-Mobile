import { Redirect } from "expo-router";
import { useIsAuthenticated, useUserRole } from "@/src/hooks/useAuthStore";

export default function Index() {
  const isAuthenticated = useIsAuthenticated();
  const role = useUserRole();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (role === "ADMIN") {
    return <Redirect href="/unauthorized" />;
  }

  if (role === "HEALTH_STRUCTURE") {
    return <Redirect href="/(health)" />;
  }

  return <Redirect href="/(donor)" />;
}
