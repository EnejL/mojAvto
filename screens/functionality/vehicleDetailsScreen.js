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
import { Text, Button, Surface, Divider, FAB } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getVehicleFillings, deleteFilling, getVehicleChargingSessions, deleteChargingSession, getVehicleHistory } from "../../utils/firestore";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import BrandLogo from "../../components/BrandLogo";
import ConsumptionGraph from "../../components/FuelConsumptionGraph";

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

// Helper function to format numbers consistently
const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return "0";
  return parseFloat(value).toFixed(decimals).replace(".", ",");
};

// Helper function to format odometer readings with thousand separators
const formatOdometer = (value) => {
  if (value === null || value === undefined) return "0";
  return Math.round(parseFloat(value)).toLocaleString('de-DE');
};

export default function VehicleDetailsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { vehicle } = route.params;
  const [fillings, setFillings] = useState([]);
  const [chargingSessions, setChargingSessions] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  // Get vehicle type or default to ICE for backwards compatibility
  const vehicleType = vehicle.vehicleType || 'ICE';

  // Determine what buttons to show based on vehicle type
  const shouldShowFuelButton = () => {
    return vehicleType === 'ICE' || vehicleType === 'HYBRID' || vehicleType === 'PHEV';
  };

  const shouldShowChargeButton = () => {
    return vehicleType === 'BEV' || vehicleType === 'PHEV';
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        let promises = [];
        
        // Load fillings for fuel-compatible vehicles
        if (shouldShowFuelButton()) {
          promises.push(getVehicleFillings(vehicle.id));
        } else {
          promises.push(Promise.resolve([]));
        }

        // Load charging sessions for electric-compatible vehicles
        if (shouldShowChargeButton()) {
          promises.push(getVehicleChargingSessions(vehicle.id));
        } else {
          promises.push(Promise.resolve([]));
        }

        const [vehicleFillings, vehicleChargingSessions] = await Promise.all(promises);
        
        setFillings(vehicleFillings);
        setChargingSessions(vehicleChargingSessions);

        // Load combined history if this is a PHEV (has both types)
        if (vehicleType === 'PHEV') {
          const history = await getVehicleHistory(vehicle.id);
          setCombinedHistory(history);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();

    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, vehicle.id, vehicleType]);

  // Calculate average fuel consumption (l/100km)
  const averageFuelConsumption = useMemo(() => {
    if (fillings.length < 2 || !shouldShowFuelButton()) return null;

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
  }, [fillings, shouldShowFuelButton]);

  // Calculate average electricity consumption (kWh/100km)
  const averageElectricityConsumption = useMemo(() => {
    if (chargingSessions.length < 2 || !shouldShowChargeButton()) return null;

    // Sort charging sessions by odometer reading (ascending)
    const sortedSessions = [...chargingSessions].sort(
      (a, b) => a.odometer - b.odometer
    );

    // Calculate total distance and total energy
    let totalDistance = 0;
    let totalEnergy = 0;

    for (let i = 1; i < sortedSessions.length; i++) {
      const distance =
        sortedSessions[i].odometer - sortedSessions[i - 1].odometer;
      
      // Skip invalid distances (e.g., negative or zero)
      if (distance <= 0) continue;
      
      totalDistance += distance;
      totalEnergy += sortedSessions[i].energyAdded;
    }

    // Calculate average consumption (kWh per 100 km)
    if (totalDistance === 0) return null;
    return (totalEnergy / totalDistance) * 100;
  }, [chargingSessions, shouldShowChargeButton]);

  // Calculate average cost per filling
  const averageFuelCost = useMemo(() => {
    if (fillings.length === 0) return null;
    const totalCost = fillings.reduce((sum, filling) => sum + filling.cost, 0);
    return totalCost / fillings.length;
  }, [fillings]);

  // Calculate average cost per charging session
  const averageChargingCost = useMemo(() => {
    if (chargingSessions.length === 0) return null;
    const totalCost = chargingSessions.reduce((sum, session) => sum + session.cost, 0);
    return totalCost / chargingSessions.length;
  }, [chargingSessions]);

  // Calculate average price per liter for fuel
  const averagePricePerLiter = useMemo(() => {
    if (fillings.length === 0) return null;
    const totalLiters = fillings.reduce((sum, filling) => sum + filling.liters, 0);
    const totalCost = fillings.reduce((sum, filling) => sum + filling.cost, 0);
    return totalLiters > 0 ? totalCost / totalLiters : null;
  }, [fillings]);

  // Calculate average price per kWh for electricity
  const averagePricePerKWh = useMemo(() => {
    if (chargingSessions.length === 0) return null;
    const totalEnergy = chargingSessions.reduce((sum, session) => sum + session.energyAdded, 0);
    const totalCost = chargingSessions.reduce((sum, session) => sum + session.cost, 0);
    return totalEnergy > 0 ? totalCost / totalEnergy : null;
  }, [chargingSessions]);

  // Calculate total costs
  const totalFuelCost = useMemo(() => {
    if (fillings.length === 0) return null;
    return fillings.reduce((sum, filling) => sum + filling.cost, 0);
  }, [fillings]);

  const totalChargingCost = useMemo(() => {
    if (chargingSessions.length === 0) return null;
    return chargingSessions.reduce((sum, session) => sum + session.cost, 0);
  }, [chargingSessions]);

  // Calculate total distance driven for fuel
  const totalFuelDistance = useMemo(() => {
    if (fillings.length < 2 || !shouldShowFuelButton()) return null;
    const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);
    return sortedFillings[sortedFillings.length - 1].odometer - sortedFillings[0].odometer;
  }, [fillings, shouldShowFuelButton]);

  // Calculate total distance driven for electricity
  const totalElectricityDistance = useMemo(() => {
    if (chargingSessions.length < 2 || !shouldShowChargeButton()) return null;
    const sortedSessions = [...chargingSessions].sort((a, b) => a.odometer - b.odometer);
    return sortedSessions[sortedSessions.length - 1].odometer - sortedSessions[0].odometer;
  }, [chargingSessions, shouldShowChargeButton]);

  // Calculate average distance per filling
  const averageDistancePerFilling = useMemo(() => {
    if (fillings.length < 2 || !shouldShowFuelButton()) return null;
    return totalFuelDistance / (fillings.length - 1);
  }, [totalFuelDistance, fillings.length, shouldShowFuelButton]);

  // Calculate average distance per charging session
  const averageDistancePerCharging = useMemo(() => {
    if (chargingSessions.length < 2 || !shouldShowChargeButton()) return null;
    return totalElectricityDistance / (chargingSessions.length - 1);
  }, [totalElectricityDistance, chargingSessions.length, shouldShowChargeButton]);

  // Calculate days since last filling/charging
  const daysSinceLastFilling = useMemo(() => {
    if (fillings.length === 0 || !shouldShowFuelButton()) return null;
    const lastFilling = fillings.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    })[0];
    const lastDate = lastFilling.date?.seconds ? new Date(lastFilling.date.seconds * 1000) : new Date(lastFilling.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [fillings, shouldShowFuelButton]);

  const daysSinceLastCharging = useMemo(() => {
    if (chargingSessions.length === 0 || !shouldShowChargeButton()) return null;
    const lastSession = chargingSessions.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    })[0];
    const lastDate = lastSession.date?.seconds ? new Date(lastSession.date.seconds * 1000) : new Date(lastSession.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [chargingSessions, shouldShowChargeButton]);

  // Sort fillings by date (newest first) for display
  const sortedFillings = useMemo(() => {
    if (!shouldShowFuelButton()) return [];
    return [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA; // Newest first
    });
  }, [fillings, shouldShowFuelButton]);

  // Sort charging sessions by date (newest first) for display
  const sortedChargingSessions = useMemo(() => {
    if (!shouldShowChargeButton()) return [];
    return [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA; // Newest first
    });
  }, [chargingSessions, shouldShowChargeButton]);

  // Calculate longest distance on single tank/charge
  const longestDistanceSingleTank = useMemo(() => {
    if (fillings.length < 2 || !shouldShowFuelButton()) return null;
    const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);
    let maxDistance = 0;
    for (let i = 1; i < sortedFillings.length; i++) {
      const distance = sortedFillings[i].odometer - sortedFillings[i - 1].odometer;
      if (distance > 0 && distance > maxDistance) maxDistance = distance;
    }
    return maxDistance;
  }, [fillings, shouldShowFuelButton]);

  const longestDistanceSingleCharge = useMemo(() => {
    if (chargingSessions.length < 2 || !shouldShowChargeButton()) return null;
    const sortedSessions = [...chargingSessions].sort((a, b) => a.odometer - b.odometer);
    let maxDistance = 0;
    for (let i = 1; i < sortedSessions.length; i++) {
      const distance = sortedSessions[i].odometer - sortedSessions[i - 1].odometer;
      if (distance > 0 && distance > maxDistance) maxDistance = distance;
    }
    return maxDistance;
  }, [chargingSessions, shouldShowChargeButton]);

  // Calculate average distance on single tank/charge (already calculated above as averageDistancePerFilling/Charging)
  const averageDistanceSingleTank = averageDistancePerFilling;
  const averageDistanceSingleCharge = averageDistancePerCharging;

  // Calculate average number of days between fillings/charging
  const averageDaysBetweenFillings = useMemo(() => {
    if (fillings.length < 2 || !shouldShowFuelButton()) return null;
    const sortedFillings = fillings.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateA - dateB;
    });
    let totalDays = 0;
    for (let i = 1; i < sortedFillings.length; i++) {
      const dateA = sortedFillings[i - 1].date?.seconds ? new Date(sortedFillings[i - 1].date.seconds * 1000) : new Date(sortedFillings[i - 1].date);
      const dateB = sortedFillings[i].date?.seconds ? new Date(sortedFillings[i].date.seconds * 1000) : new Date(sortedFillings[i].date);
      totalDays += Math.floor((dateB - dateA) / (1000 * 60 * 60 * 24));
    }
    return totalDays / (sortedFillings.length - 1);
  }, [fillings, shouldShowFuelButton]);

  const averageDaysBetweenCharging = useMemo(() => {
    if (chargingSessions.length < 2 || !shouldShowChargeButton()) return null;
    const sortedSessions = chargingSessions.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateA - dateB;
    });
    let totalDays = 0;
    for (let i = 1; i < sortedSessions.length; i++) {
      const dateA = sortedSessions[i - 1].date?.seconds ? new Date(sortedSessions[i - 1].date.seconds * 1000) : new Date(sortedSessions[i - 1].date);
      const dateB = sortedSessions[i].date?.seconds ? new Date(sortedSessions[i].date.seconds * 1000) : new Date(sortedSessions[i].date);
      totalDays += Math.floor((dateB - dateA) / (1000 * 60 * 60 * 24));
    }
    return totalDays / (sortedSessions.length - 1);
  }, [chargingSessions, shouldShowChargeButton]);

  // Calculate average cost per day
  const averageCostPerDayFuel = useMemo(() => {
    if (fillings.length === 0 || !shouldShowFuelButton()) return null;
    const sortedFillings = fillings.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateA - dateB;
    });
    const firstDate = sortedFillings[0].date?.seconds ? new Date(sortedFillings[0].date.seconds * 1000) : new Date(sortedFillings[0].date);
    const today = new Date();
    const totalDays = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? totalFuelCost / totalDays : null;
  }, [totalFuelCost, fillings, shouldShowFuelButton]);

  const averageCostPerDayCharging = useMemo(() => {
    if (chargingSessions.length === 0 || !shouldShowChargeButton()) return null;
    const sortedSessions = chargingSessions.sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateA - dateB;
    });
    const firstDate = sortedSessions[0].date?.seconds ? new Date(sortedSessions[0].date.seconds * 1000) : new Date(sortedSessions[0].date);
    const today = new Date();
    const totalDays = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? totalChargingCost / totalDays : null;
  }, [totalChargingCost, chargingSessions, shouldShowChargeButton]);

  // Calculate average cost per 100km for fuel
  const averageFuelCostPer100km = useMemo(() => {
    if (fillings.length < 2 || !shouldShowFuelButton()) return null;

    // Sort fillings by odometer reading (ascending)
    const sortedFillings = [...fillings].sort(
      (a, b) => a.odometer - b.odometer
    );

    // Calculate total distance and total cost
    let totalDistance = 0;
    let totalCost = 0;

    for (let i = 1; i < sortedFillings.length; i++) {
      const distance =
        sortedFillings[i].odometer - sortedFillings[i - 1].odometer;
      
      // Skip invalid distances (e.g., negative or zero)
      if (distance <= 0) continue;
      
      totalDistance += distance;
      totalCost += sortedFillings[i].cost;
    }

    // Calculate average cost per 100km
    if (totalDistance === 0) return null;
    return (totalCost / totalDistance) * 100;
  }, [fillings, shouldShowFuelButton]);

  // Calculate average cost per 100km for electricity
  const averageElectricityCostPer100km = useMemo(() => {
    if (chargingSessions.length < 2 || !shouldShowChargeButton()) return null;

    // Sort charging sessions by odometer reading (ascending)
    const sortedSessions = [...chargingSessions].sort(
      (a, b) => a.odometer - b.odometer
    );

    // Calculate total distance and total cost
    let totalDistance = 0;
    let totalCost = 0;

    for (let i = 1; i < sortedSessions.length; i++) {
      const distance =
        sortedSessions[i].odometer - sortedSessions[i - 1].odometer;
      
      // Skip invalid distances (e.g., negative or zero)
      if (distance <= 0) continue;
      
      totalDistance += distance;
      totalCost += sortedSessions[i].cost;
    }

    // Calculate average cost per 100km
    if (totalDistance === 0) return null;
    return (totalCost / totalDistance) * 100;
  }, [chargingSessions, shouldShowChargeButton]);

  const renderHistoryItem = ({ item }) => {
    const renderRightActions = () => {
      return (
        <View style={styles.deleteAction}>
          <Button
            icon="trash-can"
            textColor="#fff"
            onPress={() => handleDeleteHistoryItem(item)}
            style={styles.deleteActionButton}
          />
        </View>
      );
    };

    const handleDeleteHistoryItem = (item) => {
      const confirmMessage = item.type === 'filling' 
        ? t("fillings.deleteConfirmMessage") 
        : t("charging.deleteConfirmMessage");
        
      Alert.alert(t("common.delete"), confirmMessage, [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              if (item.type === 'filling') {
                await deleteFilling(vehicle.id, item.id);
                const updatedFillings = fillings.filter(f => f.id !== item.id);
                setFillings(updatedFillings);
              } else {
                await deleteChargingSession(vehicle.id, item.id);
                const updatedSessions = chargingSessions.filter(s => s.id !== item.id);
                setChargingSessions(updatedSessions);
              }
              
              // Refresh combined history for PHEV
              if (vehicleType === 'PHEV') {
                const history = await getVehicleHistory(vehicle.id);
                setCombinedHistory(history);
              }
            } catch (error) {
              console.error("Error deleting item:", error);
              alert(t("common.error.delete"));
            }
          },
        },
      ]);
    };

    const isCharging = item.type === 'charging';
    const icon = isCharging ? "⚡️" : "⛽";

    return (
      <GestureHandlerRootView style={styles.gestureContainer}>
        <Swipeable
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
          rightThreshold={40}
        >
          <TouchableOpacity
            onPress={() => {
              if (isCharging) {
                navigation.navigate("EditCharging", {
                  chargingSession: item,
                  vehicleId: vehicle.id,
                });
              } else {
                navigation.navigate("EditFilling", {
                  filling: item,
                  vehicleId: vehicle.id,
                });
              }
            }}
          >
            <Surface style={styles.fillingItem}>
              <View style={styles.fillingContent}>
                <View style={styles.fillingHeader}>
                  <Text style={styles.fillingIcon}>{icon}</Text>
                  <Text style={styles.fillingType}>
                    {isCharging ? t("charging.session") : t("fillings.filling")}
                  </Text>
                </View>
                
                <View style={styles.fillingDetails}>
                  <View style={styles.fillingLabels}>
                    <Text style={styles.fillingLabel}>{t("charging.date")}:</Text>
                    <Text style={styles.fillingLabel}>{t("charging.odometer")}:</Text>
                    <Text style={styles.fillingLabel}>
                      {isCharging ? t("charging.energyAdded") : t("fillings.liters")}:
                    </Text>
                    <Text style={styles.fillingLabel}>{t("fillings.cost")}:</Text>
                  </View>

                  <View style={styles.fillingValues}>
                    <Text style={styles.fillingValue}>{formatDate(item.date)}</Text>
                    <Text style={styles.fillingValue}>
                      {formatOdometer(item.odometer)} km
                    </Text>
                    <Text style={styles.fillingValue}>
                      {isCharging 
                        ? `${formatNumber(item.energyAdded, 2)} kWh`
                        : `${formatNumber(item.liters, 2)} L`
                      }
                    </Text>
                    <Text style={styles.fillingValue}>
                      {formatNumber(item.cost, 2)} €
                    </Text>
                  </View>
                </View>
              </View>
            </Surface>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  // Create action buttons based on vehicle type
  const renderActionButtons = () => {
    const showFuel = shouldShowFuelButton();
    const showCharge = shouldShowChargeButton();

    if (showFuel && showCharge) {
      // PHEV - show both buttons (keep existing layout)
      return (
        <View style={styles.actionButtonsContainer}>
          <FAB
            style={[styles.fab, styles.fuelFab]}
            icon="gas-station"
            label={t("fillings.add")}
            onPress={() => navigation.navigate("AddFilling", { vehicle })}
          />
          <FAB
            style={[styles.fab, styles.chargeFab]}
            icon="lightning-bolt"
            label={t("charging.add")}
            onPress={() => navigation.navigate("AddCharging", { vehicle })}
          />
        </View>
      );
    } else if (showCharge) {
      // BEV - show only charge button (using container approach for consistency)
      return (
        <View style={styles.actionButtonsContainer}>
        <FAB
            style={[styles.fab, styles.chargeFab]}
          icon="lightning-bolt"
          label={t("charging.add")}
          onPress={() => navigation.navigate("AddCharging", { vehicle })}
        />
        </View>
      );
    } else {
      // ICE/HYBRID - show only fuel button (using container approach for consistency)
      return (
        <View style={styles.actionButtonsContainer}>
        <FAB
            style={[styles.fab, styles.fuelFab]}
          icon="gas-station"
          label={t("fillings.add")}
          onPress={() => navigation.navigate("AddFilling", { vehicle })}
        />
        </View>
      );
    }
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
                <View style={styles.vehicleSubtitleContainer}>
                  <Text style={styles.vehicleSubtitle}>
                    {vehicle.make} {vehicle.model}
                  </Text>
                  <Text style={styles.vehicleTypeText}>
                    {t(`vehicles.types.${vehicleType}`)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Surface>

        {/* Vehicle Statistics - Different layouts for PHEV vs others */}
        {vehicleType === 'PHEV' ? (
          // PHEV: Separate cards for fuel, electricity, and combined costs
          <>
            {/* Fuel Consumption Card for PHEV */}
            {averageFuelConsumption !== null && fillings.length >= 2 && (
              <Surface style={styles.statsCard}>
                <View style={styles.statCardHeader}>
                  <Text style={styles.statCardIcon}>⛽</Text>
                  <Text style={styles.statCardTitle}>{t("fillings.nav")}</Text>
                </View>
                <View style={styles.statCardContent}>
                  {/* Primary consumption metric */}
                  <View style={styles.primaryMetricContainer}>
                    <Text style={styles.statCardPrimaryValue}>
                      {formatNumber(averageFuelConsumption)} l / 100km
                    </Text>
                    <Text style={styles.primaryMetricLabel}>{t("fillings.consumption")}</Text>
                  </View>
                  
                  {/* Secondary metrics in grid */}
                  <View style={styles.secondaryMetricsGrid}>
                    {averageFuelCostPer100km !== null && (
                      <View style={styles.secondaryMetricItem}>
                        <Text style={styles.secondaryMetricValue}>
                          {formatNumber(averageFuelCostPer100km, 2)} €
                        </Text>
                        <Text style={styles.secondaryMetricLabel}>{t("vehicles.avgCostPer100km")}</Text>
                      </View>
                    )}

                      {averagePricePerLiter !== null && (
                       <View style={styles.secondaryMetricItem}>
                         <Text style={styles.secondaryMetricValue}>
                           {formatNumber(averagePricePerLiter, 2)} €
                         </Text>
                         <Text style={styles.secondaryMetricLabel}>{t("fillings.avgPricePerLiter")}</Text>
                       </View>
                     )}

                     {averageFuelCost !== null && (
                       <View style={styles.secondaryMetricItem}>
                         <Text style={styles.secondaryMetricValue}>
                           {formatNumber(averageFuelCost, 2)} €
                         </Text>
                         <Text style={styles.secondaryMetricLabel}>{t("fillings.avgCost")}</Text>
                       </View>
                     )}

                     <View style={styles.secondaryMetricItem}>
                       <Text style={styles.secondaryMetricValue}>
                         {formatNumber(totalFuelCost, 2)} €
                       </Text>
                       <Text style={styles.secondaryMetricLabel}>{t("fillings.totalCost")}</Text>
                     </View>
                  </View>
                </View>
              </Surface>
            )}

            {/* Electric Consumption Card for PHEV */}
            {averageElectricityConsumption !== null && chargingSessions.length >= 2 && (
              <Surface style={styles.statsCard}>
                <View style={styles.statCardHeader}>
                  <Text style={styles.statCardIcon}>⚡</Text>
                  <Text style={styles.statCardTitle}>{t("charging.nav")}</Text>
                </View>
                <View style={styles.statCardContent}>
                  {/* Primary consumption metric */}
                  <View style={styles.primaryMetricContainer}>
                    <Text style={styles.statCardPrimaryValue}>
                      {formatNumber(averageElectricityConsumption)} kWh / 100km
                    </Text>
                    <Text style={styles.primaryMetricLabel}>{t("charging.avgConsumption")}</Text>
                  </View>
                  
                  {/* Secondary metrics in grid */}
                  <View style={styles.secondaryMetricsGrid}>
                     {averageElectricityCostPer100km !== null && (
                       <View style={styles.secondaryMetricItem}>
                         <Text style={styles.secondaryMetricValue}>
                           {formatNumber(averageElectricityCostPer100km, 2)} €
                         </Text>
                         <Text style={styles.secondaryMetricLabel}>{t("vehicles.avgCostPer100km")}</Text>
                       </View>
                     )}
                     
                     {averagePricePerKWh !== null && (
                      <View style={styles.secondaryMetricItem}>
                        <Text style={styles.secondaryMetricValue}>
                          {formatNumber(averagePricePerKWh, 2)} €
                        </Text>
                        <Text style={styles.secondaryMetricLabel}>{t("charging.avgPricePerKWh")}</Text>
                      </View>
                     )}

                     {averageChargingCost !== null && (
                       <View style={styles.secondaryMetricItem}>
                         <Text style={styles.secondaryMetricValue}>
                           {formatNumber(averageChargingCost, 2)} €
                         </Text>
                         <Text style={styles.secondaryMetricLabel}>{t("charging.avgCost")}</Text>
                       </View>
                     )}

                     <View style={styles.secondaryMetricItem}>
                       <Text style={styles.secondaryMetricValue}>
                         {formatNumber(totalChargingCost, 2)} €
                       </Text>
                       <Text style={styles.secondaryMetricLabel}>{t("charging.totalCost")}</Text>
                     </View>
                  </View>
                </View>
              </Surface>
            )}

            {/* Combined Running Cost Card for PHEV */}
            {(totalFuelCost !== null || totalChargingCost !== null) && (fillings.length >= 2 || chargingSessions.length >= 2) && (() => {
              // Calculate combined metrics using all events
              const allEvents = [
                ...fillings.map(f => ({...f, type: 'fuel'})), 
                ...chargingSessions.map(c => ({...c, type: 'charging'}))
              ];
              const sortedEvents = allEvents.sort((a, b) => a.odometer - b.odometer);
              
              let totalCombinedDistance = 0;
              if (sortedEvents.length >= 2) {
                totalCombinedDistance = sortedEvents[sortedEvents.length - 1].odometer - sortedEvents[0].odometer;
              }
              
              const totalCombinedCost = (totalFuelCost || 0) + (totalChargingCost || 0);
              const costPer100km = totalCombinedDistance > 0 ? (totalCombinedCost / totalCombinedDistance) * 100 : 0;
              // Assuming 1200km per month
              // const monthlyEstimate = costPer100km * 12;
              
              return (
                <Surface style={styles.statsCard}>
                  <View style={styles.statCardHeader}>
                    <Text style={styles.statCardIcon}>💰</Text>
                    <Text style={styles.statCardTitle}>{t("vehicles.trueRunningCost")}</Text>
                  </View>
                  <View style={styles.statCardContent}>
                    {/* Primary cost metric */}
                    <View style={styles.primaryMetricContainer}>
                      <Text style={styles.statCardPrimaryValue}>
                        {formatNumber(costPer100km, 2)} € / 100km
                      </Text>
                      <Text style={styles.primaryMetricLabel}>{t("vehicles.avgCostPer100km")}</Text>
                    </View>
                    
                    {/* Secondary metrics */}
                    {/* <View style={styles.secondaryMetricsGrid}>
                      <View style={styles.secondaryMetricItem}>
                        <Text style={styles.secondaryMetricValue}>
                          {formatNumber(monthlyEstimate, 0)} €
                        </Text>
                        <Text style={styles.secondaryMetricLabel}>{t("vehicles.monthlyEstimate")}</Text>
                      </View>
                      
                      <View style={styles.secondaryMetricItem}>
                        <Text style={styles.secondaryMetricValue}>
                          {formatNumber(totalCombinedCost, 2)} €
                        </Text>
                        <Text style={styles.secondaryMetricLabel}>{t("vehicles.totalCost")}</Text>
                      </View>
                    </View> */}
                  </View>
                </Surface>
              );
            })()}
          </>
        ) : (
          // ICE/HYBRID/BEV: Use appropriate card layout based on vehicle type
          (() => {
            // For ICE/HYBRID: Show fuel statistics
            if (shouldShowFuelButton() && averageFuelConsumption !== null && fillings.length >= 2) {
              return (
                <Surface style={styles.statsCard}>
                  <View style={styles.statCardHeader}>
                    <Text style={styles.statCardIcon}>⛽</Text>
                    <Text style={styles.statCardTitle}>{t("fillings.nav")}</Text>
                  </View>
                  <View style={styles.statCardContent}>
                    {/* Primary consumption metric */}
                    <View style={styles.primaryMetricContainer}>
                      <Text style={styles.statCardPrimaryValue}>
                        {formatNumber(averageFuelConsumption)} l / 100km
                      </Text>
                      <Text style={styles.primaryMetricLabel}>{t("fillings.consumption")}</Text>
                    </View>
                    {/* Secondary metrics in grid */}
                    <View style={styles.secondaryMetricsGrid}>
                      {averageFuelCostPer100km !== null && (
                        <View style={styles.secondaryMetricItem}>
                          <Text style={styles.secondaryMetricValue}>
                            {formatNumber(averageFuelCostPer100km, 2)} €
                          </Text>
                          <Text style={styles.secondaryMetricLabel}>{t("vehicles.avgCostPer100km")}</Text>
                        </View>
                      )}
                      {averagePricePerLiter !== null && (
                        <View style={styles.secondaryMetricItem}>
                          <Text style={styles.secondaryMetricValue}>
                            {formatNumber(averagePricePerLiter, 2)} €
                          </Text>
                          <Text style={styles.secondaryMetricLabel}>{t("fillings.avgPricePerLiter")}</Text>
                        </View>
                      )}
                      {averageFuelCost !== null && (
                        <View style={styles.secondaryMetricItem}>
                          <Text style={styles.secondaryMetricValue}>
                            {formatNumber(averageFuelCost, 2)} €
                          </Text>
                          <Text style={styles.secondaryMetricLabel}>{t("fillings.avgCost")}</Text>
                        </View>
                      )}
                      <View style={styles.secondaryMetricItem}>
                        <Text style={styles.secondaryMetricValue}>
                          {formatNumber(totalFuelCost, 2)} €
                        </Text>
                        <Text style={styles.secondaryMetricLabel}>{t("fillings.totalCost")}</Text>
                      </View>
                    </View>
                  </View>
                </Surface>
              );
            }
            
            // For BEV: Show electricity statistics
            if (shouldShowChargeButton() && averageElectricityConsumption !== null && chargingSessions.length >= 2) {
              return (
                <Surface style={styles.statsCard}>
                  <View style={styles.statCardHeader}>
                    <Text style={styles.statCardIcon}>⚡</Text>
                    <Text style={styles.statCardTitle}>{t("charging.nav")}</Text>
                  </View>
                  <View style={styles.statCardContent}>
                    {/* Primary consumption metric */}
                    <View style={styles.primaryMetricContainer}>
                      <Text style={styles.statCardPrimaryValue}>
                        {formatNumber(averageElectricityConsumption)} kWh / 100km
                      </Text>
                      <Text style={styles.primaryMetricLabel}>{t("charging.avgConsumption")}</Text>
                    </View>
                    {/* Secondary metrics in grid */}
                    <View style={styles.secondaryMetricsGrid}>
                      {averageElectricityCostPer100km !== null && (
                        <View style={styles.secondaryMetricItem}>
                          <Text style={styles.secondaryMetricValue}>
                            {formatNumber(averageElectricityCostPer100km, 2)} €
                          </Text>
                          <Text style={styles.secondaryMetricLabel}>{t("vehicles.avgCostPer100km")}</Text>
                        </View>
                      )}
                      {averagePricePerKWh !== null && (
                        <View style={styles.secondaryMetricItem}>
                          <Text style={styles.secondaryMetricValue}>
                            {formatNumber(averagePricePerKWh, 2)} €
                          </Text>
                          <Text style={styles.secondaryMetricLabel}>{t("charging.avgPricePerKWh")}</Text>
                        </View>
                      )}
                      {averageChargingCost !== null && (
                        <View style={styles.secondaryMetricItem}>
                          <Text style={styles.secondaryMetricValue}>
                            {formatNumber(averageChargingCost, 2)} €
                          </Text>
                          <Text style={styles.secondaryMetricLabel}>{t("charging.avgCost")}</Text>
                        </View>
                      )}
                      <View style={styles.secondaryMetricItem}>
                        <Text style={styles.secondaryMetricValue}>
                          {formatNumber(totalChargingCost, 2)} €
                        </Text>
                        <Text style={styles.secondaryMetricLabel}>{t("charging.totalCost")}</Text>
                      </View>
                    </View>
                  </View>
                </Surface>
              );
            }
            
            // No data available
            return (
              <Surface style={styles.statsCard}>
                <Text style={styles.sectionTitle}>{t("vehicles.statistics")}</Text>
                <Text style={styles.emptyText}>
                  {shouldShowChargeButton() ? t("charging.notEnoughData") : t("fillings.notEnoughData")}
                </Text>
              </Surface>
            );
          })()
        )}

        {/* Advanced Statistics Section - Only show if enough data exists */}
        {((shouldShowFuelButton() && fillings.length >= 3) || 
          (shouldShowChargeButton() && chargingSessions.length >= 3)) && (
          <>
            {!showAdvancedStats ? (
              <Surface style={styles.statsCard}>
                <Button mode="contained" onPress={() => setShowAdvancedStats(true)}>
                  {t("vehicles.additionalStatistics")}
                </Button>
              </Surface>
            ) : (
              <Surface style={styles.statsCard}>
            <View style={styles.advancedStatsHeader}>
              <Text style={styles.sectionTitle}>{t("vehicles.additionalStatistics")}</Text>
              <Button mode="text" onPress={() => setShowAdvancedStats(false)}>
                {t("common.hide")}
              </Button>
            </View>

            <View style={styles.advancedStatsContent}>
              {/* Fuel Statistics */}
              {shouldShowFuelButton() && fillings.length >= 2 && (
                <View style={styles.advancedStatsSection}>
                  <Text style={styles.advancedStatsSectionTitle}>⛽ {t("fillings.nav")}</Text>
                  <View style={styles.advancedStatsGrid}>
                    {averageDistancePerFilling !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(averageDistancePerFilling)} km
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.avgDistancePerFilling")}</Text>
                      </View>
                    )}
                    {longestDistanceSingleTank !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(longestDistanceSingleTank)} km
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.longestDistanceSingleTank")}</Text>
                      </View>
                    )}
                    {daysSinceLastFilling !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {daysSinceLastFilling}
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.daysSinceLastFilling")}</Text>
                      </View>
                    )}
                    {averageDaysBetweenFillings !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(averageDaysBetweenFillings, 1)}
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.avgDaysBetweenFillings")}</Text>
                      </View>
                    )}
                    {averageCostPerDayFuel !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(averageCostPerDayFuel, 2)} €
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.avgCostPerDayFuel")}</Text>
                      </View>
                    )}
                    {totalFuelDistance !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatOdometer(totalFuelDistance)} km
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.totalDistance")}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Charging Statistics */}
              {shouldShowChargeButton() && chargingSessions.length >= 2 && (
                <View style={styles.advancedStatsSection}>
                  <Text style={styles.advancedStatsSectionTitle}>⚡ {t("charging.title")}</Text>
                  <View style={styles.advancedStatsGrid}>
                    {averageDistancePerCharging !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(averageDistancePerCharging)} km
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.avgDistancePerCharging")}</Text>
                      </View>
                    )}
                    {longestDistanceSingleCharge !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(longestDistanceSingleCharge)} km
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.longestDistanceSingleCharge")}</Text>
                      </View>
                    )}
                    {daysSinceLastCharging !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {daysSinceLastCharging}
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.daysSinceLastCharging")}</Text>
                      </View>
                    )}
                    {averageDaysBetweenCharging !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(averageDaysBetweenCharging, 1)}
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.avgDaysBetweenCharging")}</Text>
                      </View>
                    )}
                    {averageCostPerDayCharging !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatNumber(averageCostPerDayCharging, 2)} €
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.avgCostPerDayCharging")}</Text>
                      </View>
                    )}
                    {totalElectricityDistance !== null && (
                      <View style={styles.advancedStatItem}>
                        <Text style={styles.advancedStatValue}>
                          {formatOdometer(totalElectricityDistance)} km
                        </Text>
                        <Text style={styles.advancedStatLabel}>{t("vehicles.totalDistance")}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
              </View>
            </Surface>
            )}
          </>
        )}

        {/* Consumption Graph - Show for all vehicle types when 5+ entries exist */}
        {(() => {
          // Calculate total entries based on vehicle type
          let totalEntries = 0;
          let graphData = [];
          let graphDataType = 'fuel';

          if (vehicleType === 'PHEV') {
            // For PHEV, use combined history
            totalEntries = combinedHistory.length;
            graphData = combinedHistory;
            graphDataType = 'combined'; // Will handle mixed types
          } else if (shouldShowFuelButton()) {
            // For ICE/HYBRID, use fillings
            totalEntries = fillings.length;
            graphData = fillings;
            graphDataType = 'fuel';
          } else if (shouldShowChargeButton()) {
            // For BEV, use charging sessions
            totalEntries = chargingSessions.length;
            graphData = chargingSessions;
            graphDataType = 'electricity';
          }

          // Only show graph if we have 5 or more entries
          if (totalEntries >= 5 && graphData.length >= 5) {
            return <ConsumptionGraph data={graphData} dataType={graphDataType} />;
          }
          return null;
        })()}

        {/* History Section for PHEV, individual sections for others */}
        {vehicleType === 'PHEV' ? (
          <Surface style={styles.fillingsCard}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t("vehicles.history")}</Text>
              <Text style={styles.fillingCount}>({combinedHistory.length})</Text>
            </View>
            {combinedHistory.length === 0 ? (
              <Text style={styles.emptyText}>{t("vehicles.noHistory")}</Text>
            ) : (
              <FlatList
                data={combinedHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                scrollEnabled={false}
              />
            )}
          </Surface>
        ) : (
          <>
            {/* Fuel Fillings Section */}
            {shouldShowFuelButton() && (
              <Surface style={styles.fillingsCard}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>{t("fillings.title")}</Text>
                  <Text style={styles.fillingCount}>({fillings.length})</Text>
                </View>
                {fillings.length === 0 ? (
                  <Text style={styles.emptyText}>{t("fillings.empty")}</Text>
                ) : (
                  <FlatList
                    data={sortedFillings.map(f => ({ ...f, type: 'filling' }))}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                )}
              </Surface>
            )}

            {/* Charging Sessions Section */}
            {shouldShowChargeButton() && (
              <Surface style={styles.fillingsCard}>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>{t("charging.title")}</Text>
                  <Text style={styles.fillingCount}>({chargingSessions.length})</Text>
                </View>
                {chargingSessions.length === 0 ? (
                  <Text style={styles.emptyText}>{t("charging.empty")}</Text>
                ) : (
                  <FlatList
                    data={sortedChargingSessions.map(s => ({ ...s, type: 'charging' }))}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                  />
                )}
              </Surface>
            )}
          </>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {renderActionButtons()}
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
    width: 80,
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
    marginBottom: 4,
  },
  vehicleSubtitleContainer: {
    flexDirection: "column",
  },
  vehicleTypeText: {
    fontSize: 10,
    color: "#888",
    fontStyle: "italic",
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
  // PHEV Statistics Card Styles
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statCardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  statCardContent: {
    alignItems: "flex-start",
  },
  statCardPrimaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
    textAlign: "center",
  },
  statCardSecondaryValue: {
    fontSize: 14,
    color: "#666",
  },
  // New improved PHEV card styles
  primaryMetricContainer: {
    justifyContent: "center",
    marginBottom: 12,
    paddingBottom: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: "#f0f0f0",
    width: "100%",
  },
  primaryMetricLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  secondaryMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  secondaryMetricItem: {
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
  },
  secondaryMetricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
  },
  secondaryMetricLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
  },
  // Improved non-PHEV statistics styles
  improvedStatsContainer: {
    marginTop: 12,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  improvedStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  improvedStatItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  improvedStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
    textAlign: "center",
  },
  improvedStatLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
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
    flexDirection: "column",
  },
  fillingHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fillingIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  fillingType: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  fillingDetails: {
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
  actionButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  fab: {
    borderRadius: 16,
  },
  singleFab: {
    position: "absolute",
    bottom: 16,
    right: 16,
  },
  fuelFab: {
    backgroundColor: "#4CAF50",
    flex: 1,
    marginRight: 8,
  },
  chargeFab: {
    backgroundColor: "#2196F3",
    flex: 1,
    marginLeft: 8,
  },
  // Advanced Statistics Styles
  advancedStatsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  advancedStatsContent: {
    paddingTop: 8,
  },
  advancedStatsSection: {
    marginBottom: 24,
  },
  advancedStatsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  advancedStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  advancedStatItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  advancedStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 4,
    textAlign: "center",
  },
  advancedStatLabel: {
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    lineHeight: 14,
  },
});