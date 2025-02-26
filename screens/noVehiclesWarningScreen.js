import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { Button } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function NoVehiclesWarningScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.warningText}>{t("fillings.noVehiclesWarning")}</Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddVehicle")}
        style={styles.addButton}
        labelStyle={styles.buttonLabel}
      >
        {t("vehicles.addFirst")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  warningText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    width: "100%",
    borderRadius: 8,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
