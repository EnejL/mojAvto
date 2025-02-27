import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addFilling } from "../../utils/firestore";

export default function AddFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { vehicle } = route.params;

  const [fillingData, setFillingData] = useState({
    date: new Date().toISOString().split("T")[0],
    liters: "",
    cost: "",
    odometer: "",
  });

  const handleSave = async () => {
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
      await addFilling(vehicle.id, {
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
        <Surface style={styles.vehicleInfoCard}>
          <Text style={styles.vehicleInfoTitle}>{t("vehicles.selected")}:</Text>
          <Text style={styles.vehicleInfoText}>
            {vehicle.name} ({vehicle.make} {vehicle.model})
          </Text>
        </Surface>

        <Surface style={styles.formCard}>
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
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  vehicleInfoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  vehicleInfoTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  vehicleInfoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  formCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    width: "48%",
  },
});
