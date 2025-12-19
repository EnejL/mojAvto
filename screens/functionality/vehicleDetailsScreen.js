// screens/VehicleConsumptionScreen.js
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getVehicleFillings, deleteFilling, getVehicleChargingSessions, deleteChargingSession, getVehicleHistory } from "../../utils/firestore";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import BrandLogo from "../../components/BrandLogo";
import ConsumptionGraph from "../../components/FuelConsumptionGraph";
import { exportToCSV, exportToPDF } from "../../utils/exportVehicleData";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { defaultUserProfile, getUserProfile } from "../../utils/userProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Helper function to format dates from Firestore timestamps
const formatDate = (date, locale = "en-US", options) => {
  if (!date) return "";

  let dateObj;

  // Handle Firestore timestamp objects
  if (date?.seconds) {
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
      return String(date);
    }
  }

  try {
    return new Intl.DateTimeFormat(
      locale,
      options || { year: "numeric", month: "short", day: "2-digit" }
    ).format(dateObj);
  } catch (e) {
    // Fallback: dd. mm. yyyy
    return `${dateObj.getDate().toString().padStart(2, "0")}. ${(
      dateObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}. ${dateObj.getFullYear()}`;
  }
};

// Helper function to format numbers consistently
const formatNumber = (value, decimals = 1, locale = "en-US") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(Number(value));
  } catch (e) {
    return Number(value).toFixed(decimals);
  }
};

// Helper function to format odometer readings with thousand separators
const formatOdometer = (value, locale = "en-US") => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      Math.round(Number(value))
    );
  } catch (e) {
    return String(Math.round(Number(value)));
  }
};

// Conversion helper functions (to be used within component)
const getCurrencySymbol = (code) => {
  switch (code) {
    case "USD":
      return "$";
    case "EUR":
    default:
      return "€";
  }
};

const convertDistance = (km, unitSystem) => {
  if (km === null || km === undefined) return { value: null, unit: "km" };
  if (unitSystem === "imperial") {
    return { value: km * 0.621371, unit: "mi" };
  }
  return { value: km, unit: "km" };
};

const convertFuelConsumption = (lPer100km, unitSystem) => {
  if (lPer100km === null || lPer100km === undefined) return { value: null, unit: "l / 100 km" };
  if (unitSystem === "imperial") {
    const mpg = 235.214583 / lPer100km;
    return { value: mpg, unit: "MPG" };
  }
  return { value: lPer100km, unit: "l / 100 km" };
};

const convertElectricConsumption = (kWhPer100km, unitSystem) => {
  if (kWhPer100km === null || kWhPer100km === undefined) return { value: null, unit: "kWh / 100 km" };
  if (unitSystem === "imperial") {
    const per100mi = kWhPer100km * 1.60934;
    return { value: per100mi, unit: "kWh / 100 mi" };
  }
  return { value: kWhPer100km, unit: "kWh / 100 km" };
};

const convertFuelVolume = (liters, unitSystem) => {
  if (liters === null || liters === undefined) return { value: null, unit: "L" };
  if (unitSystem === "imperial") {
    return { value: liters / 3.78541, unit: "gal" };
  }
  return { value: liters, unit: "L" };
};

const convertFuelPrice = (pricePerLiter, unitSystem) => {
  if (pricePerLiter === null || pricePerLiter === undefined) return null;
  if (unitSystem === "imperial") {
    return pricePerLiter * 3.78541; // price per gallon
  }
  return pricePerLiter;
};

const COLORS = {
  bg: "#0B141E",
  card: "#0F1A24",
  card2: "#111F2C",
  border: "#1B2A3A",
  text: "#E8F0FA",
  subtext: "#94A3B8",
  muted: "#64748B",
  primary: "#2563EB",
  fuel: "#22C55E",
  electric: "#3B82F6",
  money: "#A855F7",
  danger: "#EF4444",
};

