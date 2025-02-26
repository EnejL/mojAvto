import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { FAB } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getVehicleFillings, addFilling } from "../../utils/firestore";

export default function VehicleFuelConsumptionScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;
  const [fillings, setFillings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFillings();
  }, []);

  const loadFillings = async () => {
    try {
      const loadedFillings = await getVehicleFillings(vehicle.id);
      setFillings(loadedFillings);
    } catch (error) {
      alert(t("common.error.load"));
    } finally {
      setLoading(false);
    }
  };

  const getDistanceSinceLastFilling = (currentIndex) => {
    if (currentIndex === fillings.length - 1) return null;
    const currentFilling = fillings[currentIndex];
    const nextFilling = fillings[currentIndex + 1];
    return nextFilling.odometer - currentFilling.odometer;
  };

  const calculateFuelConsumption = () => {
    if (fillings.length < 2) return null;

    const sortedFillings = [...fillings].sort(
      (a, b) => a.odometer - b.odometer
    );

    let totalDistance = 0;
    let totalFuel = 0;

    for (let i = 1; i < sortedFillings.length; i++) {
      const distance =
        sortedFillings[i].odometer - sortedFillings[i - 1].odometer;
      totalDistance += distance;
      totalFuel += sortedFillings[i].liters;
    }

    return (totalFuel / totalDistance) * 100;
  };

  const renderItem = ({ item, index }) => {
    const distanceSinceLastFilling = getDistanceSinceLastFilling(index);

    return (
      <View style={styles.fillingItem}>
        <Text style={styles.fillingDate}>{item.date.toLocaleDateString()}</Text>
        <Text style={styles.fillingDetail}>
          {t("fillings.odometer")}: {item.odometer.toLocaleString()} km
        </Text>
        <Text style={styles.fillingDetail}>
          {t("fillings.liters")}: {item.liters.toLocaleString()}
        </Text>
        <Text style={styles.fillingDetail}>
          {t("fillings.cost")}:{" "}
          {item.cost.toLocaleString(undefined, {
            style: "currency",
            currency: "EUR",
          })}
        </Text>
        {distanceSinceLastFilling !== null && (
          <Text style={styles.fillingDetail}>
            {t("fillings.distanceSince")}:{" "}
            {distanceSinceLastFilling.toLocaleString()} km
          </Text>
        )}
      </View>
    );
  };

  const consumption = calculateFuelConsumption();

  return (
    <View style={styles.container}>
      <View style={styles.consumptionContainer}>
        <Text style={styles.consumptionText}>
          {consumption
            ? `${t("fillings.consumption")}: ${consumption.toFixed(1)} ${t(
                "fillings.consumptionUnit"
              )}`
            : t("fillings.notEnoughData")}
        </Text>
      </View>
      <FlatList
        data={fillings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddFilling", { vehicle })}
        label={t("fillings.add")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fillingItem: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 6,
  },
  fillingDate: {
    fontSize: 16,
    fontWeight: "bold",
  },
  fillingDetail: {
    fontSize: 14,
    color: "#666",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  consumptionContainer: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 16,
  },
  consumptionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
