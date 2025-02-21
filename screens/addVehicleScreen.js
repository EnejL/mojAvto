// screens/addVehicleScreen.js
import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { TextInput, Button, Title } from "react-native-paper";

const AddVehicleScreen = ({ navigation }) => {
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [saving, setSaving] = useState(false);
  // const [petrolType, setPetrolType] = useState(""); // For future development

  const handleAddVehicle = async () => {
    // Validate inputs
    if (!vehicleName.trim() || !vehicleMake.trim() || !vehicleModel.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);

    try {
      // Create new vehicle object
      const newVehicle = {
        name: vehicleName.trim(),
        make: vehicleMake.trim(),
        model: vehicleModel.trim(),
        id: Date.now().toString(), // Simple unique ID
      };

      // Navigate back with the new vehicle data
      navigation.navigate("MyVehiclesMain", { newVehicle });

      // Clear the form
      setVehicleName("");
      setVehicleMake("");
      setVehicleModel("");
    } catch (error) {
      alert("Failed to save vehicle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Add Vehicle</Title>
      <TextInput
        label="Vehicle Name"
        value={vehicleName}
        onChangeText={setVehicleName}
        style={styles.input}
        disabled={saving}
      />
      <TextInput
        label="Vehicle Make"
        value={vehicleMake}
        onChangeText={setVehicleMake}
        style={styles.input}
        disabled={saving}
      />
      <TextInput
        label="Vehicle Model"
        value={vehicleModel}
        onChangeText={setVehicleModel}
        style={styles.input}
        disabled={saving}
      />
      {/*
      <TextInput
        label="Petrol Type"
        value={petrolType}
        onChangeText={setPetrolType}
        style={styles.input}
      />
      */}
      <Button
        mode="contained"
        onPress={handleAddVehicle}
        style={styles.button}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="white" /> : "Add Vehicle"}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
});

export default AddVehicleScreen;
