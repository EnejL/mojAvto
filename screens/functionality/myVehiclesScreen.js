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
import { defaultUserProfile, getUserProfile } from "../../utils/userProfile";

export default function MyVehiclesScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicleStats, setVehicleStats] = useState({});
  const swipeableRefs = useRef({});
  const [openSwipeableId, setOpenSwipeableId] = useState(null);
  const [userSettings, setUserSettings] = useState(defaultUserProfile);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadVehicles();
      loadUserSettings();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const loadInitial = async () => {
      await Promise.all([loadUserSettings(), loadVehicles()]);
    };
    loadInitial();
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

  const loadUserSettings = async () => {
    try {
      const profile = await getUserProfile();
      setUserSettings(profile);
    } catch (error) {
      setUserSettings(defaultUserProfile);
    }
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
      case "USD":
        return "$";
      case "EUR":
      default:
        return "€";
    }
  };

  const convertFuelConsumption = (value) => {
    if (value === null || value === undefined) return { value, unit: "l / 100 km" };
    if (userSettings.unitSystem === "imperial") {
      // Convert L/100km to MPG
      const mpg = 235.214583 / value;
      return { value: mpg, unit: "MPG" };
    }
    return { value, unit: "l / 100 km" };
  };

  const convertElectricConsumption = (value) => {
    if (value === null || value === undefined) return { value, unit: "kWh / 100 km" };
    if (userSettings.unitSystem === "imperial") {
      // kWh/100km -> kWh/100mi
      const per100mi = value * 1.60934;
      return { value: per100mi, unit: "kWh / 100 mi" };
    }
    return { value, unit: "kWh / 100 km" };
  };

  const convertFuelPrice = (value) => {
    if (value === null || value === undefined) return value;
    if (userSettings.unitSystem === "imperial") {
      // price per gallon
      return value * 3.78541;
    }
    return value;
  };

  const formatNumber = (num, decimals = 1) => {
    if (num === null || num === undefined || Number.isNaN(num)) return "—";
    return parseFloat(num).toFixed(decimals).replace(".", ",");
  };

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
          
          // Calculate efficiency cost (cost per km)
          if (totalDistance > 0 && totalCostForPrice > 0) {
            stats.efficiencyCost = totalCostForPrice / totalDistance;
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
          
          // Calculate efficiency cost (cost per km)
          if (totalDistance > 0 && totalCostForPrice > 0) {
            stats.efficiencyCost = totalCostForPrice / totalDistance;
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

    // Get vehicle type info
    const getVehicleTypeInfo = () => {
      switch (vehicleType) {
        case 'BEV':
          return {
            label: t("vehicles.typeBadge.electric"),
            color: '#2196F3',
            icon: 'lightning-bolt',
            bgColor: '#1a237e',
          };
        case 'PHEV':
          return {
            label: t("vehicles.typeBadge.phev"),
            color: '#9C27B0',
            icon: 'car-electric',
            bgColor: '#4a148c',
          };
        case 'HYBRID':
          return {
            label: t("vehicles.typeBadge.mhevFhev"),
            color: '#4CAF50',
            icon: 'car-electric-outline',
            bgColor: '#1b5e20',
          };
        case 'ICE':
        default:
          return {
            label: t("vehicles.typeBadge.gasoline"),
            color: '#FF9800',
            icon: 'gas-station',
            bgColor: '#e65100',
          };
      }
    };

    const vehicleTypeInfo = getVehicleTypeInfo();
    const stats = vehicleStats[item.id] || {};
    const currencySymbol = getCurrencySymbol(userSettings.currency);
    
    // Calculate efficiency cost display
    const getEfficiencyCost = () => {
      if (stats.efficiencyCost !== null && stats.efficiencyCost !== undefined) {
        return `${formatNumber(stats.efficiencyCost, 2)} ${currencySymbol}`;
      }
      return null;
    };
    
    // Get consumption display
    const getConsumption = () => {
      if (vehicleType === 'BEV' || vehicleType === 'PHEV') {
        if (stats.avgElectricityConsumption !== null && stats.avgElectricityConsumption !== undefined) {
          const converted = convertElectricConsumption(stats.avgElectricityConsumption);
          return `${formatNumber(converted.value)} ${converted.unit}`;
        }
      } else {
        if (stats.avgFuelConsumption !== null && stats.avgFuelConsumption !== undefined) {
          const converted = convertFuelConsumption(stats.avgFuelConsumption);
          return `${formatNumber(converted.value)} ${converted.unit}`;
        }
      }
      return null;
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
              <View style={styles.brandLogoContainer}>
                <View style={styles.brandLogoCircle}>
                  <BrandLogo brand={item.make} style={styles.brandLogo} />
                </View>
              </View>
              <View style={styles.vehicleNameContainer}>
                <View style={styles.vehicleNameRow}>
                  <Text style={styles.vehicleName}>{item.name}</Text>
                  <View style={[styles.vehicleTypeBadge, { backgroundColor: vehicleTypeInfo.color }]}>
                    <Text style={styles.vehicleTypeBadgeText}>{vehicleTypeInfo.label}</Text>
                  </View>
                </View>
                <View style={styles.vehicleSubtitleRow}>
                  <Text style={styles.vehicleSubtitle}>{item.make} {item.model}</Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#ffffff" style={styles.arrowIcon} />
            </View>
            {(getConsumption() || getEfficiencyCost()) ? (
              <View style={styles.statsRow}>
                {getConsumption() && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons 
                      name={
                        vehicleType === 'BEV'
                          ? 'battery'
                          : vehicleType === 'PHEV'
                            ? 'car-electric'
                            : vehicleType === 'HYBRID'
                              ? 'car-electric-outline'
                              : 'gas-station'
                      } 
                      size={16} 
                      color={vehicleTypeInfo.color}
                      style={styles.statIcon}
                    />
                    <View>
                      <Text style={styles.statLabel}>{t("vehicles.avgConsumption")}</Text>
                      <Text style={styles.statValue}>{getConsumption()}</Text>
                    </View>
                  </View>
                )}
                {getEfficiencyCost() && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons 
                      name="currency-usd" 
                      size={16} 
                      color="#4CAF50"
                      style={styles.statIcon}
                    />
                    <View>
                      <Text style={styles.statLabel}>{t("vehicles.efficiencyCost")}</Text>
                      <Text style={styles.statValue}>{getEfficiencyCost()} /km</Text>
                    </View>
                  </View>
                )}
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
        <ActivityIndicator size="large" color="#3169ad" />
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
          <ActivityIndicator size="large" color="#3169ad" />
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
    backgroundColor: "#1A1A1A",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
  },
  vehicleItem: {
    marginVertical: 8,
    backgroundColor: "#2A2A2A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  vehicleSubtext: {
    fontSize: 14,
    color: "#cccccc",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#cccccc",
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
    backgroundColor: "#1A1A1A",
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
    height: "85%",
    borderRadius: 8,
    marginVertical: "auto",
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
  brandLogoContainer: {
    position: "relative",
    width: 70,
    height: 70,
    marginRight: 12,
  },
  brandLogoCircle: {
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "gray",
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 4,
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  vehicleContent: {
    width: "100%",
  },
  vehicleInfo: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  vehicleNameContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    paddingRight: 8,
  },
  vehicleNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginRight: 8,
    flexShrink: 1,
  },
  vehicleTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: "auto",
  },
  vehicleTypeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#ffffff",
  },
  vehicleSubtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: "#cccccc",
  },
  arrowIcon: {
    alignSelf: "center",
    marginLeft: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    width: "100%",
    gap: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  statIcon: {
    marginRight: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#999999",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  noDataContainer: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "flex-start",
  },
  noDataText: {
    fontSize: 12,
    color: "#999999",
    fontStyle: "italic",
  },
});
