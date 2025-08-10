import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import { TextInput, Button, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { updateVehicle, deleteVehicle } from "../../utils/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dropdown } from 'react-native-element-dropdown';
import { fetchCarBrands, fetchCarModels } from "../../utils/carData";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormLabel from "../../components/FormLabel";

export default function EditVehicleScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;
  const [saving, setSaving] = useState(false);

  // State for vehicle data
  const [vehicleData, setVehicleData] = useState({
    name: vehicle.name,
    numberPlate: vehicle.numberPlate || "",
    vehicleType: vehicle.vehicleType || "ICE",
    fuelTankSize: vehicle.fuelTankSize ? vehicle.fuelTankSize.toString() : "",
    batteryCapacity: vehicle.batteryCapacity ? vehicle.batteryCapacity.toString() : "",
  });

  // State for Make and Model selection
  const [make, setMake] = useState(vehicle.make);
  const [model, setModel] = useState(vehicle.model);

  const [carBrands, setCarBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);

  const [isMakeDropdownVisible, setMakeDropdownVisible] = useState(false);
  const [isModelDropdownVisible, setModelDropdownVisible] = useState(false);

  // Loading states
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Vehicle type options
  const vehicleTypeOptions = [
    { label: t("vehicles.types.ICE"), value: 'ICE' },
    { label: t("vehicles.types.HYBRID"), value: 'HYBRID' },
    { label: t("vehicles.types.PHEV"), value: 'PHEV' },
    { label: t("vehicles.types.BEV"), value: 'BEV' },
  ];

  // Load car brands on mount
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

  // Fetch models when make changes
  useEffect(() => {
    const fetchModelsForMake = async () => {
      if (!make || !carBrands.includes(make)) {
        setCarModels([]);
        return;
      }
      setLoadingModels(true);
      try {
        const models = await fetchCarModels(make);
        setCarModels(models);
      } catch (error) {
        console.error("Failed to load car models:", error);
      } finally {
        setLoadingModels(false);
      }
    };
    if (carBrands.length > 0) {
        fetchModelsForMake();
    }
  }, [make, carBrands]);

  // Handle Make input change and filtering
  const handleMakeChange = (text) => {
    setMake(text);
    if (text) {
      setFilteredBrands(
        carBrands.filter((brand) =>
          brand.toLowerCase().includes(text.toLowerCase())
        )
      );
      setMakeDropdownVisible(true);
    } else {
      setFilteredBrands([]);
      setMakeDropdownVisible(false);
    }
  };

  // Handle Model input change and filtering
  const handleModelChange = (text) => {
    setModel(text);
    if (text) {
      setFilteredModels(
        carModels.filter((modelItem) =>
          modelItem.toLowerCase().includes(text.toLowerCase())
        )
      );
      setModelDropdownVisible(true);
    } else {
      setFilteredModels([]);
      setModelDropdownVisible(false);
    }
  };

  const handleSelectMake = (selectedMake) => {
    setMake(selectedMake);
    setModel(""); // Clear model when make changes
    setMakeDropdownVisible(false);
  };

  const handleSelectModel = (selectedModel) => {
    setModel(selectedModel);
    setModelDropdownVisible(false);
  };

  // Main submission handler
  const handleSave = async () => {
    if (!make.trim() || !model.trim() || !vehicleData.vehicleType) {
      alert(t("common.error.required"));
      return;
    }
    setSaving(true);
    try {
      const updateData = {
        name: vehicleData.name.trim() || make.trim(),
        make: make.trim(),
        model: model.trim(),
        numberPlate: vehicleData.numberPlate.trim(),
        vehicleType: vehicleData.vehicleType,
        fuelTankSize: shouldShowFuelTankSize() && vehicleData.fuelTankSize.trim() ? parseFloat(vehicleData.fuelTankSize.replace(',', '.')) : null,
        batteryCapacity: shouldShowBatteryCapacity() && vehicleData.batteryCapacity.trim() ? parseFloat(vehicleData.batteryCapacity.replace(',', '.')) : null,
      };
      await updateVehicle(vehicle.id, updateData);
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



  const shouldShowFuelTankSize = () => ['ICE', 'HYBRID', 'PHEV'].includes(vehicleData.vehicleType);
  const shouldShowBatteryCapacity = () => ['BEV', 'PHEV'].includes(vehicleData.vehicleType);

  const renderDropdown = (data, onSelect) => (
    <Surface style={styles.dropdownSurface}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {data.map((item) => (
          <TouchableOpacity key={item} style={styles.dropdownItem} onPress={() => onSelect(item)}>
            <Text>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      nestedScrollEnabled={true}
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
            <FormLabel style={styles.inputLabel}>{t("vehicles.name")}</FormLabel>
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
            <FormLabel required style={styles.inputLabel}>{t("vehicles.make")}</FormLabel>
            <TextInput
                value={make}
                onChangeText={handleMakeChange}
                onFocus={() => setMakeDropdownVisible(true)}
                onBlur={() => setTimeout(() => setMakeDropdownVisible(false), 200)}
                style={styles.input}
                disabled={saving || loadingBrands}
                mode="outlined"
                right={loadingBrands && <TextInput.Icon icon="loading" />}
            />
            {isMakeDropdownVisible && filteredBrands.length > 0 && renderDropdown(filteredBrands, handleSelectMake)}
          </View>

            <View style={[styles.inputContainer, { zIndex: 3 }]}>
            <FormLabel required style={styles.inputLabel}>{t("vehicles.model")}</FormLabel>
            <TextInput
                value={model}
                onChangeText={handleModelChange}
                onFocus={() => setModelDropdownVisible(true)}
                onBlur={() => setTimeout(() => setModelDropdownVisible(false), 200)}
                style={styles.input}
                disabled={saving || loadingModels || !make}
                mode="outlined"
                right={loadingModels && <TextInput.Icon icon="loading" />}
                placeholder={!make ? t("vehicles.modelPlaceholder") : ""}
            />
            {isModelDropdownVisible && filteredModels.length > 0 && renderDropdown(filteredModels, handleSelectModel)}
          </View>

            <View style={[styles.inputContainer, { zIndex: 2 }]}>
            <FormLabel style={styles.inputLabel}>{t("vehicles.numberPlate")}</FormLabel>
            <TextInput
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
            <FormLabel required style={styles.inputLabel}>{t("vehicles.vehicleType")}</FormLabel>
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
              <FormLabel style={styles.inputLabel}>{t("vehicles.fuelTankSize")} (L)</FormLabel>
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
              <FormLabel style={styles.inputLabel}>{t("vehicles.batteryCapacity")} (kWh)</FormLabel>
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
    backgroundColor: "#fff",
  },
  dropdown: {
    height: 56,
    borderColor: '#79747E',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
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
    marginHorizontal: 25,
    marginTop: 16,
    borderColor: "#d32f2f",
  },
  deleteButtonLabel: {
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
  dropdownSurface: {
    position: 'absolute',
    top: 80, 
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
    zIndex: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
