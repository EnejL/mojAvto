// screens/addVehicleScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Button, Title, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addVehicle } from "../../utils/firestore";
import { fetchCarBrands, fetchCarModels } from "../../utils/carData";
import AutocompleteInput from "../../components/AutocompleteInput";

const AddVehicleScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [vehicleData, setVehicleData] = useState({
    name: "",
    make: "",
    model: "",
    numberPlate: "",
  });
  const [saving, setSaving] = useState(false);
  const [carBrands, setCarBrands] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Load car brands when component mounts
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

  const handleAddVehicle = async () => {
    // Validate required inputs
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
      // Create new vehicle object
      const newVehicle = {
        name: vehicleData.name.trim(),
        make: vehicleData.make.trim(),
        model: vehicleData.model.trim(),
        numberPlate: vehicleData.numberPlate.trim(),
      };

      console.log("Adding vehicle:", newVehicle); // Debug log
      const vehicleId = await addVehicle(newVehicle);
      console.log("Vehicle added with ID:", vehicleId); // Debug log

      // Clear form and navigate back
      setVehicleData({
        name: "",
        make: "",
        model: "",
        numberPlate: "",
      });

      navigation.navigate("MyVehiclesMain");
    } catch (error) {
      console.error("Error in handleAddVehicle:", error); // Debug log
      alert(t("common.error.save"));
    } finally {
      setSaving(false);
    }
  };

  const handleBrandSelection = (brand) => {
    setVehicleData({ ...vehicleData, make: brand, model: "" });

    // Fetch models for this brand
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

  const renderRequiredLabel = () => <Text style={styles.requiredLabel}>*</Text>;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Title style={styles.title}>{t("vehicles.add")}</Title>

        <View style={styles.inputContainer}>
          <View style={styles.labelContainer}>
            <Text style={styles.inputLabel}>{t("vehicles.name")}</Text>
            {renderRequiredLabel()}
          </View>
          <TextInput
            value={vehicleData.name}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, name: text })
            }
            style={styles.input}
            disabled={saving}
            mode="outlined"
          />
        </View>

        <View style={styles.inputContainer}>
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
            placeholder={loadingBrands ? "Loading brands..." : ""}
          />
        </View>

        <View style={styles.inputContainer}>
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

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>{t("vehicles.numberPlate")}</Text>
          <TextInput
            value={vehicleData.numberPlate}
            onChangeText={(text) =>
              setVehicleData({ ...vehicleData, numberPlate: text })
            }
            style={styles.input}
            disabled={saving}
            mode="outlined"
          />
        </View>

        <Button
          mode="contained"
          onPress={handleAddVehicle}
          style={styles.button}
          disabled={saving}
        >
          {saving ? <ActivityIndicator color="white" /> : t("vehicles.add")}
        </Button>
      </View>
    </KeyboardAvoidingView>
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
    zIndex: 1,
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
  button: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default AddVehicleScreen;