export default function VehicleDetailsScreen({ route, navigation }) {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const locale = i18n.language?.startsWith("sl") ? "sl-SI" : "en-US";
  const { vehicle } = route.params;
  const [fillings, setFillings] = useState([]);
  const [chargingSessions, setChargingSessions] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [graphExpanded, setGraphExpanded] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const openSwipeableRef = useRef(null);
  const swipeableRefs = useRef(new Map());
  const [userSettings, setUserSettings] = useState(defaultUserProfile);

  // Get vehicle type or default to ICE for backwards compatibility
  const vehicleType = vehicle.vehicleType || "ICE";

  // Determine what data/actions to show based on vehicle type
  const showFuel = vehicleType === "ICE" || vehicleType === "HYBRID" || vehicleType === "PHEV";
  const showCharge = vehicleType === "BEV" || vehicleType === "PHEV";

  const loadUserSettings = async () => {
    try {
      const profile = await getUserProfile();
      setUserSettings(profile);
    } catch (error) {
      setUserSettings(defaultUserProfile);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        let promises = [];
        
        // Load fillings for fuel-compatible vehicles
        if (showFuel) {
          promises.push(getVehicleFillings(vehicle.id));
        } else {
          promises.push(Promise.resolve([]));
        }

        // Load charging sessions for electric-compatible vehicles
        if (showCharge) {
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
        // Error handled silently - user-facing errors shown via UI
      }
    };

    loadData();
    loadUserSettings();

    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadData();
      loadUserSettings();
    });
    return unsubscribe;
  }, [navigation, vehicle.id, vehicleType, showFuel, showCharge]);

  // Calculate average fuel consumption (l/100km)
  const averageFuelConsumption = useMemo(() => {
    if (fillings.length < 2 || !showFuel) return null;

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
  }, [fillings, showFuel]);

  // Calculate average electricity consumption (kWh/100km)
  const averageElectricityConsumption = useMemo(() => {
    if (chargingSessions.length < 2 || !showCharge) return null;

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
  }, [chargingSessions, showCharge]);

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
    if (fillings.length < 2 || !showFuel) return null;
    const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);
    return sortedFillings[sortedFillings.length - 1].odometer - sortedFillings[0].odometer;
  }, [fillings, showFuel]);

  // Calculate total distance driven for electricity
  const totalElectricityDistance = useMemo(() => {
    if (chargingSessions.length < 2 || !showCharge) return null;
    const sortedSessions = [...chargingSessions].sort((a, b) => a.odometer - b.odometer);
    return sortedSessions[sortedSessions.length - 1].odometer - sortedSessions[0].odometer;
  }, [chargingSessions, showCharge]);

  // Calculate average distance per filling
  const averageDistancePerFilling = useMemo(() => {
    if (fillings.length < 2 || !showFuel) return null;
    return totalFuelDistance / (fillings.length - 1);
  }, [totalFuelDistance, fillings.length, showFuel]);

  // Calculate average distance per charging session
  const averageDistancePerCharging = useMemo(() => {
    if (chargingSessions.length < 2 || !showCharge) return null;
    return totalElectricityDistance / (chargingSessions.length - 1);
  }, [totalElectricityDistance, chargingSessions.length, showCharge]);

  // Calculate days since last filling/charging
  const daysSinceLastFilling = useMemo(() => {
    if (fillings.length === 0 || !showFuel) return null;
    const lastFilling = [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    })[0];
    const lastDate = lastFilling.date?.seconds ? new Date(lastFilling.date.seconds * 1000) : new Date(lastFilling.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [fillings, showFuel]);

  const daysSinceLastCharging = useMemo(() => {
    if (chargingSessions.length === 0 || !showCharge) return null;
    const lastSession = [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA;
    })[0];
    const lastDate = lastSession.date?.seconds ? new Date(lastSession.date.seconds * 1000) : new Date(lastSession.date);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [chargingSessions, showCharge]);

  // Helper: distance travelled since previous event of the same type
  const getDistanceSinceLastEvent = (item) => {
    const sourceArray = item.type === 'charging' ? chargingSessions : fillings;
    if (!sourceArray || sourceArray.length < 2) return null;

    const previousEntries = sourceArray.filter(
      (entry) =>
        entry.id !== item.id &&
        typeof entry.odometer === 'number' &&
        entry.odometer < item.odometer
    );

    if (!previousEntries.length) return null;

    const prev = previousEntries.reduce((max, entry) =>
      !max || entry.odometer > max.odometer ? entry : max
    , null);

    if (!prev || typeof prev.odometer !== 'number') return null;

    const distance = item.odometer - prev.odometer;
    return distance > 0 ? distance : null;
  };

  // Sort fillings by date (newest first) for display
  const sortedFillings = useMemo(() => {
    if (!showFuel) return [];
    return [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA; // Newest first
    });
  }, [fillings, showFuel]);

  // Sort charging sessions by date (newest first) for display
  const sortedChargingSessions = useMemo(() => {
    if (!showCharge) return [];
    return [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateB - dateA; // Newest first
    });
  }, [chargingSessions, showCharge]);

  // Calculate longest distance on single tank/charge
  const longestDistanceSingleTank = useMemo(() => {
    if (fillings.length < 2 || !showFuel) return null;
    const sortedFillings = [...fillings].sort((a, b) => a.odometer - b.odometer);
    let maxDistance = 0;
    for (let i = 1; i < sortedFillings.length; i++) {
      const distance = sortedFillings[i].odometer - sortedFillings[i - 1].odometer;
      if (distance > 0 && distance > maxDistance) maxDistance = distance;
    }
    return maxDistance;
  }, [fillings, showFuel]);

  const longestDistanceSingleCharge = useMemo(() => {
    if (chargingSessions.length < 2 || !showCharge) return null;
    const sortedSessions = [...chargingSessions].sort((a, b) => a.odometer - b.odometer);
    let maxDistance = 0;
    for (let i = 1; i < sortedSessions.length; i++) {
      const distance = sortedSessions[i].odometer - sortedSessions[i - 1].odometer;
      if (distance > 0 && distance > maxDistance) maxDistance = distance;
    }
    return maxDistance;
  }, [chargingSessions, showCharge]);

  // Calculate average number of days between fillings/charging
  const averageDaysBetweenFillings = useMemo(() => {
    if (fillings.length < 2 || !showFuel) return null;
    const sortedFillings = [...fillings].sort((a, b) => {
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
  }, [fillings, showFuel]);

  const averageDaysBetweenCharging = useMemo(() => {
    if (chargingSessions.length < 2 || !showCharge) return null;
    const sortedSessions = [...chargingSessions].sort((a, b) => {
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
  }, [chargingSessions, showCharge]);

  // Calculate average cost per day
  const averageCostPerDayFuel = useMemo(() => {
    if (fillings.length === 0 || !showFuel) return null;
    const sortedFillings = [...fillings].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateA - dateB;
    });
    const firstDate = sortedFillings[0].date?.seconds ? new Date(sortedFillings[0].date.seconds * 1000) : new Date(sortedFillings[0].date);
    const today = new Date();
    const totalDays = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? totalFuelCost / totalDays : null;
  }, [totalFuelCost, fillings, showFuel]);

  const averageCostPerDayCharging = useMemo(() => {
    if (chargingSessions.length === 0 || !showCharge) return null;
    const sortedSessions = [...chargingSessions].sort((a, b) => {
      const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
      const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
      return dateA - dateB;
    });
    const firstDate = sortedSessions[0].date?.seconds ? new Date(sortedSessions[0].date.seconds * 1000) : new Date(sortedSessions[0].date);
    const today = new Date();
    const totalDays = Math.floor((today - firstDate) / (1000 * 60 * 60 * 24));
    return totalDays > 0 ? totalChargingCost / totalDays : null;
  }, [totalChargingCost, chargingSessions, showCharge]);

  // Calculate average cost per 100km for fuel
  const averageFuelCostPer100km = useMemo(() => {
    if (fillings.length < 2 || !showFuel) return null;

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
  }, [fillings, showFuel]);

  // Calculate average cost per 100km for electricity
  const averageElectricityCostPer100km = useMemo(() => {
    if (chargingSessions.length < 2 || !showCharge) return null;

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
  }, [chargingSessions, showCharge]);

  // Export handler
  const handleExport = () => {
    Alert.alert(
      t("export.title"),
      t("export.selectFormat"),
      [
        {
          text: t("export.exportToCSV"),
          onPress: async () => {
            setIsExporting(true);
            try {
              const stats = {
                avgFuelConsumption: averageFuelConsumption,
                avgElectricityConsumption: averageElectricityConsumption,
                avgPricePerLiter: averagePricePerLiter,
                avgPricePerKWh: averagePricePerKWh,
                totalFuelCost: totalFuelCost,
                totalChargingCost: totalChargingCost,
                // Additional statistics
                averageDistancePerFilling: averageDistancePerFilling,
                longestDistanceSingleTank: longestDistanceSingleTank,
                daysSinceLastFilling: daysSinceLastFilling,
                averageDaysBetweenFillings: averageDaysBetweenFillings,
                averageCostPerDayFuel: averageCostPerDayFuel,
                totalFuelDistance: totalFuelDistance,
                averageFuelCostPer100km: averageFuelCostPer100km,
                averageDistancePerCharging: averageDistancePerCharging,
                longestDistanceSingleCharge: longestDistanceSingleCharge,
                daysSinceLastCharging: daysSinceLastCharging,
                averageDaysBetweenCharging: averageDaysBetweenCharging,
                averageCostPerDayCharging: averageCostPerDayCharging,
                totalElectricityDistance: totalElectricityDistance,
                averageElectricityCostPer100km: averageElectricityCostPer100km,
              };
              
              const result = await exportToCSV(vehicle, fillings, chargingSessions, stats, t);
              
              if (result.success) {
                Alert.alert(t("common.ok"), t("export.exportSuccess"));
              } else {
                Alert.alert(t("common.error"), result.error || t("export.exportError"));
              }
            } catch (error) {
              Alert.alert(t("common.error"), t("export.exportError"));
            } finally {
              setIsExporting(false);
            }
          },
        },
        {
          text: t("export.exportToPDF"),
          onPress: async () => {
            setIsExporting(true);
            try {
              const stats = {
                avgFuelConsumption: averageFuelConsumption,
                avgElectricityConsumption: averageElectricityConsumption,
                avgPricePerLiter: averagePricePerLiter,
                avgPricePerKWh: averagePricePerKWh,
                totalFuelCost: totalFuelCost,
                totalChargingCost: totalChargingCost,
                // Additional statistics
                averageDistancePerFilling: averageDistancePerFilling,
                longestDistanceSingleTank: longestDistanceSingleTank,
                daysSinceLastFilling: daysSinceLastFilling,
                averageDaysBetweenFillings: averageDaysBetweenFillings,
                averageCostPerDayFuel: averageCostPerDayFuel,
                totalFuelDistance: totalFuelDistance,
                averageFuelCostPer100km: averageFuelCostPer100km,
                averageDistancePerCharging: averageDistancePerCharging,
                longestDistanceSingleCharge: longestDistanceSingleCharge,
                daysSinceLastCharging: daysSinceLastCharging,
                averageDaysBetweenCharging: averageDaysBetweenCharging,
                averageCostPerDayCharging: averageCostPerDayCharging,
                totalElectricityDistance: totalElectricityDistance,
                averageElectricityCostPer100km: averageElectricityCostPer100km,
              };
              
              const result = await exportToPDF(vehicle, fillings, chargingSessions, stats, t);
              
              if (result.success) {
                Alert.alert(t("common.ok"), t("export.exportSuccess"));
              } else {
                Alert.alert(t("common.error"), result.error || t("export.exportError"));
              }
            } catch (error) {
              Alert.alert(t("common.error"), t("export.exportError"));
            } finally {
              setIsExporting(false);
            }
          },
        },
        {
          text: t("export.cancel"),
          style: "cancel",
        },
      ]
    );
  };

  const currencySymbol = getCurrencySymbol(userSettings.currency);

  const totalSpentValue = useMemo(() => {
    const fuel = typeof totalFuelCost === "number" ? totalFuelCost : 0;
    const elec = typeof totalChargingCost === "number" ? totalChargingCost : 0;
    const hasAny = (showFuel && fillings.length > 0) || (showCharge && chargingSessions.length > 0);
    return { value: fuel + elec, hasAny };
  }, [totalFuelCost, totalChargingCost, showFuel, showCharge, fillings.length, chargingSessions.length]);

  const combinedDistanceKm = useMemo(() => {
    if (vehicleType !== "PHEV") return null;
    const events = [
      ...fillings.map((f) => ({ ...f, type: "filling" })),
      ...chargingSessions.map((c) => ({ ...c, type: "charging" })),
    ].filter((e) => typeof e?.odometer === "number");

    if (events.length < 2) return null;
    const sorted = [...events].sort((a, b) => a.odometer - b.odometer);
    const distance = sorted[sorted.length - 1].odometer - sorted[0].odometer;
    return distance > 0 ? distance : null;
  }, [vehicleType, fillings, chargingSessions]);

  const runningCost = useMemo(() => {
    let distanceKm = null;
    let cost = null;

    if (vehicleType === "PHEV") {
      distanceKm = combinedDistanceKm;
      cost = totalSpentValue.hasAny ? totalSpentValue.value : null;
    } else if (showFuel) {
      distanceKm = totalFuelDistance;
      cost = typeof totalFuelCost === "number" ? totalFuelCost : null;
    } else if (showCharge) {
      distanceKm = totalElectricityDistance;
      cost = typeof totalChargingCost === "number" ? totalChargingCost : null;
    }

    if (!distanceKm || distanceKm <= 0 || cost === null || cost === undefined) return null;

    if (userSettings.unitSystem === "imperial") {
      const miles = distanceKm * 0.621371;
      if (!miles) return null;
      return { value: cost / miles, unit: "mi" };
    }
    return { value: cost / distanceKm, unit: "km" };
  }, [
    vehicleType,
    showFuel,
    showCharge,
    combinedDistanceKm,
    totalSpentValue,
    totalFuelDistance,
    totalElectricityDistance,
    totalFuelCost,
    totalChargingCost,
    userSettings.unitSystem,
  ]);

  const avgEventCost = useMemo(() => {
    if (vehicleType === "PHEV") {
      const count = (showFuel ? fillings.length : 0) + (showCharge ? chargingSessions.length : 0);
      if (!count) return null;
      return totalSpentValue.value / count;
    }
    if (showCharge) return averageChargingCost;
    if (showFuel) return averageFuelCost;
    return null;
  }, [
    vehicleType,
    showFuel,
    showCharge,
    fillings.length,
    chargingSessions.length,
    totalSpentValue.value,
    averageChargingCost,
    averageFuelCost,
  ]);

  const graphConfig = useMemo(() => {
    if (vehicleType === "PHEV") {
      return { totalEntries: combinedHistory.length, data: combinedHistory, dataType: "combined" };
    }
    if (showFuel) {
      return { totalEntries: fillings.length, data: fillings, dataType: "fuel" };
    }
    if (showCharge) {
      return { totalEntries: chargingSessions.length, data: chargingSessions, dataType: "electricity" };
    }
    return { totalEntries: 0, data: [], dataType: "fuel" };
  }, [vehicleType, combinedHistory, fillings, chargingSessions, showFuel, showCharge]);

  const historyConfig = useMemo(() => {
    if (vehicleType === "PHEV") {
      return {
        title: t("vehicles.history"),
        data: combinedHistory,
        keyExtractor: (it) => `${it.type}-${it.id}`,
      };
    }
    if (showCharge && !showFuel) {
      return {
        title: t("charging.title"),
        data: sortedChargingSessions.map((s) => ({ ...s, type: "charging" })),
        keyExtractor: (it) => it.id,
      };
    }
    return {
      title: t("fillings.title"),
      data: sortedFillings.map((f) => ({ ...f, type: "filling" })),
      keyExtractor: (it) => it.id,
    };
  }, [
    vehicleType,
    showFuel,
    showCharge,
    combinedHistory,
    sortedChargingSessions,
    sortedFillings,
    t,
  ]);

  const MetricTile = ({ icon, accent, label, value }) => {
    return (
      <Surface style={styles.metricTile}>
        <View style={styles.metricHeaderRow}>
          <View style={[styles.metricIconWrap, { backgroundColor: "rgba(255,255,255,0.06)" }]}>
            <MaterialCommunityIcons name={icon} size={20} color={accent} />
          </View>
        </View>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </Surface>
    );
  };

  const CollapsibleCard = ({ icon, title, expanded, onToggle, children, disabled }) => {
    return (
      <Surface style={[styles.panelCard, disabled && styles.panelCardDisabled]}>
        <TouchableOpacity
          onPress={disabled ? undefined : onToggle}
          activeOpacity={disabled ? 1 : 0.8}
          style={styles.panelHeader}
        >
          <View style={styles.panelHeaderLeft}>
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={disabled ? COLORS.muted : COLORS.text}
              style={styles.panelHeaderIcon}
            />
            <Text style={[styles.panelHeaderTitle, disabled && { color: COLORS.muted }]}>
              {title}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={disabled ? COLORS.muted : COLORS.subtext}
          />
        </TouchableOpacity>
        {expanded && !disabled ? <View style={styles.panelBody}>{children}</View> : null}
      </Surface>
    );
  };

  const InfoPill = ({ icon, text, tone = "neutral" }) => {
    const accent =
      tone === "electric" ? COLORS.electric : tone === "fuel" ? COLORS.fuel : tone === "money" ? COLORS.money : COLORS.subtext;
    return (
      <View style={styles.infoPill}>
        <MaterialCommunityIcons name={icon} size={16} color={accent} />
        <Text style={styles.infoPillText}>{text}</Text>
      </View>
    );
  };

  const PrimaryActionButton = ({ icon, label, backgroundColor, onPress }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={[styles.primaryAction, { backgroundColor }]}
      >
        <MaterialCommunityIcons name={icon} size={22} color="#fff" />
        <Text style={styles.primaryActionText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }) => {
    const itemKey = `${item.type}-${item.id}`;
    if (!swipeableRefs.current.has(itemKey)) {
      swipeableRefs.current.set(itemKey, null);
    }

    const handleDeleteHistoryItem = (entry) => {
      const confirmMessage =
        entry.type === "filling"
          ? t("fillings.deleteConfirmMessage")
          : t("charging.deleteConfirmMessage");

      Alert.alert(t("common.delete"), confirmMessage, [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              if (entry.type === "filling") {
                await deleteFilling(vehicle.id, entry.id);
                setFillings((prev) => prev.filter((f) => f.id !== entry.id));
              } else {
                await deleteChargingSession(vehicle.id, entry.id);
                setChargingSessions((prev) => prev.filter((s) => s.id !== entry.id));
              }

              if (vehicleType === "PHEV") {
                const history = await getVehicleHistory(vehicle.id);
                setCombinedHistory(history);
              }
            } catch (error) {
              alert(t("common.error.delete"));
            }
          },
        },
      ]);
    };

    const renderRightActions = () => {
      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => {
            const swipeableRef = swipeableRefs.current.get(itemKey);
            if (swipeableRef) swipeableRef.close();
            handleDeleteHistoryItem(item);
          }}
        >
          <MaterialCommunityIcons name="trash-can" size={22} color="#fff" />
        </TouchableOpacity>
      );
    };

    const isCharging = item.type === "charging";
    const accent = isCharging ? COLORS.electric : COLORS.fuel;
    const iconName = isCharging ? "lightning-bolt" : "gas-station";
    const titleDate = formatDate(item.date, locale, { year: "numeric", month: "short", day: "numeric" });
    const costText =
      typeof item.cost === "number"
        ? `${currencySymbol}${formatNumber(item.cost, 2, locale)}`
        : "—";

    const odometer = convertDistance(item.odometer, userSettings.unitSystem);
    const sinceKm = getDistanceSinceLastEvent(item);
    const sinceDist = sinceKm !== null ? convertDistance(sinceKm, userSettings.unitSystem) : { value: null, unit: odometer.unit };

    const amountText = isCharging
      ? typeof item.energyAdded === "number"
        ? `${formatNumber(item.energyAdded, 2, locale)} kWh`
        : "—"
      : (() => {
          const fuel = convertFuelVolume(item.liters, userSettings.unitSystem);
          return fuel.value !== null ? `${formatNumber(fuel.value, 2, locale)} ${fuel.unit}` : "—";
        })();

    const locationText =
      isCharging && item.locationName ? String(item.locationName) : null;

    return (
      <GestureHandlerRootView style={styles.gestureContainer}>
        <Swipeable
          ref={(ref) => {
            swipeableRefs.current.set(itemKey, ref);
          }}
          renderRightActions={renderRightActions}
          overshootRight={false}
          friction={2}
          rightThreshold={40}
          onSwipeableOpen={() => {
            const swipeableRef = swipeableRefs.current.get(itemKey);
            if (openSwipeableRef.current && openSwipeableRef.current !== swipeableRef) {
              openSwipeableRef.current.close();
            }
            openSwipeableRef.current = swipeableRef;
          }}
          onSwipeableClose={() => {
            const swipeableRef = swipeableRefs.current.get(itemKey);
            if (openSwipeableRef.current === swipeableRef) {
              openSwipeableRef.current = null;
            }
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              if (openSwipeableRef.current) openSwipeableRef.current.close();
              if (isCharging) {
                navigation.navigate("EditCharging", {
                  chargingSession: item,
                  vehicleId: vehicle.id,
                  vehicle,
                });
              } else {
                navigation.navigate("EditFilling", {
                  filling: item,
                  vehicleId: vehicle.id,
                  vehicle,
                });
              }
            }}
          >
            <Surface style={styles.historyItemCard}>
              <View style={styles.historyTopRow}>
                <View style={styles.historyTopLeft}>
                  <View style={[styles.historyIconWrap, { backgroundColor: isCharging ? "rgba(59,130,246,0.16)" : "rgba(34,197,94,0.16)" }]}>
                    <MaterialCommunityIcons name={iconName} size={18} color={accent} />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>{titleDate}</Text>
                    <Text style={styles.historySubtitle}>
                      {isCharging ? t("charging.session") : t("fillings.filling")}
                      {locationText ? ` • ${locationText}` : ""}
                    </Text>
                  </View>
                </View>
                <Text style={styles.historyCost}>{costText}</Text>
              </View>

              <View style={styles.historyPillsRow}>
                <InfoPill
                  icon="counter"
                  tone="neutral"
                  text={
                    odometer.value !== null
                      ? `${formatOdometer(odometer.value, locale)} ${odometer.unit}`
                      : "—"
                  }
                />
                <InfoPill
                  icon="arrow-right"
                  tone={isCharging ? "electric" : "fuel"}
                  text={
                    sinceDist.value !== null
                      ? `${formatNumber(sinceDist.value, 1, locale)} ${sinceDist.unit}`
                      : "—"
                  }
                />
                <InfoPill
                  icon={isCharging ? "flash" : "fuel"}
                  tone={isCharging ? "electric" : "fuel"}
                  text={amountText}
                />
              </View>
            </Surface>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };

  const metricTiles = useMemo(() => {
    const tiles = [];

    if (vehicleType === "PHEV") {
      const fuelCons = convertFuelConsumption(averageFuelConsumption, userSettings.unitSystem);
      const elecCons = convertElectricConsumption(averageElectricityConsumption, userSettings.unitSystem);

      tiles.push({
        key: "fuel-cons",
        icon: "gas-station",
        accent: COLORS.fuel,
        label: t("fillings.consumption"),
        value: averageFuelConsumption !== null ? `${formatNumber(fuelCons.value, 1, locale)} ${fuelCons.unit}` : "—",
      });
      tiles.push({
        key: "elec-cons",
        icon: "lightning-bolt",
        accent: COLORS.electric,
        label: t("charging.avgConsumption"),
        value: averageElectricityConsumption !== null ? `${formatNumber(elecCons.value, 1, locale)} ${elecCons.unit}` : "—",
      });
    } else if (showCharge) {
      const elecCons = convertElectricConsumption(averageElectricityConsumption, userSettings.unitSystem);
      tiles.push({
        key: "cons",
        icon: "lightning-bolt",
        accent: COLORS.electric,
        label: t("vehicles.avgConsumption"),
        value: averageElectricityConsumption !== null ? `${formatNumber(elecCons.value, 1, locale)} ${elecCons.unit}` : "—",
      });
    } else {
      const fuelCons = convertFuelConsumption(averageFuelConsumption, userSettings.unitSystem);
      tiles.push({
        key: "cons",
        icon: "gas-station",
        accent: COLORS.fuel,
        label: t("vehicles.avgConsumption"),
        value: averageFuelConsumption !== null ? `${formatNumber(fuelCons.value, 1, locale)} ${fuelCons.unit}` : "—",
      });
    }

    tiles.push({
      key: "running",
      icon: "cash",
      accent: COLORS.money,
      label: t("vehicles.avgCostPer100km"),
      value: runningCost
        ? `${currencySymbol}${formatNumber(runningCost.value, 2, locale)} / ${runningCost.unit}`
        : "—",
    });

    if (vehicleType !== "PHEV") {
      tiles.push({
        key: "avgCost",
        icon: "receipt",
        accent: showCharge && !showFuel ? COLORS.electric : COLORS.fuel,
        label: showCharge && !showFuel ? t("charging.avgCost") : t("fillings.avgCost"),
        value: avgEventCost !== null ? `${currencySymbol}${formatNumber(avgEventCost, 2, locale)}` : "—",
      });
    }

    tiles.push({
      key: "totalSpent",
      icon: "wallet",
      accent: COLORS.money,
      label: t("common.totalCost"),
      value: totalSpentValue.hasAny ? `${currencySymbol}${formatNumber(totalSpentValue.value, 2, locale)}` : "—",
    });

    return tiles.slice(0, 4);
  }, [
    vehicleType,
    showFuel,
    showCharge,
    averageFuelConsumption,
    averageElectricityConsumption,
    userSettings.unitSystem,
    t,
    locale,
    runningCost,
    currencySymbol,
    avgEventCost,
    totalSpentValue,
  ]);

  const canShowAdvancedStats = (showFuel && fillings.length >= 3) || (showCharge && chargingSessions.length >= 3);
  const canShowGraph = graphConfig.totalEntries >= 5 && graphConfig.data?.length >= 5;

  const hasAnyEvents = (showFuel && fillings.length > 0) || (showCharge && chargingSessions.length > 0) || (vehicleType === "PHEV" && combinedHistory.length > 0);
  const totalHistoryCount = historyConfig.data.length;
  const initialHistoryCount = 5;
  const visibleHistory = showAllHistory ? historyConfig.data : historyConfig.data.slice(0, Math.min(initialHistoryCount, totalHistoryCount));
  const hasMoreHistory = totalHistoryCount > initialHistoryCount;

  const bottomBarHeight = showFuel && showCharge ? 88 : 76;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 10) }]}>
        <TouchableOpacity style={styles.topBarIconButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t("vehicles.details")}</Text>
        <TouchableOpacity
          style={styles.topBarIconButton}
          onPress={() => navigation.navigate("EditVehicle", { vehicle })}
        >
          <MaterialCommunityIcons name="cog" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        onScrollBeginDrag={() => {
          if (openSwipeableRef.current) openSwipeableRef.current.close();
        }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomBarHeight + Math.max(insets.bottom, 10) + 20 },
        ]}
      >
        {/* Hero card */}
        <Surface style={styles.heroCard}>
          <View style={styles.heroMainRow}>
            <View style={styles.heroVehicleLeft}>
              <BrandLogo brand={vehicle.make} style={styles.brandLogo} />
              <View style={styles.heroVehicleText}>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleSubtitle}>
                  {vehicle.make} {vehicle.model}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.exportButton}
              onPress={handleExport}
              disabled={isExporting}
              activeOpacity={0.85}
            >
              {isExporting ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <MaterialCommunityIcons name="download" size={22} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>
        </Surface>

        {!hasAnyEvents ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              {vehicleType === "BEV" 
                ? t("charging.notEnoughData")
                : vehicleType === "PHEV"
                ? t("common.notEnoughData")
                : t("fillings.notEnoughData")}
            </Text>
          </View>
        ) : (
          <>
            {/* Stats */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>{t("vehicles.statistics").toUpperCase()}</Text>
            </View>
            <View style={styles.metricGrid}>
              {metricTiles.map((tile) => (
                <MetricTile key={tile.key} icon={tile.icon} accent={tile.accent} label={tile.label} value={tile.value} />
              ))}
            </View>

            {/* Panels */}
            <CollapsibleCard
              icon="chart-bar"
              title={t("vehicles.additionalStatistics")}
              expanded={advancedExpanded}
              onToggle={() => setAdvancedExpanded((p) => !p)}
              disabled={!canShowAdvancedStats}
            >
          <View style={styles.panelSection}>
            {showFuel && fillings.length >= 2 ? (
              <>
                <Text style={styles.panelSectionTitle}>⛽ {t("fillings.nav")}</Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {averageDistancePerFilling !== null
                        ? (() => {
                            const dist = convertDistance(averageDistancePerFilling, userSettings.unitSystem);
                            return dist.value !== null ? `${formatNumber(dist.value, 1, locale)} ${dist.unit}` : "—";
                          })()
                        : "—"}
                    </Text>
                    <Text style={styles.statLabel}>{t("vehicles.avgDistancePerFilling")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {longestDistanceSingleTank !== null
                        ? (() => {
                            const dist = convertDistance(longestDistanceSingleTank, userSettings.unitSystem);
                            return dist.value !== null ? `${formatNumber(dist.value, 1, locale)} ${dist.unit}` : "—";
                          })()
                        : "—"}
                    </Text>
                    <Text style={styles.statLabel}>{t("vehicles.longestDistanceSingleTank")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{daysSinceLastFilling !== null ? String(daysSinceLastFilling) : "—"}</Text>
                    <Text style={styles.statLabel}>{t("vehicles.daysSinceLastFilling")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {averageDaysBetweenFillings !== null ? formatNumber(averageDaysBetweenFillings, 1, locale) : "—"}
                    </Text>
                    <Text style={styles.statLabel}>{t("vehicles.avgDaysBetweenFillings")}</Text>
                  </View>
                </View>
              </>
            ) : null}

            {showCharge && chargingSessions.length >= 2 ? (
              <>
                <Text style={[styles.panelSectionTitle, { marginTop: showFuel ? 16 : 0 }]}>⚡ {t("charging.title")}</Text>
                <View style={styles.statGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {averageDistancePerCharging !== null
                        ? (() => {
                            const dist = convertDistance(averageDistancePerCharging, userSettings.unitSystem);
                            return dist.value !== null ? `${formatNumber(dist.value, 1, locale)} ${dist.unit}` : "—";
                          })()
                        : "—"}
                    </Text>
                    <Text style={styles.statLabel}>{t("vehicles.avgDistancePerCharging")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {longestDistanceSingleCharge !== null
                        ? (() => {
                            const dist = convertDistance(longestDistanceSingleCharge, userSettings.unitSystem);
                            return dist.value !== null ? `${formatNumber(dist.value, 1, locale)} ${dist.unit}` : "—";
                          })()
                        : "—"}
                    </Text>
                    <Text style={styles.statLabel}>{t("vehicles.longestDistanceSingleCharge")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{daysSinceLastCharging !== null ? String(daysSinceLastCharging) : "—"}</Text>
                    <Text style={styles.statLabel}>{t("vehicles.daysSinceLastCharging")}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {averageDaysBetweenCharging !== null ? formatNumber(averageDaysBetweenCharging, 1, locale) : "—"}
                    </Text>
                    <Text style={styles.statLabel}>{t("vehicles.avgDaysBetweenCharging")}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
            </CollapsibleCard>

            <CollapsibleCard
              icon="chart-line"
              title={t("vehicles.consumptionOverTime")}
              expanded={graphExpanded}
              onToggle={() => setGraphExpanded((p) => !p)}
              disabled={!canShowGraph}
            >
              <ConsumptionGraph
                data={graphConfig.data}
                dataType={graphConfig.dataType}
                unitSystem={userSettings.unitSystem}
                locale={locale}
              />
            </CollapsibleCard>
          </>
        )}

        {/* History */}
        {hasAnyEvents && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>{historyConfig.title}</Text>
              {totalHistoryCount > 0 && (
                <Text style={styles.historyCount}>({totalHistoryCount})</Text>
              )}
            </View>

            <Surface style={styles.historyCard}>
              {historyConfig.data.length === 0 ? (
                <Text style={styles.emptyText}>{t("vehicles.noHistory")}</Text>
              ) : (
                <>
                  <FlatList
                    data={visibleHistory}
                    renderItem={renderHistoryItem}
                    keyExtractor={historyConfig.keyExtractor}
                    scrollEnabled={false}
                    contentContainerStyle={styles.flatListContent}
                  />
                  {hasMoreHistory && !showAllHistory && (
                    <TouchableOpacity
                      onPress={() => setShowAllHistory(true)}
                      activeOpacity={0.8}
                      style={styles.showMoreButton}
                    >
                      <Text style={styles.showMoreButtonText}>{t("common.showMore")}</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </Surface>
          </>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.bottomBarWrapper}>
        <View style={styles.bottomBarInner}>
          {showFuel && showCharge ? (
            <View style={styles.bottomBarRow}>
              <PrimaryActionButton
                icon="gas-station"
                label={t("fillings.add")}
                backgroundColor={COLORS.fuel}
                onPress={() => navigation.navigate("AddFilling", { vehicle })}
              />
              <PrimaryActionButton
                icon="lightning-bolt"
                label={t("charging.add")}
                backgroundColor={COLORS.electric}
                onPress={() => navigation.navigate("AddCharging", { vehicle })}
              />
            </View>
          ) : showCharge ? (
            <PrimaryActionButton
              icon="lightning-bolt"
              label={t("charging.add")}
              backgroundColor={COLORS.electric}
              onPress={() => navigation.navigate("AddCharging", { vehicle })}
            />
          ) : (
            <PrimaryActionButton
              icon="gas-station"
              label={t("fillings.add")}
              backgroundColor={COLORS.fuel}
              onPress={() => navigation.navigate("AddFilling", { vehicle })}
            />
          )}
        </View>
        {/* Safe-area spacer: keeps buttons above the home indicator without inflating the bar's visual bottom padding */}
        {/* Temporarily disabled for testing */}
        {/* <View style={{ height: insets.bottom, backgroundColor: COLORS.bg }} /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    backgroundColor: COLORS.bg,
  },
  topBarIconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  topBarTitle: {
    flex: 1,
    textAlign: "center",
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  heroCard: {
    marginHorizontal: 16,
    marginTop: 6,
    padding: 16,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  heroMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  heroVehicleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    gap: 12,
  },
  heroVehicleText: {
    flex: 1,
    minWidth: 0,
  },
  brandLogo: {
    width: 54,
    height: 44,
    borderRadius: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    backgroundColor: "gray",
    boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    padding: 4,
  },
  vehicleName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },
  vehicleSubtitle: {
    color: COLORS.subtext,
    fontSize: 13,
    marginTop: 2,
  },
  exportButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "rgba(37,99,235,0.10)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(37,99,235,0.35)",
  },
  emptyStateContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    alignItems: "center",
  },
  emptyStateText: {
    color: COLORS.subtext,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionLabel: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2,
  },

  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  metricTile: {
    width: "48%",
    backgroundColor: COLORS.card2,
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  metricHeaderRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  metricIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  metricLabel: {
    color: COLORS.subtext,
    fontSize: 13,
    marginBottom: 6,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "800",
  },

  panelCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  panelCardDisabled: {
    opacity: 0.6,
  },
  panelHeader: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panelHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  panelHeaderIcon: {
    opacity: 0.95,
  },
  panelHeaderTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  panelBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  panelSection: {
    paddingTop: 4,
  },
  panelSectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 10,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    width: "48%",
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  statLabel: {
    color: COLORS.subtext,
    fontSize: 12,
    lineHeight: 16,
  },

  historyCount: {
    color: COLORS.subtext,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  showMoreButton: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  showMoreButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  historyCard: {
    marginHorizontal: 16,
    marginTop: 0,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    padding: 12,
  },
  flatListContent: {
    paddingHorizontal: 0,
  },
  emptyText: {
    color: COLORS.subtext,
    textAlign: "center",
    paddingVertical: 14,
  },

  gestureContainer: {
    flex: 1,
  },
  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 72,
    marginLeft: 10,
    borderRadius: 16,
    height: "90%",
  },

  historyItemCard: {
    backgroundColor: COLORS.card2,
    borderRadius: 16,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  historyTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  historyTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  historyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  historyTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  historySubtitle: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 2,
  },
  historyCost: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
  },
  historyPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
  },
  infoPillText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "700",
  },

  bottomBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: "rgba(11,20,30,0.96)",
  },
  bottomBarInner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bottomBarRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});