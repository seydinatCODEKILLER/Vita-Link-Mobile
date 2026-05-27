import { useLocalSearchParams, useRouter, Href } from "expo-router";

interface UseSmartBackOptions {
  defaultRoute: Href;
  routeMap?: Record<string, Href>;
}

export function useSmartBack({ defaultRoute, routeMap }: UseSmartBackOptions) {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const goBack = () => {
    const safeFrom = Array.isArray(from) ? from[0] : from;

    if (safeFrom && routeMap && routeMap[safeFrom]) {
      router.replace(routeMap[safeFrom]);
      return;
    }

    router.replace(defaultRoute);
  };

  return goBack;
}
