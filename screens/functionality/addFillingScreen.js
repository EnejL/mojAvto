import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  TextInput,
  Button,
  Text,
  Menu,
  Divider,
  Portal,
  Modal,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addFilling, getVehicles } from "../../utils/firestore";

export default function AddFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);
  const buttonRef = useRef(null);

  // Get the vehicle from route params if available
  const vehicleFromParams = route.params?.vehicle;

  const [fillingData, setFillingData] = useState({
    date: new Date().toISOString().split("T")[0],
    liters: "",
    cost: "",
    odometer: "",
  });

  useEffect(() => {
    const fetchAllVehicles = async () => {
      setFetchingVehicles(true);
      try {
        console.log("Fetching all vehicles...");
        const vehicleData = await getVehicles();
        console.log("Fetched vehicles:", vehicleData);

        // Log each vehicle to debug
        if (vehicleData && vehicleData.length > 0) {
          vehicleData.forEach((vehicle, index) => {
            console.log(`Vehicle ${index + 1}:`, vehicle.name, vehicle.id);
          });

          setVehicles(vehicleData);

          // If we have a vehicle from params, use it
          if (vehicleFromParams) {
            setSelectedVehicle(vehicleFromParams);
          } else {
            // Otherwise use the first vehicle
            setSelectedVehicle(vehicleData[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      } finally {
        setFetchingVehicles(false);
      }
    };

    fetchAllVehicles();
  }, [vehicleFromParams]);

  const handleSave = async () => {
    if (!selectedVehicle) {
      alert(t("common.error.required"));
      return;
    }

    if (
      !fillingData.date ||
      !fillingData.liters ||
      !fillingData.cost ||
      !fillingData.odometer
    ) {
      alert(t("common.error.required"));
      return;
    }

    setLoading(true);
    try {
      await addFilling(selectedVehicle.id, {
        date: fillingData.date,
        liters: parseFloat(fillingData.liters),
        cost: parseFloat(fillingData.cost),
        odometer: parseInt(fillingData.odometer, 10),
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error saving filling:", error);
      alert(t("common.error.save"));
    } finally {
      setLoading(false);
    }
  };

  // Use a modal instead of Menu for better control
  const renderVehicleSelector = () => (
    <Portal>
      <Modal
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        contentContainerStyle={styles.modalContainer}
      >
        <Text style={styles.modalTitle}>{t("vehicles.select")}</Text>
        <ScrollView style={styles.modalScroll}>
          {vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={styles.vehicleItem}
              onPress={() => {
                setSelectedVehicle(vehicle);
                setMenuVisible(false);
              }}
            >
              <Text style={styles.vehicleName}>
                {vehicle.name} ({vehicle.make} {vehicle.model})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Button
          mode="outlined"
          onPress={() => setMenuVisible(false)}
          style={styles.closeButton}
        >
          {t("common.cancel")}
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {renderVehicleSelector()}
      <ScrollView>
        <View style={styles.formContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>{t("vehicles.select")}</Text>

            {fetchingVehicles ? (
              <Text>Loading vehicles...</Text>
            ) : (
              <Button
                mode="outlined"
                onPress={() => setMenuVisible(true)}
                style={styles.dropdown}
                disabled={vehicles.length === 0}
                ref={buttonRef}
              >
                {selectedVehicle
                  ? selectedVehicle.name
                  : t("vehicles.selectPrompt")}
              </Button>
            )}
          </View>

          <TextInput
            label={t("fillings.date")}
            value={fillingData.date}
            onChangeText={(text) =>
              setFillingData({ ...fillingData, date: text })
            }
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t("fillings.liters")}
            value={fillingData.liters}
            onChangeText={(text) =>
              setFillingData({ ...fillingData, liters: text })
            }
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t("fillings.cost")}
            value={fillingData.cost}
            onChangeText={(text) =>
              setFillingData({ ...fillingData, cost: text })
            }
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t("fillings.odometer")}
            value={fillingData.odometer}
            onChangeText={(text) =>
              setFillingData({ ...fillingData, odometer: text })
            }
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.button}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>

            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              {t("common.save")}
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    width: "48%",
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dropdown: {
    width: "100%",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalScroll: {
    maxHeight: 300,
  },
  vehicleItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  vehicleName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
  },
});
