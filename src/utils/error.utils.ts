// ─── Détecte une erreur réseau (pas de réponse serveur) ──────
export const isNetworkError = (error: unknown): boolean => {
  const e = error as any;
  return !e?.response && !!e?.message;
};

// ─── Détecte une erreur d'authentification (401) ─────────────
export const isAuthError = (error: unknown): boolean => {
  const e = error as any;
  return e?.response?.status === 401;
};

// ─── Extrait le message lisible d'une erreur Axios ───────────
export const getErrorMessage = (error: unknown): string => {
  const e = error as any;
  return (
    e?.response?.data?.message ||
    e?.message ||
    "Une erreur inattendue est survenue"
  );
};

// ─── Extrait le status HTTP ───────────────────────────────────
export const getHttpStatus = (error: unknown): number | null => {
  const e = error as any;
  return e?.response?.status ?? null;
};