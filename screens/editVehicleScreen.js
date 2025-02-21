import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function EditVehicleScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;

  const [vehicleData, setVehicleData] = useState({
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
  });

  const handleSave = async () => {
    // Validate inputs
    if (
      !vehicleData.name.trim() ||
      !vehicleData.make.trim() ||
      !vehicleData.model.trim()
    ) {
      alert(t("common.error.required"));
      return;
    }

    // Here you would save the updated vehicle data
    // For now, just go back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Surface style={styles.headerCard}>
          {/* <Text style={styles.headerText}>{t("vehicles.edit")}</Text> */}
          <Text style={styles.headerSubtext}>
            {vehicle.make} {vehicle.model}
          </Text>
        </Surface>

        <Surface style={styles.formCard}>
          <TextInput
            label={t("vehicles.name")}
            value={vehicleData.name}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, name: text })
            }
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label={t("vehicles.make")}
            value={vehicleData.make}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, make: text })
            }
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label={t("vehicles.model")}
            value={vehicleData.model}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, model: text })
            }
            style={styles.input}
            mode="outlined"
          />
        </Surface>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.cancelButton]}
        >
          {t("common.cancel")}
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.button, styles.saveButton]}
        >
          {t("common.save")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerCard: {
    padding: 24,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 16,
    color: "#495057",
  },
  formCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 8,
    backgroundColor: "#f8f9fa",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    borderColor: "#495057",
  },
  saveButton: {
    backgroundColor: "#6c757d",
  },
});
