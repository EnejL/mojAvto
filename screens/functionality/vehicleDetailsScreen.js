// screens/VehicleConsumptionScreen.js
import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, FlatList } from "react-native";
import { Text, Button, Surface, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getFillings } from "../../utils/firestore";

// Helper function to format dates from Firestore timestamps
const formatDate = (date) => {
  if (!date) return "";

  // Handle Firestore timestamp objects
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleDateString();
  }

  // Handle Date objects
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }

  // Handle string dates
  return date;
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

  const renderFillingItem = ({ item }) => (
    <Surface style={styles.fillingItem}>
      <View style={styles.fillingHeader}>
        <Text style={styles.fillingDate}>{formatDate(item.date)}</Text>
        <Text style={styles.fillingOdometer}>{item.odometer} km</Text>
      </View>
      <Divider style={styles.divider} />
      <View style={styles.fillingDetails}>
        <Text style={styles.fillingLiters}>{item.liters} L</Text>
        <Text style={styles.fillingCost}>{item.cost.toFixed(2)} €</Text>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <Surface style={styles.headerCard}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleSubtitle}>
            {vehicle.make} {vehicle.model}
          </Text>
        </Surface>

        <Surface style={styles.detailsCard}>
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
        </Surface>

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
  vehicleName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicleSubtitle: {
    fontSize: 16,
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
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  fillingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fillingDate: {
    fontWeight: "bold",
  },
  fillingOdometer: {
    color: "#666",
  },
  divider: {
    backgroundColor: "#e0e0e0",
    height: 1,
    marginVertical: 8,
  },
  fillingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  fillingLiters: {
    fontSize: 16,
  },
  fillingCost: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    margin: 16,
    paddingVertical: 6,
  },
});
