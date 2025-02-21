// screens/VehicleConsumptionScreen.js
import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function VehicleDetailsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;

  return (
    <View style={styles.container}>
      <ScrollView>
        <Surface style={styles.headerCard}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleSubtitle}>
            {vehicle.make} {vehicle.model}
          </Text>
        </Surface>

        <Surface style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("vehicles.make")}</Text>
            <Text style={styles.detailValue}>{vehicle.make}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("vehicles.model")}</Text>
            <Text style={styles.detailValue}>{vehicle.model}</Text>
          </View>
        </Surface>

        {/* You could add more sections here like:
        - Total distance driven
        - Date added
        - Number of fuel fillings
        - etc. */}
      </ScrollView>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("EditVehicle", { vehicle })}
        style={styles.editButton}
      >
        {t("vehicles.edit")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerCard: {
    padding: 24,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  detailsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  editButton: {
    margin: 16,
    paddingVertical: 6,
  },
});
