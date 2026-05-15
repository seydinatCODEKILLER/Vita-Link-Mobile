/**
 * Représentation d'un fichier image côté React Native.
 * expo-image-picker retourne un URI local (file:///...).
 */
export interface MobileFileField {
  uri: string;
  name: string;
  type: string;
}

interface ObjectToFormDataOptions {
  excludeNull?: boolean;
  excludeUndefined?: boolean;
  excludeEmpty?: boolean;
  fileFields?: string[];
}

/**
 * Convertit un objet en FormData compatible React Native / Expo.
 *
 * Différences vs version web :
 * - Pas de `File` ni `Blob` — React Native utilise { uri, name, type }
 * - Gère aussi les URI bruts (file:// / content://) passés en string
 * - `FormData.append` accepte { uri, name, type } nativement sur RN
 */
export const objectToFormData = (
  data: Record<string, any>,
  options: ObjectToFormDataOptions = {}
): FormData => {
  const {
    excludeNull      = true,
    excludeUndefined = true,
    excludeEmpty     = true,
    fileFields       = [],
  } = options;

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (excludeNull      && value === null)      return;
    if (excludeUndefined && value === undefined) return;
    if (excludeEmpty     && value === "")        return;

    // ── MobileFileField { uri, name, type } ─────────────────
    if (
      fileFields.includes(key) &&
      value &&
      typeof value === "object" &&
      "uri" in value
    ) {
      formData.append(key, value as any);
      return;
    }

    // ── URI brut (string) passé directement ─────────────────
    if (
      fileFields.includes(key) &&
      typeof value === "string" &&
      (value.startsWith("file://") || value.startsWith("content://"))
    ) {
      const ext      = value.split(".").pop()?.toLowerCase() ?? "jpg";
      const mimeType = ext === "png" ? "image/png" : "image/jpeg";
      formData.append(key, {
        uri:  value,
        name: `${key}.${ext}`,
        type: mimeType,
      } as any);
      return;
    }

    // ── Tableaux ─────────────────────────────────────────────
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(`${key}[]`, item));
      return;
    }

    // ── Objets imbriqués ─────────────────────────────────────
    if (typeof value === "object" && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (excludeNull      && nestedValue === null)      return;
        if (excludeUndefined && nestedValue === undefined) return;
        if (excludeEmpty     && nestedValue === "")        return;
        formData.append(`${key}[${nestedKey}]`, String(nestedValue));
      });
      return;
    }

    // ── Valeur simple ────────────────────────────────────────
    formData.append(key, String(value));
  });

  return formData;
};

/**
 * Raccourci avec les options recommandées pour le multipart.
 */
export const prepareMultipartData = (
  data: Record<string, any>,
  fileFields: string[] = []
): FormData => {
  return objectToFormData(data, {
    excludeNull:      true,
    excludeUndefined: true,
    excludeEmpty:     true,
    fileFields,
  });
};

// ──────────────────────────────────────────────────────────────
// BUILD API BODY
// ──────────────────────────────────────────────────────────────

/**
 * Construit le body d'une requête API :
 * - JSON si aucune image n'est présente
 * - multipart/form-data si une image URI est présente
 *
 * @example — Avatar
 * buildApiBody({ fullName: "Fatou", avatarUri: "file://..." }, {
 *   imageUriKey: "avatarUri",
 *   imageFieldName: "avatar",
 * })
 *
 * @example — Event sans image
 * buildApiBody({ title: "Concert", capacity: 500 }, {
 *   imageUriKey: "imageUri",
 *   imageFieldName: "image",
 * })
 * // → { body: { title, capacity }, isMultipart: false }
 */
export const buildApiBody = (
  payload: Record<string, any>,
  imageUriKey: string,
  imageFieldName: string,
): { body: FormData | Record<string, any>; isMultipart: boolean } => {
  const { [imageUriKey]: imageUri, ...rest } = payload;

  // Sans image → JSON simple
  if (!imageUri) {
    return { body: rest, isMultipart: false };
  }

  // Avec image → FormData
  const data = { ...rest, [imageFieldName]: imageUri };

  return {
    body: prepareMultipartData(data, [imageFieldName]),
    isMultipart: true,
  };
};