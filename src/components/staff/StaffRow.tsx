import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors, useThemedStyles } from "@/src/theme/useTheme";
import { StaffMember } from "@/src/types/healthStructure.type";
import { getAvatarColors, getRoleConfig } from "@/src/constants/staffConfig";

interface StaffRowProps {
  member: StaffMember;
  avatarColorIndex: number;
  isDirector: boolean;
  onDelete: (id: string, name: string) => void;
}

export function StaffRow({
  member,
  avatarColorIndex,
  isDirector,
  onDelete,
}: StaffRowProps) {
  const colors = useColors(); // ← Autonome
  const AVATAR_COLORS = getAvatarColors(colors);
  const ROLE_CONFIG = getRoleConfig(colors);

  const roleConf = ROLE_CONFIG[member.role] ?? {
    label: "Agent",
    color: colors.textMuted,
  };
  const isAdmin = member.isStructureAdmin;
  const avatarColor = isAdmin
    ? { bg: colors.amber + "14", text: colors.amber }
    : AVATAR_COLORS[avatarColorIndex % AVATAR_COLORS.length];
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase();

  const styles = useThemedStyles((c) => ({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      backgroundColor: c.cardBg,
      borderRadius: 16,
      borderWidth: 0.5,
      borderColor: c.cardBorder,
      padding: 13,
      marginBottom: 9,
    },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    avatarText: { fontSize: 16, fontWeight: "900" },
    info: { flex: 1, gap: 3 },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      flexWrap: "wrap",
    },
    name: { color: c.white, fontSize: 15, fontWeight: "700" },
    directorPill: {
      backgroundColor: c.amber + "13",
      borderWidth: 0.5,
      borderColor: c.amber + "30",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    directorPillText: { color: c.amber, fontSize: 10, fontWeight: "700" },
    email: { color: c.textMuted, fontSize: 12 },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: c.red + "08",
      borderWidth: 0.5,
      borderColor: c.red + "22",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    roleBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
      backgroundColor: roleConf.color + "13",
      borderWidth: 0.5,
      borderColor: roleConf.color + "30",
    },
    roleText: { color: roleConf.color, fontSize: 10, fontWeight: "700" },
  }));

  return (
    <View style={styles.card}>
      <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
        <Text style={[styles.avatarText, { color: avatarColor.text }]}>
          {initials}
        </Text>
      </View>

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {member.firstName} {member.lastName}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{roleConf.label}</Text>
          </View>
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {member.email}
        </Text>
      </View>

      {!isAdmin && isDirector && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() =>
            onDelete(member.id, `${member.firstName} ${member.lastName}`)
          }
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={colors.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}
