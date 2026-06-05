import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "VitaLink",
  slug: "Vita-Link-Mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "vitalinkmobile",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  updates: {
    url: "https://u.expo.dev/d7a0faeb-fe87-4418-b24c-394df580ca71",
  },
  runtimeVersion: {
    policy: "appVersion",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "sn.vitalink.mobile",
  },
  android: {
    package: "sn.vitalink.mobile",
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/icon.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "@react-native-community/datetimepicker",
     "expo-font",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        dark: {
          backgroundColor: "#000000",
        },
      },
    ],
    "expo-secure-store",
    "expo-brightness",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Vita-Link a besoin de votre position pour vous alerter des besoins en sang à proximité.",
        locationWhenInUsePermission:
          "Vita-Link a besoin de votre position pour vous alerter des besoins en sang à proximité.",
      },
    ],
    [
      "expo-notifications",
      {
        color: "#DC1E1E",
        defaultChannel: "default",
        sounds: [],
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api",
    socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:3000",
    eas: {
      projectId: "d7a0faeb-fe87-4418-b24c-394df580ca71",
    },
  },
});
