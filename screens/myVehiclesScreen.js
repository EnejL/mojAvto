// screens/MyVehiclesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getAllVehicles, addVehicle } from "../utils/firestore";

export default function MyVehiclesScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadVehicles();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (route.params?.newVehicle) {
      const addNewVehicle = async () => {
        try {
          await addVehicle(route.params.newVehicle);
          await loadVehicles(); // Reload the list
          navigation.setParams({ newVehicle: undefined });
        } catch (error) {
          alert(t("common.error.save"));
        }
      };
      addNewVehicle();
    }
  }, [route.params?.newVehicle]);

  const loadVehicles = async () => {
    try {
      console.log("Loading vehicles..."); // Debug log
      const loadedVehicles = await getAllVehicles();
      console.log("Loaded vehicles:", loadedVehicles); // Debug log
      setVehicles(loadedVehicles);
    } catch (error) {
      console.error("Error loading vehicles:", error); // Debug log
      alert(t("common.error.load"));
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
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {vehicles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("vehicles.empty")}</Text>
            </View>
          ) : (
            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}

          <Button
            mode="contained"
            onPress={() => navigation.navigate("AddVehicle")}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}
          >
            {t("vehicles.add")}
          </Button>
        </>
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
