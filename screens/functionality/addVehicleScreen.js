// screens/addVehicleScreen.js
import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { TextInput, Button, Title, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addVehicle } from "../../utils/firestore";

const AddVehicleScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [vehicleData, setVehicleData] = useState({
    name: "",
    make: "",
    model: "",
    numberPlate: "",
  });
  const [saving, setSaving] = useState(false);

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

      navigation.navigate("MyVehiclesMain"); // Changed from goBack() to explicit navigation
    } catch (error) {
      console.error("Error in handleAddVehicle:", error); // Debug log
      alert(t("common.error.save"));
    } finally {
      setSaving(false);
    }
  };

  const renderRequiredLabel = () => <Text style={styles.requiredLabel}>*</Text>;

  return (
    <View style={styles.container}>
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
        <TextInput
          value={vehicleData.make}
          onChangeText={(text) =>
            setVehicleData({ ...vehicleData, make: text })
          }
          style={styles.input}
          disabled={saving}
          mode="outlined"
        />
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Text style={styles.inputLabel}>{t("vehicles.model")}</Text>
          {renderRequiredLabel()}
        </View>
        <TextInput
          value={vehicleData.model}
          onChangeText={(text) =>
            setVehicleData({ ...vehicleData, model: text })
          }
          style={styles.input}
          disabled={saving}
          mode="outlined"
        />
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
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
  button: {
    marginTop: 16,
  },
});

export default AddVehicleScreen;
