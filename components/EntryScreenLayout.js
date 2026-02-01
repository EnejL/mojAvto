import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { Button, Surface, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export const ENTRY_COLORS = {
  bg: "#0B141E",
  surface: "#1C242D",
  border: "#2B3845",
  text: "#EAF1FA",
  muted: "#AAB6C4",
  placeholder: "#7D8A99",
  blue: "#1B84FF",
  danger: "#ff4d4f",
};

export const EntryTitle = ({ children }) => (
  <Text style={styles.title}>{children}</Text>
);

export const EntryCard = ({ children, style }) => (
  <Surface style={[styles.card, style]}>{children}</Surface>
);

export const EntryDivider = () => <View style={styles.divider} />;

export const EntryLabelRow = ({ label, right, allowWrap = false, required = false }) => (
  <View style={styles.fieldHeaderRow}>
    <View style={styles.labelContainer}>
      <Text style={styles.label} numberOfLines={allowWrap ? undefined : 1} ellipsizeMode={allowWrap ? undefined : "tail"}>
        {label}
        {required ? <Text style={styles.requiredAsterisk}> *</Text> : null}
      </Text>
    </View>
    {right ? <View style={styles.labelRight}>{right}</View> : null}
  </View>
);

export const EntryPill = ({ children, tone = "info" }) => (
  <View
    style={[
      styles.pill,
      tone === "danger" ? styles.pillDanger : styles.pillInfo,
    ]}
  >
    <Text
      style={[
        styles.pillText,
        tone === "danger" ? styles.pillTextDanger : styles.pillTextInfo,
      ]}
    >
      {children}
    </Text>
  </View>
);

export function EntryScreenLayout({
  title,
  children,
  bottom,
  scrollRef,
  contentContainerStyle,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          contentContainerStyle,
          { paddingBottom: 140 + Math.max(insets.bottom, 12) },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {title ? <EntryTitle>{title}</EntryTitle> : null}
        {children}
      </KeyboardAwareScrollView>

      {bottom ? (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: 12 },
          ]}
        >
          {bottom}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENTRY_COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: ENTRY_COLORS.text,
    textAlign: "center",
    marginBottom: 18,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: ENTRY_COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ENTRY_COLORS.border,
    padding: 18,
    marginBottom: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#15202B",
    marginVertical: 12,
    opacity: 0.9,
  },
  labelContainer: {
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
    minWidth: 0,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: ENTRY_COLORS.text,
  },
  requiredAsterisk: {
    color: ENTRY_COLORS.danger,
    fontWeight: "700",
  },
  fieldHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelRight: {
    flexShrink: 0,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  pillInfo: {
    backgroundColor: "rgba(27, 132, 255, 0.14)",
    borderColor: "rgba(27, 132, 255, 0.35)",
  },
  pillDanger: {
    backgroundColor: "rgba(255, 77, 79, 0.14)",
    borderColor: "rgba(255, 77, 79, 0.35)",
  },
  pillText: {
    fontSize: 14,
    fontWeight: "800",
  },
  pillTextInfo: {
    color: ENTRY_COLORS.blue,
  },
  pillTextDanger: {
    color: ENTRY_COLORS.danger,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: ENTRY_COLORS.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#15202B",
  },
});


