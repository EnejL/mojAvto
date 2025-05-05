// screens/VehicleConsumptionScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Text, Button, Surface, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getFillings, deleteFilling } from "../../utils/firestore";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import BrandLogo from "../../components/BrandLogo";
import SimpleFuelConsumptionGraph from "../../components/FuelConsumptionGraph";

// Helper function to format dates from Firestore timestamps
const formatDate = (date) => {
  if (!date) return "";

  let dateObj;

  // Handle Firestore timestamp objects
  if (date.seconds) {
    dateObj = new Date(date.seconds * 1000);
  }
  // Handle Date objects
  else if (date instanceof Date) {
    dateObj = date;
  }
  // Handle string dates
  else {
    try {
      dateObj = new Date(date);
    } catch (e) {
      return date;
    }
  }

  // Format as dd. mm. yyyy
  return `${dateObj.getDate().toString().padStart(2, "0")}. ${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}. ${dateObj.getFullYear()}`;
};

// Fix the helper function for number formatting
const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return "";

  // First convert to string with fixed decimal places
  const fixed = value.toFixed(decimals);

  // Split into integer and decimal parts
  const parts = fixed.split(".");
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : "";

  // Add thousand separators (dots) to integer part
  const integerWithSeparators = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    "."
  );

  // Combine with decimal part using comma as separator
  return decimalPart
    ? `${integerWithSeparators},${decimalPart}`
    : integerWithSeparators;
};

