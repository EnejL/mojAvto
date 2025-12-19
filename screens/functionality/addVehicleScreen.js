import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { Button, TextInput, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addVehicle } from "../../utils/firestore";
import { fetchCarBrands, fetchCarModels } from "../../utils/carData";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FormLabel from "../../components/FormLabel";
import VehicleTypeSelector from "../../components/VehicleTypeSelector";
import { defaultUserProfile, getUserProfile } from "../../utils/userProfile";

const AddVehicleScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [userSettings, setUserSettings] = useState(defaultUserProfile);
  
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

  const vehicleTypeOptions = useMemo(
    () => [
      { label: t("vehicles.types.ICE"), value: "ICE" },
      { label: t("vehicles.types.HYBRID"), value: "HYBRID" },
      { label: t("vehicles.types.PHEV"), value: "PHEV" },
      { label: t("vehicles.types.BEV"), value: "BEV" },
    ],
    [t]
  );

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

  // Load measurement preferences (volume unit)
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const profile = await getUserProfile();
        setUserSettings(profile);
      } catch (e) {
        setUserSettings(defaultUserProfile);
      }
    };

    loadUserSettings();
    const unsubscribe = navigation?.addListener?.("focus", loadUserSettings);
    return unsubscribe;
  }, [navigation]);

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
      const volumeUnit =
        userSettings.volumeUnit ||
        (userSettings.unitSystem === "imperial" ? "gal" : "L");

      const parseNumber = (val) => {
        if (!val || !val.trim()) return null;
        const parsed = parseFloat(val.replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
      };

      const toLiters = (value) =>
        volumeUnit === "gal" ? value * 3.78541 : value;

      const newVehicle = {
        name: vehicleData.name.trim() || make.trim(),
        make: make.trim(),
        model: model.trim(),
        numberPlate: vehicleData.numberPlate.trim(),
        vehicleType: vehicleData.vehicleType,
        fuelTankSize:
          shouldShowFuelTankSize() && vehicleData.fuelTankSize.trim()
            ? (() => {
                const v = parseNumber(vehicleData.fuelTankSize);
                return v === null ? null : toLiters(v);
              })()
            : null,
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

  const volumeUnit =
    userSettings.volumeUnit || (userSettings.unitSystem === "imperial" ? "gal" : "L");

  // Helper function to render clear icon
  const renderClearIcon = (value, onClear) => {
    if (!value || value.trim() === '') return null;
    return (
      <TextInput.Icon 
        icon="close" 
        onPress={onClear}
        iconColor={COLORS.muted}
      />
    );
  };

  const renderDropdown = (data, onSelect) => (
    <Surface style={styles.dropdownSurface}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {data.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.dropdownItem}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.dropdownItemText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        enableOnAndroid
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <FormLabel style={styles.label}>{t("vehicles.name")}</FormLabel>
          <TextInput
            value={vehicleData.name}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, name: text })
            }
            style={styles.input}
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            disabled={saving}
            mode="outlined"
            textColor={COLORS.text}
            placeholder={t("vehicles.nameExample")}
            placeholderTextColor={COLORS.placeholder}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.blue}
            right={renderClearIcon(vehicleData.name, () =>
              setVehicleData({ ...vehicleData, name: "" })
            )}
          />
        </View>

        {/* Make Input */}
        <View style={[styles.field, { zIndex: 5 }]}>
          <FormLabel required style={styles.label}>
            {t("vehicles.make")}
          </FormLabel>
          <TextInput
            value={make}
            onChangeText={handleMakeChange}
            onFocus={() => setMakeDropdownVisible(true)}
            onBlur={() => setTimeout(() => setMakeDropdownVisible(false), 200)}
            style={styles.input}
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            disabled={saving || loadingBrands}
            mode="outlined"
            textColor={COLORS.text}
            placeholder={t("vehicles.makeExample")}
            placeholderTextColor={COLORS.placeholder}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.blue}
            right={renderClearIcon(make, () => {
              setMake("");
              setModel("");
              setFilteredBrands([]);
              setMakeDropdownVisible(false);
            })}
          />
          {isMakeDropdownVisible &&
            filteredBrands.length > 0 &&
            renderDropdown(filteredBrands, handleSelectMake)}
        </View>

        {/* Model Input */}
        <View style={[styles.field, { zIndex: 4 }]}>
          <FormLabel required style={styles.label}>
            {t("vehicles.model")}
          </FormLabel>
          <TextInput
            value={model}
            onChangeText={handleModelChange}
            onFocus={() => setModelDropdownVisible(true)}
            onBlur={() =>
              setTimeout(() => setModelDropdownVisible(false), 200)
            }
            style={styles.input}
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            disabled={saving || loadingModels || !make}
            mode="outlined"
            textColor={COLORS.text}
            placeholder={make ? t("vehicles.modelExample") : t("vehicles.modelPlaceholder")}
            placeholderTextColor={COLORS.placeholder}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.blue}
          />
          {isModelDropdownVisible &&
            filteredModels.length > 0 &&
            renderDropdown(filteredModels, handleSelectModel)}
        </View>

        <View style={[styles.field, { zIndex: 3 }]}>
          <FormLabel style={styles.label}>{t("vehicles.numberPlate")}</FormLabel>
          <TextInput
            value={vehicleData.numberPlate}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, numberPlate: text })
            }
            style={styles.input}
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            disabled={saving}
            mode="outlined"
            textColor={COLORS.text}
            placeholder={t("vehicles.numberPlateExample")}
            placeholderTextColor={COLORS.placeholder}
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.blue}
            right={renderClearIcon(vehicleData.numberPlate, () =>
              setVehicleData({ ...vehicleData, numberPlate: "" })
            )}
          />
        </View>

        <View style={styles.field}>
          <FormLabel required style={styles.label}>
            {t("vehicles.vehicleType")}
          </FormLabel>
          <VehicleTypeSelector
            value={vehicleData.vehicleType}
            onChange={(type) => setVehicleData({ ...vehicleData, vehicleType: type })}
            disabled={saving}
            options={vehicleTypeOptions}
          />
        </View>

        {/* Conditional Fields */}
        {shouldShowFuelTankSize() && (
          <View style={styles.field}>
            <View style={styles.fieldHeaderRow}>
              <FormLabel style={styles.label}>{t("vehicles.fuelTankSize")}</FormLabel>
              <Text style={styles.unitText}>{volumeUnit}</Text>
            </View>
            <TextInput
              value={vehicleData.fuelTankSize}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, fuelTankSize: text })
              }
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              disabled={saving}
              mode="outlined"
              keyboardType="numeric"
              textColor={COLORS.text}
              placeholder={
                volumeUnit === "gal"
                  ? t("vehicles.fuelTankSizeExampleGal")
                  : t("vehicles.fuelTankSizeExample")
              }
              placeholderTextColor={COLORS.placeholder}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.blue}
              right={renderClearIcon(vehicleData.fuelTankSize, () =>
                setVehicleData({ ...vehicleData, fuelTankSize: "" })
              )}
            />
          </View>
        )}

        {shouldShowBatteryCapacity() && (
          <View style={styles.field}>
            <View style={styles.fieldHeaderRow}>
              <FormLabel style={styles.label}>{t("vehicles.batteryCapacity")}</FormLabel>
              <Text style={styles.unitText}>kWh</Text>
            </View>
            <TextInput
              value={vehicleData.batteryCapacity}
              onChangeText={(text) =>
                setVehicleData({ ...vehicleData, batteryCapacity: text })
              }
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              disabled={saving}
              mode="outlined"
              keyboardType="numeric"
              textColor={COLORS.text}
              placeholder={t("vehicles.batteryCapacityExample")}
              placeholderTextColor={COLORS.placeholder}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.blue}
              right={renderClearIcon(vehicleData.batteryCapacity, () =>
                setVehicleData({ ...vehicleData, batteryCapacity: "" })
              )}
            />
          </View>
        )}
      </KeyboardAwareScrollView>

      <View style={[styles.bottomBar, { paddingBottom: 12 }]}>
        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}
          labelStyle={styles.primaryButtonLabel}
          buttonColor={COLORS.blue}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="white" /> : t("vehicles.add")}
        </Button>
      </View>
    </View>
  );
};

const COLORS = {
  bg: "#0B141E",
  surface: "#1C242D",
  border: "#2B3845",
  text: "#EAF1FA",
  muted: "#AAB6C4",
  placeholder: "#7D8A99",
  blue: "#1B84FF",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 140,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    overflow: "visible",
  },
  fieldHalf: {
    width: "48%",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  inputOutline: {
    borderRadius: 18,
  },
  inputContent: {
    height: 56,
  },
  fieldHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  unitText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "700",
  },
  dropdownSurface: {
    position: 'absolute',
    top: 78,
    left: 0,
    right: 0,
    backgroundColor: "#121A24",
    borderRadius: 14,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 200,
    zIndex: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#23303C",
  },
  dropdownItemText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#15202B",
  },
  primaryButton: {
    borderRadius: 18,
  },
  primaryButtonContent: {
    height: 58,
  },
  primaryButtonLabel: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
});

export default AddVehicleScreen;
