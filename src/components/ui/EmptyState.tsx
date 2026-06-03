import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}

export const EmptyState = ({ icon, title, subtitle }: EmptyStateProps) => {
  const colors = useColors();

  const styles = useThemedStyles((c) => ({
    container: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      paddingTop: 80,
      paddingBottom: 40,
    },
    // Anneaux décoratifs
    ring1: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: c.red + "18",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    ring2: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 1,
      borderColor: c.red + "25",
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrap: {
      width: 54,
      height: 54,
      borderRadius: 16,
      backgroundColor: c.redGlow,
      borderWidth: 1,
      borderColor: c.red + "30",
      alignItems: "center",
      justifyContent: "center",
    },
    textBlock: {
      alignItems: "center",
      gap: 8,
    },
    title: {
      color: c.white,
      fontSize: 17,
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: -0.3,
    },
    subtitle: {
      color: c.textMuted,
      fontSize: 13,
      textAlign: "center",
      lineHeight: 20,
      maxWidth: 240,
    },
    divider: {
      width: 32,
      height: 1,
      backgroundColor: c.red + "25",
      marginVertical: 4,
    },
  }));

  return (
    <View style={styles.container}>
      {/* Anneaux concentriques */}
      <View style={styles.ring1}>
        <View style={styles.ring2}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={26} color={colors.red} />
          </View>
        </View>
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
};
