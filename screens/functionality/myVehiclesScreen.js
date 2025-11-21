// screens/MyVehiclesScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import {
  getAllVehicles,
  addVehicle,
  deleteVehicle,
  getVehicleFillings,
  getVehicleChargingSessions,
} from "../../utils/firestore";
import { Swipeable } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BrandLogo from "../../components/BrandLogo";

export default function MyVehiclesScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleStats, setVehicleStats] = useState({});
  const swipeableRefs = useRef({});
  const [openSwipeableId, setOpenSwipeableId] = useState(null);

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
          await loadVehicles();
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
      const loadedVehicles = await getAllVehicles();
      setVehicles(loadedVehicles);
      
      // Load stats for each vehicle
      const statsPromises = loadedVehicles.map(async (vehicle) => {
        try {
          const [fillings, chargingSessions] = await Promise.all([
            getVehicleFillings(vehicle.id).catch(() => []),
            getVehicleChargingSessions(vehicle.id).catch(() => [])
          ]);
          
          return { vehicleId: vehicle.id, fillings, chargingSessions };
        } catch (error) {
          return { vehicleId: vehicle.id, fillings: [], chargingSessions: [] };
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = {};
      
      statsResults.forEach(({ vehicleId, fillings, chargingSessions }) => {
        const vehicle = loadedVehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;
        
        const vehicleType = vehicle.vehicleType || 'ICE';
        const shouldShowFuel = vehicleType === 'ICE' || vehicleType === 'HYBRID' || vehicleType === 'PHEV';
        const shouldShowCharge = vehicleType === 'BEV' || vehicleType === 'PHEV';
        
        const stats = {};
        
        // Calculate average fuel consumption
        if (shouldShowFuel && fillings.length >= 2) {
          const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);
          let totalDistance = 0;
          let totalLiters = 0;
          for (let i = 1; i < sortedFillings.length; i++) {
            const distance = sortedFillings[i].odometer - sortedFillings[i - 1].odometer;
            if (distance <= 0) continue;
            totalDistance += distance;
            totalLiters += sortedFillings[i].liters;
          }
          if (totalDistance > 0) {
            stats.avgFuelConsumption = (totalLiters / totalDistance) * 100;
          }
          
          // Calculate average price per liter
          const totalLitersForPrice = fillings.reduce((sum, f) => sum + (f.liters || 0), 0);
          const totalCostForPrice = fillings.reduce((sum, f) => sum + (f.cost || 0), 0);
          if (totalLitersForPrice > 0) {
            stats.avgPricePerLiter = totalCostForPrice / totalLitersForPrice;
          }
        }
        
        // Calculate average electricity consumption
        if (shouldShowCharge && chargingSessions.length >= 2) {
          const sortedSessions = [...chargingSessions].sort((a, b) => a.odometer - b.odometer);
          let totalDistance = 0;
          let totalEnergy = 0;
          for (let i = 1; i < sortedSessions.length; i++) {
            const distance = sortedSessions[i].odometer - sortedSessions[i - 1].odometer;
            if (distance <= 0) continue;
            totalDistance += distance;
            totalEnergy += sortedSessions[i].energyAdded;
          }
          if (totalDistance > 0) {
            stats.avgElectricityConsumption = (totalEnergy / totalDistance) * 100;
          }
          
          // Calculate average price per kWh
          const totalEnergyForPrice = chargingSessions.reduce((sum, c) => sum + (c.energyAdded || 0), 0);
          const totalCostForPrice = chargingSessions.reduce((sum, c) => sum + (c.cost || 0), 0);
          if (totalEnergyForPrice > 0) {
            stats.avgPricePerKWh = totalCostForPrice / totalEnergyForPrice;
          }
        }
        
        statsMap[vehicleId] = stats;
      });
      
      setVehicleStats(statsMap);
    } catch (error) {
      alert(t("common.error.load"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = (vehicleId) => {
    Alert.alert(
      t("common.delete"),
      t("vehicles.deleteConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId);
              loadVehicles();
            } catch (error) {
              alert(t("common.error.delete"));
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const vehicleType = item.vehicleType || 'ICE';
    
    const renderLeftActions = () => {
      if (vehicleType === 'PHEV') {
        // PHEV: Show two stacked buttons
        return (
          <View style={styles.addActionsContainer}>
            <TouchableOpacity
              style={[styles.addAction, styles.chargeAction]}
              onPress={() => navigation.navigate("AddCharging", { vehicle: item })}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="white" />
              <Text style={styles.addActionText}>{t("charging.add")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addAction, styles.fuelAction]}
              onPress={() => navigation.navigate("AddFilling", { vehicle: item })}
            >
              <MaterialCommunityIcons name="gas-station" size={24} color="white" />
              <Text style={styles.addActionText}>{t("fillings.add")}</Text>
            </TouchableOpacity>
          </View>
        );
      } else if (vehicleType === 'BEV') {
        // BEV: Show charging button only
        return (
          <View style={styles.addActionsContainer}>
            <TouchableOpacity
              style={[styles.addAction, styles.chargeAction]}
              onPress={() => navigation.navigate("AddCharging", { vehicle: item })}
            >
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="white" />
              <Text style={styles.addActionText}>{t("charging.add")}</Text>
            </TouchableOpacity>
          </View>
        );
      } else {
        // ICE/HYBRID: Show filling button only
        return (
          <View style={styles.addActionsContainer}>
            <TouchableOpacity
              style={[styles.addAction, styles.fuelAction]}
              onPress={() => navigation.navigate("AddFilling", { vehicle: item })}
            >
              <MaterialCommunityIcons name="gas-station" size={24} color="white" />
              <Text style={styles.addActionText}>{t("fillings.add")}</Text>
            </TouchableOpacity>
          </View>
        );
      }
    };

    const renderRightActions = () => {
      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteVehicle(item.id)}
        >
          <MaterialCommunityIcons name="trash-can" size={24} color="white" />
        </TouchableOpacity>
      );
    };

    // Get vehicle type icon
    const getVehicleTypeIcon = () => {
      switch (vehicleType) {
        case 'BEV':
          return '⚡';
        case 'PHEV':
          return '🔌';
        case 'ICE':
        case 'HYBRID':
        default:
          return '⛽';
      }
    };

    const stats = vehicleStats[item.id] || {};
    
    const formatNumber = (num, decimals = 1) => {
      if (num === null || num === undefined) return '—';
      return parseFloat(num).toFixed(decimals).replace('.', ',');
    };
    
    // Determine which stats to show based on vehicle type
    const statCards = [];
    
    if (vehicleType === 'PHEV') {
      // PHEV: show fuel consumption and electricity consumption
      if (stats.avgFuelConsumption !== null && stats.avgFuelConsumption !== undefined) {
        statCards.push({
          value: `${formatNumber(stats.avgFuelConsumption)} l/100km`,
          label: t("fillings.consumption"),
        });
      }
      if (stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined) {
        statCards.push({
          value: `${formatNumber(stats.avgElectricityConsumption)} kWh/100km`,
          label: t("charging.avgConsumption"),
        });
      }
    } else if (vehicleType === 'BEV') {
      // BEV: show electricity consumption and average price per kWh
      if (stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined) {
        statCards.push({
          value: `${formatNumber(stats.avgElectricityConsumption)} kWh/100km`,
          label: t("charging.avgConsumption"),
        });
      }
      if (stats.avgPricePerKWh !== null && stats.avgPricePerKWh !== undefined) {
        statCards.push({
          value: `${formatNumber(stats.avgPricePerKWh, 2)} €`,
          label: t("charging.avgPricePerKWh"),
        });
      }
    } else {
      // ICE/HYBRID: show fuel consumption and average price per liter
      if (stats.avgFuelConsumption !== null && stats.avgFuelConsumption !== undefined) {
        statCards.push({
          value: `${formatNumber(stats.avgFuelConsumption)} l/100km`,
          label: t("fillings.consumption"),
        });
      }
      if (stats.avgPricePerLiter !== null && stats.avgPricePerLiter !== undefined) {
        statCards.push({
          value: `${formatNumber(stats.avgPricePerLiter, 2)} €`,
          label: t("fillings.avgPricePerLiter"),
        });
      }
    }
    
    // Limit to max 2 stats
    const displayStats = statCards.slice(0, 2);

    const closeSwipeable = () => {
      if (swipeableRefs.current[item.id]) {
        swipeableRefs.current[item.id].close();
      }
    };

    return (
      <Swipeable 
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item.id] = ref;
          }
        }}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => {
          // Close any other open swipeable
          Object.keys(swipeableRefs.current).forEach((id) => {
            if (id !== item.id && swipeableRefs.current[id]) {
              swipeableRefs.current[id].close();
            }
          });
          setOpenSwipeableId(item.id);
        }}
        onSwipeableWillClose={() => {
          if (openSwipeableId === item.id) {
            setOpenSwipeableId(null);
          }
        }}
      >
        <TouchableOpacity
          style={styles.vehicleItem}
          onPress={() =>
            navigation.navigate("VehicleDetails", { vehicle: item })
          }
        >
          <View style={styles.vehicleContent}>
            <View style={styles.vehicleInfo}>
              <BrandLogo brand={item.make} style={styles.brandLogo} />
              <View style={styles.vehicleNameContainer}>
                <View style={styles.vehicleNameRow}>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                  <Text style={styles.vehicleTypeIcon}>{getVehicleTypeIcon()}</Text>
                </View>
                <View style={styles.vehicleSubtitleRow}>
                  <Text style={styles.vehicleSubtitle}>{item.make} {item.model}</Text>
                </View>
              </View>
            </View>
            {displayStats.length > 0 ? (
              <View style={styles.statsGrid}>
                {displayStats.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>{t("common.notEnoughData")}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleContainerPress = () => {
    // Close any open swipeable when tapping outside
    if (openSwipeableId) {
      Object.keys(swipeableRefs.current).forEach((id) => {
        if (swipeableRefs.current[id]) {
          swipeableRefs.current[id].close();
        }
      });
      setOpenSwipeableId(null);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
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
                contentContainerStyle={styles.listContent}
              />
            )}

            <View style={styles.actionButtonsContainer}>
              <Button
                mode="contained"
                onPress={() => navigation.navigate("AddVehicle")}
                style={styles.addButton}
                labelStyle={styles.buttonLabel}
                buttonColor="#3169ad"
              >
                {t("vehicles.add")}
              </Button>
            </View>
          </>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleItem: {
    marginVertical: 8,
    backgroundColor: "#e0e0e0",
    display: "flex",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
  listContent: {
    paddingBottom: 80,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteAction: {
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center",
    width: "17.5%",
    height: "90%",
    borderRadius: 8,
    marginVertical: 8,
    marginLeft: 8,
  },
  addActionsContainer: {
    display: "flex",
    justifyContent: "space-between",
    width: 80,
    height: "100%",
    paddingVertical: 8,
    gap: 8,
  },
  addAction: {
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    borderRadius: 8,
    flex: 1,
    height: "45%",
  },
  chargeAction: {
    backgroundColor: "#2196F3",
  },
  fuelAction: {
    backgroundColor: "#4CAF50",
  },
  addActionText: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  brandLogo: {
    width: "auto",
    minWidth: 70,
    left: 0,
    top: 0,
    marginRight: 0,
    borderRadius: 0,
    borderWidth: 0,
    padding: 10,
  },
  vehicleContent: {
    alignItems: "center",
    display: "flex",
  },
  vehicleInfo: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  vehicleNameContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    width: "80%",
    justifyContent: "center",
    padding: 10,
  },
  vehicleNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  vehicleTypeIcon: {
    fontSize: 20,
    marginLeft: 8,
    position: "absolute",
    right: 0,
    top: "50%",
  },
  vehicleSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  vehicleTypeText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
  },
  statCard: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
  },
  noDataContainer: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  noDataText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
});
