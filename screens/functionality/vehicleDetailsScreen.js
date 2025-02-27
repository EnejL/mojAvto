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
import { Swipeable } from "react-native-gesture-handler";

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
      totalDistance += distance;
      totalLiters += sortedFillings[i].liters;
    }

    // Calculate average consumption (liters per 100 km)
    if (totalDistance === 0) return null;
    return (totalLiters / totalDistance) * 100;
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
          ></Button>
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
                <Text style={styles.fillingValue}>{item.odometer} km</Text>
                <Text style={styles.fillingValue}>{item.liters} L</Text>
                <Text style={styles.fillingValue}>
                  {item.cost.toFixed(2)} €
                </Text>
              </View>
            </View>
          </Surface>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Surface style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleSubtitle}>
                {vehicle.make} {vehicle.model}
              </Text>
            </View>

            {averageConsumption && (
              <View style={styles.consumptionContainer}>
                <Text style={styles.consumptionValue}>
                  {averageConsumption.toFixed(1)}
                </Text>
                <Text style={styles.consumptionUnit}>
                  {t("fillings.consumptionUnit")}
                </Text>
              </View>
            )}
          </View>
        </Surface>

        {/* <Surface style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("vehicles.make")}</Text>
            <Text style={styles.detailValue}>{vehicle.make}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t("vehicles.model")}</Text>
            <Text style={styles.detailValue}>{vehicle.model}</Text>
          </View>
          {vehicle.numberPlate ? (
            <>
              <View style={styles.separator} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("vehicles.numberPlate")}
                </Text>
                <Text style={styles.detailValue}>{vehicle.numberPlate}</Text>
              </View>
            </>
          ) : null}
        </Surface> */}

        <Surface style={styles.fillingsCard}>
          <Text style={styles.sectionTitle}>{t("fillings.title")}</Text>

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
  vehicleName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  consumptionContainer: {
    alignItems: "center",
  },
  consumptionValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  consumptionUnit: {
    fontSize: 12,
    color: "#666",
  },
  detailsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  fillingsCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
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
});
