import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  bg: "#080808",
  red: "#DC1E1E",
  white: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.45)",
  inputBg: "#141414",
  sheetBg: "#111111",
  inputBorder: "rgba(255,255,255,0.10)",
  inputBorderFocused: "#DC1E1E",
  inputBorderError: "#EF4444",
  placeholder: "rgba(255,255,255,0.25)",
  errorText: "#EF4444",
  searchBg: "rgba(255,255,255,0.06)",
  searchBorder: "rgba(255,255,255,0.10)",
  divider: "rgba(255,255,255,0.06)",
} as const;

interface FormSelectProps {
  label?: string;
  sublabel?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  value: string | undefined;
  options: readonly string[];
  onSelect: (value: string) => void;
  searchable?: boolean;
  modalTitle?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  sublabel,
  error,
  icon,
  placeholder = "Sélectionner...",
  value,
  options,
  onSelect,
  searchable = true,
  modalTitle = "Sélectionner",
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  // ── Animation bottom sheet ──
  const slideAnim = useRef(new Animated.Value(500)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const openSheet = () => {
    setVisible(true);
    setSearch("");
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 22,
        stiffness: 280,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setSearch("");
    });
  };

  const handleSelect = (item: string) => {
    onSelect(item);
    closeSheet();
  };

  const filtered = search.trim()
    ? (options as string[]).filter((o) =>
        o.toLowerCase().includes(search.toLowerCase()),
      )
    : (options as string[]);

  const borderColor = error
    ? COLORS.inputBorderError
    : visible
      ? COLORS.inputBorderFocused
      : COLORS.inputBorder;

  const iconColor = error
    ? COLORS.inputBorderError
    : visible
      ? COLORS.red
      : COLORS.textMuted;

  return (
    <View style={styles.wrapper}>
      {/* ── Label ── */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
        </View>
      )}

      {/* ── Trigger ── */}
      <TouchableOpacity
        onPress={openSheet}
        activeOpacity={0.75}
        style={[
          styles.trigger,
          { borderColor },
          visible && styles.triggerFocused,
          !!error && styles.triggerError,
        ]}
      >
        {icon && (
          <View style={styles.triggerIcon}>
            <Ionicons name={icon} size={17} color={iconColor} />
          </View>
        )}

        <Text
          style={[
            styles.triggerText,
            { color: value ? COLORS.white : COLORS.placeholder },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        {/* Chevron animé */}
        <View style={[styles.chevronWrap, visible && styles.chevronWrapActive]}>
          <Ionicons
            name="chevron-down"
            size={15}
            color={visible ? COLORS.red : COLORS.textMuted}
          />
        </View>
      </TouchableOpacity>

      {/* ── Erreur ── */}
      {error && (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle-outline"
            size={13}
            color={COLORS.errorText}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Bottom Sheet Modal ── */}
      <Modal visible={visible} transparent statusBarTranslucent>
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={closeSheet}>
          <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{modalTitle}</Text>
            <TouchableOpacity
              onPress={closeSheet}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Recherche */}
          {searchable && (
            <View style={styles.searchWrapper}>
              <Ionicons
                name="search-outline"
                size={15}
                color={COLORS.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor={COLORS.placeholder}
                value={search}
                onChangeText={setSearch}
                selectionColor={COLORS.red}
                cursorColor={COLORS.red}
                autoCorrect={false}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={16}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Compteur */}
          {search.trim() && (
            <Text style={styles.resultCount}>
              {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
            </Text>
          )}

          {/* Liste */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>Aucun résultat</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = item === value;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  {/* Dot indicateur */}
                  <View
                    style={[
                      styles.optionDot,
                      isSelected && styles.optionDotSelected,
                    ]}
                  />

                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>

                  {isSelected && (
                    <View style={styles.checkWrap}>
                      <Ionicons name="checkmark" size={14} color={COLORS.red} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },

  // ── Label ──
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  sublabel: {
    color: "rgba(255,255,255,0.28)",
    fontSize: 12,
  },

  // ── Trigger ──
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  triggerFocused: {
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  triggerError: {
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  triggerIcon: {
    paddingLeft: 4,
    paddingRight: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 15,
    paddingLeft: 4,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  chevronWrapActive: {
    backgroundColor: "rgba(220,30,30,0.10)",
    borderColor: "rgba(220,30,30,0.22)",
  },

  // ── Erreur ──
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
    marginLeft: 2,
  },
  errorText: {
    color: COLORS.errorText,
    fontSize: 12,
    flex: 1,
  },

  // ── Overlay ──
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
  },

  // ── Sheet ──
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.sheetBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255,255,255,0.08)",
    maxHeight: "72%",
    paddingBottom: 32,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  // ── Sheet header ──
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Search ──
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.searchBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.searchBorder,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
    padding: 0,
  },

  // ── Compteur ──
  resultCount: {
    color: COLORS.textMuted,
    fontSize: 11,
    paddingHorizontal: 22,
    marginBottom: 6,
  },

  // ── Liste ──
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },

  // ── Option ──
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  optionSelected: {
    backgroundColor: "rgba(220,30,30,0.08)",
  },
  optionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  optionDotSelected: {
    backgroundColor: COLORS.red,
  },
  optionText: {
    flex: 1,
    color: "rgba(255,255,255,0.65)",
    fontSize: 15,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: "700",
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: "rgba(220,30,30,0.15)",
    borderWidth: 1,
    borderColor: "rgba(220,30,30,0.30)",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Empty ──
  emptyWrap: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
});
