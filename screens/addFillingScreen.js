import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Menu, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addFilling, getVehicles } from "../utils/firestore";

export default function AddFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);

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

        if (vehicleData && vehicleData.length > 0) {
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

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>{t("vehicles.select")}</Text>

            {fetchingVehicles ? (
              <Text>Loading vehicles...</Text>
            ) : (
              <>
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.dropdown}
                  disabled={vehicles.length === 0}
                >
                  {selectedVehicle
                    ? selectedVehicle.name
                    : t("vehicles.selectPrompt")}
                </Button>

                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={<View />}
                  style={styles.menu}
                >
                  {vehicles.map((vehicle) => (
                    <Menu.Item
                      key={vehicle.id}
                      onPress={() => {
                        setSelectedVehicle(vehicle);
                        setMenuVisible(false);
                      }}
                      title={`${vehicle.name} (${vehicle.make} ${vehicle.model})`}
                    />
                  ))}
                </Menu>
              </>
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
  menu: {
    width: "80%",
  },
});
