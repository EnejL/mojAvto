// fuelConsumptionScreen.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getVehicles, getVehicleFillings } from "../../utils/firestore";

const FuelConsumptionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fillings, setFillings] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleData = await getVehicles();
        console.log("Fetched vehicles:", vehicleData);
        setVehicles(vehicleData || []);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();

    // Refresh vehicles when the screen is focused
    const unsubscribe = navigation.addListener("focus", fetchVehicles);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    // Add this to fetch fillings for the first vehicle when vehicles are loaded
    const fetchFillings = async () => {
      if (vehicles && vehicles.length > 0) {
        try {
          const fillingsData = await getVehicleFillings(vehicles[0].id);
          setFillings(fillingsData || []);
        } catch (error) {
          console.error("Error fetching fillings:", error);
        }
      }
    };

    if (!loading) {
      fetchFillings();
    }
  }, [vehicles, loading]);

  const handleAddFilling = () => {
    console.log("Current vehicles:", vehicles);
    if (vehicles && vehicles.length > 0) {
      // Pass the first vehicle to AddFilling screen
      navigation.navigate("AddFilling", { vehicle: vehicles[0] });
    } else {
      navigation.navigate("NoVehiclesWarning");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("fillings.title")}</Text>

      {/* Display fuel consumption information here */}
      <View style={styles.contentContainer}>
        {fillings.length > 0 ? (
          <Text style={styles.infoText}>{t("fillings.consumption")}</Text>
        ) : (
          <Text style={styles.infoText}>{t("fillings.noFillings")}</Text>
        )}
        {/* You can add more content here */}
      </View>

      <Button
        mode="contained"
        onPress={handleAddFilling}
        style={styles.addButton}
        labelStyle={styles.buttonLabel}
      >
        {t("fillings.add")}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    position: "relative",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoText: {
    fontSize: 18,
    textAlign: "center",
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

export default FuelConsumptionScreen;
