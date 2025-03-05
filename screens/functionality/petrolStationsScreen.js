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

  const renderStationItem = ({ item }) => (
    <Card style={styles.stationCard} onPress={() => handleStationPress(item)}>
      <Card.Content>
        <Title>{item.name}</Title>
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
        {stations.map((station) => (
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
            <Callout tooltip onPress={() => navigateToStationDetails(station)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{station.name}</Text>
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
        ))}
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
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
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
});

export default PetrolStationsScreen;
