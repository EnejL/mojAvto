import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { updateFilling, deleteFilling } from "../../utils/firestore";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { filling, vehicleId } = route.params;
  const [loading, setLoading] = useState(false);

  const formatDecimal = (value) => {
    return value.replace(".", ",");
  };

  const [fillingData, setFillingData] = useState({
    date:
      filling.date instanceof Date
        ? filling.date.toISOString().split("T")[0]
        : filling.date.seconds
        ? new Date(filling.date.seconds * 1000).toISOString().split("T")[0]
        : filling.date,
    liters: filling.liters.toString().replace(".", ","),
    cost: filling.cost.toString().replace(".", ","),
    odometer: filling.odometer.toString(),
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
      const litersStr = fillingData.liters.replace(",", ".");
      const costStr = fillingData.cost.replace(",", ".");

      const liters = parseFloat(parseFloat(litersStr).toFixed(2));
      const cost = parseFloat(parseFloat(costStr).toFixed(2));

      await updateFilling(vehicleId, filling.id, {
        date: fillingData.date,
        liters: liters,
        cost: cost,
        odometer: parseInt(fillingData.odometer, 10),
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error updating filling:", error);
      alert(t("common.error.save"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t("common.delete"), t("fillings.deleteConfirmMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteFilling(vehicleId, filling.id);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting filling:", error);
            alert(t("common.error.delete"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
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
            onChangeText={(text) => {
              const formattedText = formatDecimal(text);
              setFillingData({ ...fillingData, liters: formattedText });
            }}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label={t("fillings.cost")}
            value={fillingData.cost}
            onChangeText={(text) => {
              const formattedText = formatDecimal(text);
              setFillingData({ ...fillingData, cost: formattedText });
            }}
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
        </Surface>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.deleteButton}
          labelStyle={styles.deleteButtonLabel}
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name="trash-can"
              size={size}
              color={color}
            />
          )}
        >
          {t("fillings.delete")}
        </Button>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
            disabled={loading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={[styles.button, styles.saveButton]}
            loading={loading}
            disabled={loading}
          >
            {t("common.save")}
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  formCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  bottomContainer: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  deleteButton: {
    marginBottom: 16,
    borderColor: "#d32f2f",
    backgroundColor: "transparent",
    width: "95%",
    alignSelf: "center",
  },
  deleteButtonLabel: {
    fontSize: 16,
    paddingVertical: 4,
    color: "#d32f2f",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    borderColor: "#495057",
  },
  saveButton: {
    backgroundColor: "#6c757d",
  },
});
