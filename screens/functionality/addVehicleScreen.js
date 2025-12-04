// screens/addVehicleScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  FlatList,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { Button, Title, TextInput, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addVehicle } from "../../utils/firestore";
import { fetchCarBrands, fetchCarModels } from "../../utils/carData";
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormLabel from "../../components/FormLabel";

const AddVehicleScreen = ({ navigation }) => {
  const { t } = useTranslation();
  
  // State for vehicle data
  const [vehicleData, setVehicleData] = useState({
    name: "",
    numberPlate: "",
    vehicleType: "ICE",
    fuelTankSize: "",
    batteryCapacity: "",
  });

  // State for Make and Model selection
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const [carBrands, setCarBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);

  const [isMakeDropdownVisible, setMakeDropdownVisible] = useState(false);
  const [isModelDropdownVisible, setModelDropdownVisible] = useState(false);

  // Loading states
  const [saving, setSaving] = useState(false);
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
        // Error handled silently - brands may be empty
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
        // Error handled silently - models may be empty
      } finally {
        setLoadingModels(false);
      }
    };
    fetchModelsForMake();
  }, [make]);

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
  const handleAddVehicle = async () => {
    if (!make.trim() || !model.trim() || !vehicleData.vehicleType) {
      alert(t("common.error.required"));
      return;
    }
    setSaving(true);
    try {
      const newVehicle = {
        name: vehicleData.name.trim() || make.trim(),
        make: make.trim(),
        model: model.trim(),
        numberPlate: vehicleData.numberPlate.trim(),
        vehicleType: vehicleData.vehicleType,
        fuelTankSize: shouldShowFuelTankSize() && vehicleData.fuelTankSize.trim() ? parseFloat(vehicleData.fuelTankSize.replace(',', '.')) : null,
        batteryCapacity: shouldShowBatteryCapacity() && vehicleData.batteryCapacity.trim() ? parseFloat(vehicleData.batteryCapacity.replace(',', '.')) : null,
      };
      await addVehicle(newVehicle);
      navigation.navigate("MyVehiclesMain");
    } catch (error) {
      alert(t("common.error.save"));
    } finally {
      setSaving(false);
    }
  };



  const shouldShowFuelTankSize = () => ['ICE', 'HYBRID', 'PHEV'].includes(vehicleData.vehicleType);
  const shouldShowBatteryCapacity = () => ['BEV', 'PHEV'].includes(vehicleData.vehicleType);

  // Helper function to render clear icon
  const renderClearIcon = (value, onClear) => {
    if (!value || value.trim() === '') return null;
    return (
      <TextInput.Icon 
        icon="close" 
        onPress={onClear}
        iconColor="#666"
      />
    );
  };

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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      nestedScrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.content}>
        <Title style={styles.title}>{t("vehicles.add")}</Title>

        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>{t("vehicles.name")}</Text>
          </View>
          <TextInput
            value={vehicleData.name}
            onChangeText={(text) => setVehicleData({ ...vehicleData, name: text })}
            style={styles.input}
            disabled={saving}
            mode="outlined"
            right={renderClearIcon(vehicleData.name, () => setVehicleData({ ...vehicleData, name: "" }))}
          />
        </View>

        {/* Make Input */}
        <View style={[styles.inputContainer, { zIndex: 5 }]}>
          <FormLabel required style={styles.inputLabel}>{t("vehicles.make")}</FormLabel>
          <TextInput
            value={make}
            onChangeText={handleMakeChange}
            onFocus={() => setMakeDropdownVisible(true)}
            onBlur={() => setTimeout(() => setMakeDropdownVisible(false), 200)}
            style={styles.input}
            disabled={saving || loadingBrands}
            mode="outlined"
            right={
              loadingBrands 
                ? <TextInput.Icon icon="loading" />
                : renderClearIcon(make, () => {
                    setMake("");
                    setModel("");
                    setFilteredBrands([]);
                    setMakeDropdownVisible(false);
                  })
            }
          />
          {isMakeDropdownVisible && filteredBrands.length > 0 && renderDropdown(filteredBrands, handleSelectMake)}
        </View>

        {/* Model Input */}
        <View style={[styles.inputContainer, { zIndex: 4 }]}>
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

        <View style={[styles.inputContainer, { zIndex: 3 }]}>
          <FormLabel style={styles.inputLabel}>{t("vehicles.numberPlate")}</FormLabel>
          <TextInput
            value={vehicleData.numberPlate}
            onChangeText={(text) => setVehicleData({ ...vehicleData, numberPlate: text })}
            style={styles.input}
            disabled={saving}
            mode="outlined"
            right={renderClearIcon(vehicleData.numberPlate, () => setVehicleData({ ...vehicleData, numberPlate: "" }))}
          />
        </View>

        {/* Vehicle Type Dropdown */}
        <View style={[styles.inputContainer, { zIndex: 2 }]}>
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
              onChangeText={(text) => setVehicleData({ ...vehicleData, fuelTankSize: text })}
              style={styles.input}
              disabled={saving}
              mode="outlined"
              keyboardType="numeric"
              placeholder="e.g. 60"
              right={renderClearIcon(vehicleData.fuelTankSize, () => setVehicleData({ ...vehicleData, fuelTankSize: "" }))}
            />
          </View>
        )}

        {shouldShowBatteryCapacity() && (
          <View style={styles.inputContainer}>
            <FormLabel style={styles.inputLabel}>{t("vehicles.batteryCapacity")} (kWh)</FormLabel>
            <TextInput
              value={vehicleData.batteryCapacity}
              onChangeText={(text) => setVehicleData({ ...vehicleData, batteryCapacity: text })}
              style={styles.input}
              disabled={saving}
              mode="outlined"
              keyboardType="numeric"
              placeholder="e.g. 75"
              right={renderClearIcon(vehicleData.batteryCapacity, () => setVehicleData({ ...vehicleData, batteryCapacity: "" }))}
            />
          </View>
        )}

        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.button}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="white" /> : t("vehicles.add")}
        </Button>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
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
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
  dropdownSurface: {
    position: 'absolute',
    top: 85, // Adjust this based on your input height and label
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

export default AddVehicleScreen;
