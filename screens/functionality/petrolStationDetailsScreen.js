import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Linking,
  Platform,
} from "react-native";
import { Surface, Title, Paragraph, Divider, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

const PetrolStationDetailsScreen = ({ route, navigation }) => {
  const { station } = route.params;
  const { t } = useTranslation();

  const openMapsApp = () => {
    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${station.lat},${station.lng}`;
    const label = station.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  // Helper function to format opening hours
  const formatOpeningHours = () => {
    if (!station.opening_hours) return null;

    try {
      // If opening_hours is a string, try to parse it
      const hours =
        typeof station.opening_hours === "string"
          ? JSON.parse(station.opening_hours)
          : station.opening_hours;

      if (!hours) return null;

      // Days of the week in Slovenian
      const days = [
        t("days.monday"),
        t("days.tuesday"),
        t("days.wednesday"),
        t("days.thursday"),
        t("days.friday"),
        t("days.saturday"),
        t("days.sunday"),
      ];

      return (
        <View style={styles.hoursContainer}>
          {days.map((day, index) => (
            <View key={index} style={styles.hourRow}>
              <Text style={styles.dayName}>{day}</Text>
              <Text style={styles.hourText}>
                {hours[index] ? hours[index] : t("petrolStations.closed")}
              </Text>
            </View>
          ))}
        </View>
      );
    } catch (error) {
      console.error("Error parsing opening hours:", error);
      return null;
    }
  };

  // Check if station has 24/7 flag
  const isOpen24Hours = station.open_24h || station.open_24_7;

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.mapContainer}>
        <MapView
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={{
            latitude: station.lat,
            longitude: station.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: station.lat,
              longitude: station.lng,
            }}
            title={station.name}
          />
        </MapView>
      </Surface>

      <Surface style={styles.infoContainer}>
        <Title style={styles.title}>{station.name}</Title>
        <View style={styles.addressContainer}>
          <MaterialIcons name="location-on" size={20} color="#666" />
          <Paragraph style={styles.address}>
            {station.address}, {station.zip_code}
          </Paragraph>
        </View>

        <Divider style={styles.divider} />

        {/* Opening Hours Section */}
        {(isOpen24Hours || station.opening_hours) && (
          <>
            <Title style={styles.sectionTitle}>
              {t("petrolStations.openingHours")}
            </Title>

            {isOpen24Hours ? (
              <View style={styles.open24Container}>
                <MaterialIcons name="access-time" size={20} color="#2e7d32" />
                <Text style={styles.open24Text}>
                  {t("petrolStations.open24Hours")}
                </Text>
              </View>
            ) : (
              formatOpeningHours()
            )}

            <Divider style={styles.divider} />
          </>
        )}

        <Title style={styles.sectionTitle}>{t("petrolStations.prices")}</Title>
        <View style={styles.pricesContainer}>
          {station.prices["95"] && (
            <View style={styles.priceCard}>
              <Text style={styles.fuelType}>95</Text>
              <Text style={styles.priceValue}>{station.prices["95"]} €</Text>
            </View>
          )}
          {station.prices["dizel"] && (
            <View style={styles.priceCard}>
              <Text style={styles.fuelType}>Dizel</Text>
              <Text style={styles.priceValue}>{station.prices["dizel"]} €</Text>
            </View>
          )}
          {station.prices["98"] && (
            <View style={styles.priceCard}>
              <Text style={styles.fuelType}>98</Text>
              <Text style={styles.priceValue}>{station.prices["98"]} €</Text>
            </View>
          )}
          {station.prices["100"] && (
            <View style={styles.priceCard}>
              <Text style={styles.fuelType}>100</Text>
              <Text style={styles.priceValue}>{station.prices["100"]} €</Text>
            </View>
          )}
        </View>

        <Button
          mode="contained"
          icon="directions"
          style={styles.directionsButton}
          onPress={openMapsApp}
        >
          {t("petrolStations.getDirections")}
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  mapContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  address: {
    marginLeft: 8,
    color: "#666",
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
  },
  pricesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  priceCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    alignItems: "center",
  },
  fuelType: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  directionsButton: {
    backgroundColor: "#2e7d32",
    paddingVertical: 8,
  },
  hoursContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dayName: {
    fontWeight: "500",
    color: "#444",
  },
  hourText: {
    color: "#666",
  },
  open24Container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  open24Text: {
    marginLeft: 8,
    color: "#2e7d32",
    fontWeight: "bold",
  },
});

export default PetrolStationDetailsScreen;