export default function VehicleDetailsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;
  const [fillings, setFillings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFillings = async () => {
      try {
        const vehicleFillings = await getFillings(vehicle.id);
        setFillings(vehicleFillings);
      } catch (error) {
        console.error("Error loading fillings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFillings();

    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener("focus", loadFillings);
    return unsubscribe;
  }, [navigation, vehicle.id]);

  // Calculate average fuel consumption
  const averageConsumption = useMemo(() => {
    if (fillings.length < 2) return null;

    // Sort fillings by odometer reading (ascending)
    const sortedFillings = [...fillings].sort(
      (a, b) => a.odometer - b.odometer
    );

    // Calculate total distance and total liters
    let totalDistance = 0;
    let totalLiters = 0;

    for (let i = 1; i < sortedFillings.length; i++) {
      const distance =
        sortedFillings[i].odometer - sortedFillings[i - 1].odometer;
      
      // Skip invalid distances (e.g., negative or zero)
      if (distance <= 0) continue;
      
      totalDistance += distance;
      totalLiters += sortedFillings[i].liters;
    }

    // Calculate average consumption (liters per 100 km)
    if (totalDistance === 0) return null;
    return (totalLiters / totalDistance) * 100;
  }, [fillings]);

  // Calculate average cost per filling
  const averageCost = useMemo(() => {
    if (fillings.length === 0) return null;
    const totalCost = fillings.reduce((sum, filling) => sum + filling.cost, 0);
    return totalCost / fillings.length;
  }, [fillings]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    if (fillings.length === 0) return null;
    return fillings.reduce((sum, filling) => sum + filling.cost, 0);
  }, [fillings]);

  // Calculate average liters per filling
  const averageLiters = useMemo(() => {
    if (fillings.length === 0) return null;
    const totalLiters = fillings.reduce(
      (sum, filling) => sum + filling.liters,
      0
    );
    return totalLiters / fillings.length;
  }, [fillings]);

  const renderFillingItem = ({ item }) => {
    const renderRightActions = (progress, dragX) => {
      return (
        <View style={styles.deleteAction}>
          <Button
            icon="trash-can"
            color="#fff"
            onPress={() => handleDeleteFilling(item.id)}
            style={styles.deleteActionButton}
          />
        </View>
      );
    };

    const handleDeleteFilling = (fillingId) => {
      Alert.alert(t("common.delete"), t("fillings.deleteConfirmMessage"), [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFilling(vehicle.id, fillingId);
              // Refresh the fillings list
              const updatedFillings = fillings.filter(
                (f) => f.id !== fillingId
              );
              setFillings(updatedFillings);
            } catch (error) {
              console.error("Error deleting filling:", error);
              alert(t("common.error.delete"));
            }
          },
        },
      ]);
    };

    return (
      <GestureHandlerRootView style={styles.gestureContainer}>
        <Swipeable
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EditFilling", {
                filling: item,
                vehicleId: vehicle.id,
              })
            }
          >
            <Surface style={styles.fillingItem}>
              <View style={styles.fillingContent}>
                <View style={styles.fillingLabels}>
                  <Text style={styles.fillingLabel}>{t("fillings.date")}:</Text>
                  <Text style={styles.fillingLabel}>
                    {t("fillings.odometer")}:
                  </Text>
                  <Text style={styles.fillingLabel}>{t("fillings.liters")}:</Text>
                  <Text style={styles.fillingLabel}>{t("fillings.cost")}:</Text>
                </View>

                <View style={styles.fillingValues}>
                  <Text style={styles.fillingValue}>{formatDate(item.date)}</Text>
                  <Text style={styles.fillingValue}>
                    {formatNumber(item.odometer, 0)} km
                  </Text>
                  <Text style={styles.fillingValue}>
                    {formatNumber(item.liters, 2)} L
                  </Text>
                  <Text style={styles.fillingValue}>
                    {formatNumber(item.cost, 2)} €
                  </Text>
                </View>
              </View>
            </Surface>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Surface style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.vehicleInfoContainer}>
              <BrandLogo brand={vehicle.make} style={styles.brandLogo} />
              <View style={styles.vehicleTextContainer}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleSubtitle}>
                  {vehicle.make} {vehicle.model}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        <Surface style={styles.statsCard}>
          <Text style={styles.sectionTitle}>{t("fillings.statistics")}</Text>

          {fillings.length < 2 ? (
            <Text style={styles.emptyText}>{t("fillings.notEnoughData")}</Text>
          ) : (
            <View style={styles.statsGrid}>
              {averageConsumption !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t("fillings.avgConsumption")}
                  </Text>
                  <Text style={styles.statValue}>
                    {formatNumber(averageConsumption)}{" "}
                    {t("fillings.consumptionUnit")}
                  </Text>
                </View>
              )}

              {averageCost !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t("fillings.avgCost")}</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(averageCost, 2)} € / {t("fillings.filling")}
                  </Text>
                </View>
              )}

              {averageLiters !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t("fillings.avgLiters")}
                  </Text>
                  <Text style={styles.statValue}>
                    {formatNumber(averageLiters)} L
                  </Text>
                </View>
              )}

              {totalCost !== null && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>
                    {t("fillings.totalCost")}
                  </Text>
                  <Text style={styles.statValue}>
                    {formatNumber(totalCost, 2)} €
                  </Text>
                </View>
              )}
            </View>
          )}
        </Surface>

        {/* Replace the old FuelConsumptionGraph component with our new SimpleFuelConsumptionGraph */}
        <SimpleFuelConsumptionGraph fillings={fillings} />

        <Surface style={styles.fillingsCard}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{t("fillings.title")}</Text>
            <Text style={styles.fillingCount}>({fillings.length})</Text>
          </View>
          {fillings.length === 0 ? (
            <Text style={styles.emptyText}>{t("fillings.empty")}</Text>
          ) : (
            <FlatList
              data={fillings}
              renderItem={renderFillingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          )}
        </Surface>
      </ScrollView>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("AddFilling", { vehicle })}
        style={styles.addButton}
      >
        {t("fillings.add")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  headerCard: {
    padding: 24,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  vehicleTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
  },
  statItem: {
    width: "50%",
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  fillingsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  fillingCount: {
    fontSize: 14,
    color: "#888",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 16,
  },
  fillingItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    elevation: 1,
  },
  fillingContent: {
    flexDirection: "row",
  },
  fillingLabels: {
    flex: 1,
  },
  fillingValues: {
    flex: 1,
    alignItems: "flex-end",
  },
  fillingLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  fillingValue: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  addButton: {
    margin: 16,
    paddingVertical: 6,
  },
  deleteAction: {
    backgroundColor: "#dd2c00",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  deleteActionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  gestureContainer: {
    flex: 1,
  },
});