// petrolStationsScreen.js - Using react-native-tab-view
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Card, Title, Paragraph, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { TabView, TabBar } from "react-native-tab-view";
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import petrolStationsData from "../../utils/petrolStationsData";

// API URL for petrol stations
const PETROL_STATIONS_API = "https://goriva.si/api/v1/search/?format=json";

// Get screen width
const initialLayout = { width: Dimensions.get("window").width };

// Add this utility function at the top of the file, outside any component
const isStationOpen = (station) => {
  // If the station is marked as 24h, it's always open
  if (station.open_24h || station.open_24_7 || station.is_open_24h) {
    return true;
  }

  // Get current day and time
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Convert to 24-hour format time as decimal for comparison (e.g., 14:30 = 14.5)
  const currentTime = currentHour + currentMinute / 60;

  // Check if the station has opening hours text
  const openingHoursText = station.opening_hours || station.open_hours;

  if (!openingHoursText) {
    return null; // Unknown status
  }

  // Simple check for common patterns in the text
  const lowerText = openingHoursText.toLowerCase();

  // Check if it mentions being open 24 hours
  if (
    lowerText.includes("24 ur") ||
    lowerText.includes("00:00-24:00") ||
    lowerText.includes("00.00-24.00") ||
    lowerText.includes("24/7")
  ) {
    return true;
  }

  // Check if it mentions being closed today
  const dayNames = ["ned", "pon", "tor", "sre", "čet", "pet", "sob"];
  const todayName = dayNames[currentDay];

  if (lowerText.includes(todayName + ".") && lowerText.includes("zaprto")) {
    return false;
  }

  // Try to extract opening hours for today
  // This is a simplified approach - for a more robust solution,
  // you would need more complex parsing logic
  try {
    // Look for patterns like "PON - PET: 08:00-20:00"
    const dayRanges = [
      { pattern: "pon.*?-.*?pet", days: [1, 2, 3, 4, 5] }, // Monday-Friday
      { pattern: "pon.*?-.*?sob", days: [1, 2, 3, 4, 5, 6] }, // Monday-Saturday
      { pattern: "pon.*?-.*?ned", days: [1, 2, 3, 4, 5, 6, 0] }, // Monday-Sunday
      { pattern: "sob.*?-.*?ned", days: [6, 0] }, // Saturday-Sunday
      // Individual days
      { pattern: "pon", days: [1] },
      { pattern: "tor", days: [2] },
      { pattern: "sre", days: [3] },
      { pattern: "čet", days: [4] },
      { pattern: "pet", days: [5] },
      { pattern: "sob", days: [6] },
      { pattern: "ned", days: [0] },
    ];

    // Find a day range that includes today
    for (const range of dayRanges) {
      if (range.days.includes(currentDay)) {
        const regex = new RegExp(
          `${range.pattern}[^\\d]+(\\d{1,2})[:\\.](\\d{2})[^\\d]+(\\d{1,2})[:\\.](\\d{2})`,
          "i"
        );
        const match = openingHoursText.match(regex);

        if (match) {
          const openHour = parseInt(match[1]);
          const openMinute = parseInt(match[2]);
          const closeHour = parseInt(match[3]);
          const closeMinute = parseInt(match[4]);

          const openTime = openHour + openMinute / 60;
          const closeTime = closeHour + closeMinute / 60;

          return currentTime >= openTime && currentTime < closeTime;
        }
      }
    }

    // If we couldn't determine the status from the text
    return null;
  } catch (e) {
    console.log("Error parsing opening hours:", e);
    return null;
  }
};

// Create a reusable OpenStatusBadge component
const OpenStatusBadge = ({ isOpen }) => {
  if (isOpen === null) return null; // Don't show anything if status is unknown

  return (
    <View
      style={[
        styles.statusBadge,
        isOpen ? styles.openBadge : styles.closedBadge,
      ]}
    >
      <Text style={styles.statusText}>{isOpen ? "Odprto" : "Zaprto"}</Text>
    </View>
  );
};

const PetrolStationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("map"); // 'map' or 'list'

  // Fetch data once at the parent level
  useEffect(() => {
    fetchPetrolStations();
  }, []);

  const fetchPetrolStations = async () => {
    try {
      setLoading(true);

      // For testing, use the local data instead of making an API call
      setStations(petrolStationsData.results);
      setLoading(false);

      // Uncomment this when you want to use the real API
      /*
      const response = await axios.get(PETROL_STATIONS_API);
      setStations(response.data.results);
      setLoading(false);
      */
    } catch (err) {
      console.error("Error fetching petrol stations:", err);
      setError(t("petrolStations.fetchError"));
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "map" && styles.activeTab]}
          onPress={() => setActiveTab("map")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "map" && styles.activeTabText,
            ]}
          >
            {t("petrolStations.map")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "list" && styles.activeTab]}
          onPress={() => setActiveTab("list")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "list" && styles.activeTabText,
            ]}
          >
            {t("petrolStations.list")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "map" ? (
          <StationMapScreen
            stations={stations}
            loading={loading}
            error={error}
            navigation={navigation}
          />
        ) : (
          <StationListScreen
            stations={stations}
            loading={loading}
            error={error}
            navigation={navigation}
          />
        )}
      </View>
    </View>
  );
};

