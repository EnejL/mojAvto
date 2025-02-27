import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
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
        <View style={styles.formContainer}>
          <Text style={styles.vehicleInfo}>
            {vehicle.name} ({vehicle.make} {vehicle.model})
          </Text>

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
  vehicleInfo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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
});
