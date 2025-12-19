import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const COLORS = {
  bg: "#0B141E",
  surface: "#1C242D",
  surfaceMuted: "#15202B",
  border: "#2B3845",
  text: "#EAF1FA",
  muted: "#AAB6C4",
  placeholder: "#7D8A99",
  blue: "#1B84FF",
  blueMuted: "#0E2E4D",
};

const ICON_BY_TYPE = {
  ICE: "gas-station",
  HYBRID: "car-electric-outline",
  PHEV: "power-plug-outline",
  BEV: "lightning-bolt",
};

function prettyLabel(label) {
  if (typeof label !== "string") return label;
  // Helps match the mock by breaking long “(…)” labels into a second line.
  return label.replace(" (", "\n(");
}

export default function VehicleTypeSelector({
  value,
  onChange,
  disabled = false,
  options,
}) {
  return (
    <View style={styles.grid}>
      {options.map((opt) => {
        const selected = opt.value === value;
        const iconName = ICON_BY_TYPE[opt.value] || "car";
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange?.(opt.value)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.card,
              selected && styles.cardSelected,
              disabled && styles.cardDisabled,
              pressed && !disabled && styles.cardPressed,
            ]}
          >
            <View
              style={[
                styles.iconBubble,
                selected && styles.iconBubbleSelected,
              ]}
            >
              <MaterialCommunityIcons
                name={iconName}
                size={26}
                color={selected ? COLORS.blue : COLORS.muted}
              />
            </View>

            {selected && (
              <View style={styles.checkBadge}>
                <MaterialCommunityIcons name="check" size={16} color="#fff" />
              </View>
            )}

            <Text style={[styles.label, selected && styles.labelSelected]}>
              {prettyLabel(opt.label)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    minHeight: 132,
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  cardSelected: {
    borderColor: COLORS.blue,
    backgroundColor: COLORS.blueMuted,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconBubble: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceMuted,
  },
  iconBubbleSelected: {
    backgroundColor: "#0A3A63",
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    color: COLORS.muted,
  },
  labelSelected: {
    color: COLORS.blue,
  },
});