// List view component
const StationListScreen = ({ stations, loading, error, navigation }) => {
  const { t } = useTranslation();

  const handleStationPress = (station) => {
    navigation.navigate("PetrolStationDetails", { station });
  };

  const renderStationItem = ({ item }) => {
    const stationIsOpen = isStationOpen(item);

    return (
      <Card style={styles.stationCard} onPress={() => handleStationPress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.stationTitle}>{item.name}</Title>
            <OpenStatusBadge isOpen={stationIsOpen} />
          </View>
          <Paragraph>
            {item.address}, {item.zip_code}
          </Paragraph>
          <Divider style={styles.divider} />
          <View style={styles.pricesContainer}>
            {item.prices["95"] && (
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>95</Text>
                <Text style={styles.priceValue}>{item.prices["95"]} €</Text>
              </View>
            )}
            {item.prices["dizel"] && (
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Dizel</Text>
                <Text style={styles.priceValue}>{item.prices["dizel"]} €</Text>
              </View>
            )}
            {item.prices["98"] && (
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>98</Text>
                <Text style={styles.priceValue}>{item.prices["98"]} €</Text>
              </View>
            )}
            {item.prices["100"] && (
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>100</Text>
                <Text style={styles.priceValue}>{item.prices["100"]} €</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={stations}
      renderItem={renderStationItem}
      keyExtractor={(item) => item.pk.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

// Map view component
const StationMapScreen = ({ stations, loading, error, navigation }) => {
  const { t } = useTranslation();
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 46.056, // Ljubljana center (Slovenia)
    longitude: 14.505,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      // Use high accuracy and timeout options
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      console.log("User location:", location.coords);

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      // Only update region if we got a valid location
      if (
        location.coords.latitude !== 0 &&
        location.coords.longitude !== 0 &&
        !(
          location.coords.latitude.toFixed(2) === "37.78" &&
          location.coords.longitude.toFixed(2) === "-122.43"
        )
      ) {
        setRegion({
          ...userCoords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    } else {
      // Try to get location again if we don't have it
      getUserLocation();
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...region,
          latitudeDelta: region.latitudeDelta / 2,
          longitudeDelta: region.longitudeDelta / 2,
        },
        200
      );
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...region,
          latitudeDelta: region.latitudeDelta * 2,
          longitudeDelta: region.longitudeDelta * 2,
        },
        200
      );
    }
  };

  const navigateToStationDetails = (station) => {
    navigation.navigate("PetrolStationDetails", { station });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
      >
        {stations.map((station) => {
          const stationIsOpen = isStationOpen(station);

          return (
            <Marker
              key={station.pk}
              coordinate={{
                latitude: station.lat,
                longitude: station.lng,
              }}
              title={station.name}
              description={`95: ${station.prices["95"] || "N/A"} € | Dizel: ${
                station.prices["dizel"] || "N/A"
              } €`}
            >
              <Callout
                tooltip
                onPress={() => navigateToStationDetails(station)}
              >
                <View style={styles.calloutContainer}>
                  <View style={styles.calloutHeader}>
                    <Text style={styles.calloutTitle}>{station.name}</Text>
                    <OpenStatusBadge isOpen={stationIsOpen} />
                  </View>
                  <Text style={styles.calloutAddress}>
                    {station.address}, {station.zip_code}
                  </Text>
                  <View style={styles.calloutPrices}>
                    {station.prices["95"] && (
                      <Text style={styles.calloutPrice}>
                        95: {station.prices["95"]} €
                      </Text>
                    )}
                    {station.prices["dizel"] && (
                      <Text style={styles.calloutPrice}>
                        Dizel: {station.prices["dizel"]} €
                      </Text>
                    )}
                  </View>
                  <View style={styles.calloutButton}>
                    <MaterialIcons
                      name="info-outline"
                      size={20}
                      color="#2e7d32"
                    />
                    <Text style={styles.calloutButtonText}>
                      {t("petrolStations.viewDetails")}
                    </Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Custom location button */}
      <TouchableOpacity style={styles.myLocationButton} onPress={centerOnUser}>
        <MaterialIcons name="my-location" size={24} color="#000" />
      </TouchableOpacity>

      {/* Zoom controls */}
      <View style={styles.zoomControlsContainer}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <MaterialIcons name="add" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <MaterialIcons name="remove" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  stationCard: {
    marginBottom: 16,
    elevation: 2,
  },
  divider: {
    marginVertical: 8,
  },
  pricesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  priceItem: {
    width: "25%",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  myLocationButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  zoomControlsContainer: {
    position: "absolute",
    right: 16,
    top: 16,
    backgroundColor: "transparent",
  },
  zoomButton: {
    backgroundColor: "white",
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutHeader: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  calloutPrices: {
    marginBottom: 8,
  },
  calloutPrice: {
    fontSize: 12,
  },
  calloutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 4,
  },
  calloutButtonText: {
    color: "#2e7d32",
    marginLeft: 4,
    fontWeight: "500",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  activeTabText: {
    color: "#000",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  openBadge: {
    backgroundColor: "#2e7d32", // Green
  },
  closedBadge: {
    backgroundColor: "#d32f2f", // Red
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  stationTitle: {
    flex: 1,
    marginRight: 8,
  },
});

export default PetrolStationsScreen;
