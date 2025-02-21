// fuelConsumptionScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { loadVehicles } from "../utils/storage";

const FuelConsumptionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredVehicles();
  }, []);

  const loadStoredVehicles = async () => {
    try {
      const storedVehicles = await loadVehicles();
      setVehicles(storedVehicles);
    } catch (error) {
      alert(t("common.error.load"));
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.vehicleItem}
      onPress={() =>
        navigation.navigate("VehicleFuelConsumption", { vehicle: item })
      }
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
        <Text style={styles.emptyText}>{t("fillings.empty")}</Text>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
};

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

export default FuelConsumptionScreen;
