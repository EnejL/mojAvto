// screens/MyVehiclesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { loadVehicles, saveVehicles } from "../utils/storage";

export default function MyVehiclesScreen({ navigation, route }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load vehicles when screen mounts
  useEffect(() => {
    loadStoredVehicles();
  }, []);

  // Handle new vehicle additions
  useEffect(() => {
    if (route.params?.newVehicle) {
      const addNewVehicle = async () => {
        try {
          const updatedVehicles = [...vehicles, route.params.newVehicle];
          await saveVehicles(updatedVehicles);
          setVehicles(updatedVehicles);
          // Clear the params to prevent duplicate additions
          navigation.setParams({ newVehicle: undefined });
        } catch (error) {
          alert("Failed to save vehicle");
        }
      };
      addNewVehicle();
    }
  }, [route.params?.newVehicle]);

  const loadStoredVehicles = async () => {
    try {
      const storedVehicles = await loadVehicles();
      setVehicles(storedVehicles);
    } catch (error) {
      alert("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.vehicleItem}
      onPress={() => navigation.navigate("VehicleDetails", { vehicle: item })}
    >
      <Text style={styles.vehicleText}>{item.name}</Text>
      <Text style={styles.vehicleSubtext}>
        {item.make} {item.model}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {vehicles.length === 0 ? (
        <Text style={styles.emptyText}>No vehicles added yet</Text>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleItem: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  vehicleSubtext: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});
