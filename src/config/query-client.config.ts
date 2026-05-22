import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { isNetworkError, isAuthError } from "@/src/utils/error.utils";

// ─── Helper pour extraire le message d'une erreur Axios ──────
const getErrorMessage = (err: unknown): string => {
  const e = err as any;
  return (
    e?.response?.data?.message ||
    e?.message ||
    "Une erreur inattendue est survenue"
  );
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Permet de bypass le toast global avec { meta: { silent: true } }
      if (query.meta?.silent) return;

      // Les erreurs réseau sont gérées par NetworkErrorBoundary
      if (isNetworkError(error)) return;

      // Les erreurs 401 sont gérées par l'intercepteur Axios (logout)
      if (isAuthError(error)) return;

      Toast.show({
        type: "error",
        text1: "Erreur de chargement",
        text2: getErrorMessage(error),
        visibilityTime: 4000,
      });
    },
  }),

  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Bypass si la mutation gère ses propres erreurs (onError local)
      if (mutation.options.onError) return;

      // Erreurs réseau → NetworkErrorBoundary
      if (isNetworkError(error)) return;

      // Auth → intercepteur Axios
      if (isAuthError(error)) return;

      Toast.show({
        type: "error",
        text1: "Erreur",
        text2: getErrorMessage(error),
        visibilityTime: 4000,
      });
    },
  }),

  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Pas de retry sur 4xx (sauf 429)
        const status = (error as any)?.response?.status;
        if (status && status >= 400 && status < 500 && status !== 429) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});
