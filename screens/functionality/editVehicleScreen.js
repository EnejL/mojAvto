import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { TextInput, Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { updateVehicle, deleteVehicle } from "../../utils/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditVehicleScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;
  const [saving, setSaving] = useState(false);

  const [vehicleData, setVehicleData] = useState({
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    numberPlate: vehicle.numberPlate || "",
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

    setSaving(true);
    try {
      // Update vehicle in Firestore
      await updateVehicle(vehicle.id, {
        name: vehicleData.name.trim(),
        make: vehicleData.make.trim(),
        model: vehicleData.model.trim(),
        numberPlate: vehicleData.numberPlate.trim(),
      });

      // Navigate back to MyVehiclesMain
      navigation.navigate("MyVehiclesMain");
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert(t("common.error.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t("common.delete"), t("vehicles.deleteConfirmMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await deleteVehicle(vehicle.id);
            navigation.navigate("MyVehiclesMain");
          } catch (error) {
            console.error("Error deleting vehicle:", error);
            alert(t("common.error.delete"));
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
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
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.name")}</Text>
              <Text style={styles.requiredLabel}>*</Text>
            </View>
            <TextInput
              label={t("vehicles.name")}
              value={vehicleData.name}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, name: text })
              }
              style={styles.input}
              mode="outlined"
              disabled={saving}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.make")}</Text>
              <Text style={styles.requiredLabel}>*</Text>
            </View>
            <TextInput
              label={t("vehicles.make")}
              value={vehicleData.make}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, make: text })
              }
              style={styles.input}
              mode="outlined"
              disabled={saving}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.model")}</Text>
              <Text style={styles.requiredLabel}>*</Text>
            </View>
            <TextInput
              label={t("vehicles.model")}
              value={vehicleData.model}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, model: text })
              }
              style={styles.input}
              mode="outlined"
              disabled={saving}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t("vehicles.numberPlate")}</Text>
            <TextInput
              label={t("vehicles.numberPlate")}
              value={vehicleData.numberPlate}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, numberPlate: text })
              }
              style={styles.input}
              mode="outlined"
              disabled={saving}
            />
          </View>
        </Surface>

        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.deleteButton}
          labelStyle={styles.deleteButtonLabel}
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="trash-can"
              size={size}
              color={color}
            />
          )}
        >
          {t("common.delete")}
        </Button>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={[styles.button, styles.cancelButton]}
          disabled={saving}
        >
          {t("common.cancel")}
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={[styles.button, styles.saveButton]}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="white" /> : t("common.save")}
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
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: "row",
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
  },
  requiredLabel: {
    color: "red",
    marginLeft: 4,
  },
  input: {
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  deleteButton: {
    margin: 16,
    marginTop: 24,
    borderColor: "#d32f2f",
    backgroundColor: "transparent",
  },
  deleteButtonLabel: {
    fontSize: 16,
    paddingVertical: 4,
    color: "#d32f2f",
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
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
});
