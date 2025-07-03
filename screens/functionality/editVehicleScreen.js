import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { TextInput, Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { updateVehicle, deleteVehicle } from "../../utils/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from 'react-native-element-dropdown';
import AutocompleteInput from "../../components/AutocompleteInput";
import { fetchCarBrands, fetchCarModels } from "../../utils/carData";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function EditVehicleScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;
  const [saving, setSaving] = useState(false);

  const [vehicleData, setVehicleData] = useState({
    name: vehicle.name,
    make: vehicle.make,
    model: vehicle.model,
    numberPlate: vehicle.numberPlate || "",
    vehicleType: vehicle.vehicleType || "ICE", // Default to ICE if not set
    fuelTankSize: vehicle.fuelTankSize ? vehicle.fuelTankSize.toString() : "",
    batteryCapacity: vehicle.batteryCapacity ? vehicle.batteryCapacity.toString() : "",
  });

  const [carBrands, setCarBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Vehicle type options for Dropdown
  const vehicleTypeOptions = [
    { label: 'ICE (Internal Combustion Engine)', value: 'ICE' },
    { label: 'Hybrid (Gasoline + Electric)', value: 'HYBRID' },
    { label: 'PHEV (Plug-in Hybrid Electric)', value: 'PHEV' },
    { label: 'BEV (Battery Electric Vehicle)', value: 'BEV' },
  ];

  useEffect(() => {
    const loadCarBrands = async () => {
      setLoadingBrands(true);
      try {
        const brands = await fetchCarBrands();
        setCarBrands(brands);
      } catch (error) {
        console.error("Failed to load car brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };

    loadCarBrands();
  }, []);

  const handleBrandSelection = (brand) => {
    setVehicleData({ ...vehicleData, make: brand, model: "" });

    fetchModelsForBrand(brand);
  };

  const fetchModelsForBrand = async (brand) => {
    if (!brand) return;

    try {
      console.log(`Fetching models for selected brand: ${brand}`);
      const models = await fetchCarModels(brand);
      if (Array.isArray(models) && models.length > 0) {
        console.log(`Found ${models.length} models for ${brand}`);
        setCarModels(models);
      } else {
        console.log(`No models found for ${brand}`);
        setCarModels([]);
      }
    } catch (error) {
      console.error("Failed to load car models:", error);
      setCarModels([]);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    if (
      !vehicleData.make.trim() ||
      !vehicleData.model.trim() ||
      !vehicleData.vehicleType
    ) {
      alert(t("common.error.required"));
      return;
    }

    setSaving(true);
    try {
      // Create update object
      const updateData = {
        name: vehicleData.name.trim() || vehicleData.make.trim(),
        make: vehicleData.make.trim(),
        model: vehicleData.model.trim(),
        numberPlate: vehicleData.numberPlate.trim(),
        vehicleType: vehicleData.vehicleType,
      };

      // Add optional fields based on vehicle type
      if (vehicleData.vehicleType === 'ICE' || vehicleData.vehicleType === 'HYBRID' || vehicleData.vehicleType === 'PHEV') {
        if (vehicleData.fuelTankSize.trim()) {
          updateData.fuelTankSize = parseFloat(vehicleData.fuelTankSize.replace(',', '.'));
        } else {
          updateData.fuelTankSize = null;
        }
      } else {
        updateData.fuelTankSize = null;
      }

      if (vehicleData.vehicleType === 'BEV' || vehicleData.vehicleType === 'PHEV') {
        if (vehicleData.batteryCapacity.trim()) {
          updateData.batteryCapacity = parseFloat(vehicleData.batteryCapacity.replace(',', '.'));
        } else {
          updateData.batteryCapacity = null;
        }
      } else {
        updateData.batteryCapacity = null;
      }

      // Update vehicle in Firestore
      await updateVehicle(vehicle.id, updateData);

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

  const renderRequiredLabel = () => <Text style={styles.requiredLabel}>*</Text>;

  // Helper functions to determine what fields to show
  const shouldShowFuelTankSize = () => {
    return vehicleData.vehicleType === 'ICE' || vehicleData.vehicleType === 'HYBRID' || vehicleData.vehicleType === 'PHEV';
  };

  const shouldShowBatteryCapacity = () => {
    return vehicleData.vehicleType === 'BEV' || vehicleData.vehicleType === 'PHEV';
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={Platform.OS === 'ios' ? 120 : 140}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
        <Surface style={styles.headerCard}>
          <Text style={styles.headerSubtext}>
            {vehicle.make} {vehicle.model}
          </Text>
        </Surface>

        <Surface style={styles.formCard}>
            <View style={[styles.inputContainer, { zIndex: 5 }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.name")}</Text>
            </View>
            <TextInput
              value={vehicleData.name}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, name: text })
              }
              style={styles.input}
              mode="outlined"
              disabled={saving}
            />
          </View>

            <View style={[styles.inputContainer, { zIndex: 4 }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.make")}</Text>
              {renderRequiredLabel()}
            </View>
            <AutocompleteInput
              value={vehicleData.make}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, make: text, model: "" })
              }
              onSelectSuggestion={handleBrandSelection}
              suggestions={carBrands}
              disabled={saving || loadingBrands}
              required={true}
              label=""
              placeholder={t("vehicles.makePlaceholder")}
                containerStyle={{ zIndex: 4 }}
            />
          </View>

            <View style={[styles.inputContainer, { zIndex: 3 }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.model")}</Text>
              {renderRequiredLabel()}
            </View>
              {carModels.length > 0 ? (
                <AutocompleteInput
                  value={vehicleData.model}
                  onChangeText={(text) =>
                    setVehicleData({ ...vehicleData, model: text })
                  }
                  suggestions={carModels}
                  disabled={saving || !vehicleData.make}
                  required={true}
                  label=""
                  placeholder={
                    !vehicleData.make ? t("vehicles.modelPlaceholder") : ""
                  }
                  containerStyle={{ zIndex: 3 }}
                />
              ) : (
            <TextInput
              value={vehicleData.model}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, model: text })
              }
              style={styles.input}
              mode="outlined"
              disabled={saving || !vehicleData.make}
              placeholder={
                !vehicleData.make ? t("vehicles.modelPlaceholder") : ""
              }
            />
              )}
          </View>

            <View style={[styles.inputContainer, { zIndex: 2 }]}>
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
              placeholder={t("vehicles.numberPlate")}
            />
          </View>

          {/* Vehicle Type Selector */}
          <View style={[styles.inputContainer, { zIndex: 1 }]}>
            <View style={styles.labelContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.vehicleType")}</Text>
              {renderRequiredLabel()}
            </View>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={vehicleTypeOptions}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select vehicle type"
              value={vehicleData.vehicleType}
              onChange={(item) => setVehicleData({ ...vehicleData, vehicleType: item.value })}
              disable={saving}
            />
          </View>

          {/* Conditional Fields */}
          {shouldShowFuelTankSize() && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.fuelTankSize")} (L)</Text>
              <TextInput
                value={vehicleData.fuelTankSize}
                onChangeText={(text) =>
                  setVehicleData({ ...vehicleData, fuelTankSize: text })
                }
                style={styles.input}
                disabled={saving}
                mode="outlined"
                keyboardType="numeric"
                placeholder="e.g. 60"
              />
            </View>
          )}

          {shouldShowBatteryCapacity() && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t("vehicles.batteryCapacity")} (kWh)</Text>
              <TextInput
                value={vehicleData.batteryCapacity}
                onChangeText={(text) =>
                  setVehicleData({ ...vehicleData, batteryCapacity: text })
                }
                style={styles.input}
                disabled={saving}
                mode="outlined"
                keyboardType="numeric"
                placeholder="e.g. 75"
              />
            </View>
          )}
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
          {t("vehicles.deleteVehicle")}
        </Button>

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
      </TouchableWithoutFeedback>
    </KeyboardAwareScrollView>
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
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    marginTop: 8,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  deleteButton: {
    margin: 0,
    marginLeft: "auto",
    marginRight: "auto",
    marginTop: 24,
    borderColor: "#d32f2f",
    backgroundColor: "transparent",
    width: "calc(100% - 132px)",
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
    marginBottom: Platform.OS === 'ios' ? 120 : 140,
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
