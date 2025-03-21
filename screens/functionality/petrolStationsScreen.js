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
import ClusteredMapView from "react-native-map-clustering";
import { Marker, PROVIDER_GOOGLE, Callout } from "react-native-maps";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Get screen width
const initialLayout = { width: Dimensions.get("window").width };

// Add this utility function at the top of the file, outside any component
const isStationOpen = (station) => {
  // If no opening hours data is available
  if (!station.open_hours) return null;

  // Handle 24/7 stations
  if (
    station.open_24h ||
    station.open_24_7 ||
    station.open_hours.toLowerCase().includes("24/7") ||
    station.open_hours.toLowerCase().includes("00:00-24:00") ||
    station.open_hours.toLowerCase().includes("0-24") ||
    station.open_hours.toLowerCase().includes("non stop")
  ) {
    return true;
  }

  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Convert current time to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  // Handle multi-line format with days of the week
  const openingHoursText = station.open_hours.toLowerCase();

  // Check for specific day patterns
  const dayPatterns = {
    0: ["nedelj", "ned"], // Sunday
    1: ["ponedelj", "pon"], // Monday
    2: ["torek", "tor"], // Tuesday
    3: ["sreda", "sre"], // Wednesday
    4: ["četrtek", "čet"], // Thursday
    5: ["petek", "pet"], // Friday
    6: ["sobota", "sob"], // Saturday
  };

  // Check for "delavnik" (workday) which is Monday-Friday
  const isWorkday = currentDay >= 1 && currentDay <= 5;

  // Split by lines to handle multi-line formats
  const lines = openingHoursText.split(/\n|\\n/);

  for (const line of lines) {
    // Check if this line applies to the current day
    let isRelevantLine = false;

    // Check for workday
    if (line.includes("delavnik") && isWorkday) {
      isRelevantLine = true;
    }
    // Check for weekend
    else if (
      (line.includes("vikend") || line.includes("konec tedna")) &&
      (currentDay === 0 || currentDay === 6)
    ) {
      isRelevantLine = true;
    }
    // Check for specific day
    else {
      const dayPatternKeys = Object.keys(dayPatterns);
      for (const dayKey of dayPatternKeys) {
        const patterns = dayPatterns[dayKey];
        if (
          patterns.some((pattern) => line.includes(pattern)) &&
          parseInt(dayKey) === currentDay
        ) {
          isRelevantLine = true;
          break;
        }
      }
    }

    // If this line is relevant for today, check the hours
    if (isRelevantLine) {
      // Extract time ranges using regex
      const timeRanges = line.match(/(\d{1,2}):?(\d{2})?-(\d{1,2}):?(\d{2})?/g);

      if (timeRanges && timeRanges.length > 0) {
        for (const timeRange of timeRanges) {
          const [startTime, endTime] = timeRange.split("-");

          // Parse start time
          let startHour = 0;
          let startMinute = 0;
          if (startTime.includes(":")) {
            [startHour, startMinute] = startTime.split(":").map(Number);
          } else {
            startHour = parseInt(startTime);
          }

          // Parse end time
          let endHour = 0;
          let endMinute = 0;
          if (endTime.includes(":")) {
            [endHour, endMinute] = endTime.split(":").map(Number);
          } else {
            endHour = parseInt(endTime);
          }

          // Convert to minutes for comparison
          const startTimeInMinutes = startHour * 60 + startMinute;
          const endTimeInMinutes = endHour * 60 + endMinute;

          // Check if current time is within range
          if (
            currentTimeInMinutes >= startTimeInMinutes &&
            currentTimeInMinutes <= endTimeInMinutes
          ) {
            return true;
          }
        }
      }
    }
  }

  // If no matching time range was found, assume closed
  return false;
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

// Add this function after the imports and before the component
const fetchPetrolStations = async () => {
  try {
    const db = getFirestore();
    const petrolStationsRef = doc(db, "data", "petrolStations");
    const petrolStationsDoc = await getDoc(petrolStationsRef);

    if (petrolStationsDoc.exists()) {
      const petrolStationsData = petrolStationsDoc.data();
      return petrolStationsData.data; // Return the data field which contains the API response
    } else {
      console.log("No petrol stations data found in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error fetching petrol stations from Firestore:", error);
    throw error;
  }
};

const PetrolStationsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("map"); // 'map' or 'list'
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const loadPetrolStations = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user location first
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError(t("petrolStations.locationPermissionDenied"));
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // Fetch petrol stations from Firestore
        const data = await fetchPetrolStations();

        if (data && data.results) {
          setStations(data.results);
        } else {
          setError(t("petrolStations.fetchError"));
        }
      } catch (error) {
        console.error("Error loading petrol stations:", error);
        setError(t("petrolStations.fetchError"));
      } finally {
        setLoading(false);
      }
    };

    loadPetrolStations();
  }, [t]);

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
            {/* <OpenStatusBadge isOpen={stationIsOpen} /> */}
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
  const mapRef = useRef(null);
  const [region, setRegion] = useState({
    latitude: 46.056946, // Center of Slovenia
    longitude: 14.505751,
    latitudeDelta: 1.5,
    longitudeDelta: 1.5,
  });
  const [userLocation, setUserLocation] = useState(null);

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

  const renderMarkers = () => {
    return stations.map((station) => {
      const isOpen = isStationOpen(station);

      return (
        <Marker
          key={station.pk}
          coordinate={{
            latitude: station.lat,
            longitude: station.lng,
          }}
          title={station.name}
          description={station.address}
          pinColor="green" // Always green pins
        >
          <Callout
            tooltip
            onPress={() =>
              navigation.navigate("PetrolStationDetails", { station })
            }
          >
            <View style={styles.calloutContainer}>
              <View style={styles.calloutHeader}>
                <Text style={styles.calloutTitle}>{station.name}</Text>
                {/* <OpenStatusBadge isOpen={isOpen} /> */}
              </View>
              <Text style={styles.calloutAddress}>{station.address}</Text>
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
                <MaterialIcons name="info-outline" size={20} color="#2e7d32" />
                <Text style={styles.calloutButtonText}>
                  {t("petrolStations.viewDetails")}
                </Text>
              </View>
            </View>
          </Callout>
        </Marker>
      );
    });
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
      <ClusteredMapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        clusterColor="#2e7d32"
        clusterTextColor="#ffffff"
        clusterBorderColor="#ffffff"
        clusterBorderWidth={4}
        radius={50}
        maxZoom={15}
        minZoom={1}
        extent={512}
        nodeSize={64}
        animationEnabled={true}
        spiralEnabled={true}
      >
        {renderMarkers()}
      </ClusteredMapView>

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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
