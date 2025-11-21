import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addFilling } from "../../utils/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import FormLabel from "../../components/FormLabel";

export default function AddFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { vehicle } = route.params;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef(null);

  const [fillingData, setFillingData] = useState({
    date: new Date(),
    liters: "",
    cost: "",
    odometer: "",
  });

  const formatDecimal = (value) => {
    return value.replace(".", ",");
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (event, selectedDate) => {
    // Only update the date if a date was actually selected (user didn't cancel)
    if (selectedDate) {
      setFillingData({ ...fillingData, date: selectedDate });
    }

    // Note: We're not closing the picker here anymore
    // The picker will stay open until the user taps elsewhere
  };

  // Toggle date picker visibility
  const toggleDatePicker = () => {
    // Close keyboard if open
    Keyboard.dismiss();
    setShowDatePicker(!showDatePicker);
  };

  // Handle tapping outside of inputs to dismiss keyboard and date picker
  const handleOutsidePress = () => {
    Keyboard.dismiss();
    if (showDatePicker) {
      setShowDatePicker(false);
    }
  };

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

      await addFilling(vehicle.id, {
        date: formatDate(fillingData.date),
        liters: liters,
        cost: cost,
        odometer: parseInt(fillingData.odometer, 10),
      });

      navigation.goBack();
    } catch (error) {
      alert(t("common.error.save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <ScrollView ref={scrollViewRef}>
          <Surface style={styles.vehicleInfoCard}>
            <Text style={styles.vehicleInfoTitle}>
              {t("vehicles.selected")}:
            </Text>
            <Text style={styles.vehicleInfoText}>
              {vehicle.name} ({vehicle.make} {vehicle.model})
            </Text>
          </Surface>

          <Surface style={styles.formCard}>
            {/* Date Picker Button */}
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={toggleDatePicker}
            >
              <FormLabel required style={styles.datePickerLabel}>{t("fillings.date")}</FormLabel>
              <View style={styles.datePickerValueContainer}>
                <Text style={styles.datePickerValue}>
                  {formatDate(fillingData.date)}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </View>
            </TouchableOpacity>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={fillingData.date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}

            <TextInput
              label={<FormLabel required>{t("fillings.liters")}</FormLabel>}
              value={fillingData.liters}
              onChangeText={(text) => {
                const formattedText = formatDecimal(text);
                setFillingData({ ...fillingData, liters: formattedText });
              }}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
            />

            <TextInput
              label={<FormLabel required>{t("fillings.cost")}</FormLabel>}
              value={fillingData.cost}
              onChangeText={(text) => {
                const formattedText = formatDecimal(text);
                setFillingData({ ...fillingData, cost: formattedText });
              }}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
            />

            <TextInput
              label={<FormLabel required>{t("fillings.odometer")}</FormLabel>}
              value={fillingData.odometer}
              onChangeText={(text) =>
                setFillingData({ ...fillingData, odometer: text })
              }
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
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
    </TouchableWithoutFeedback>
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
    marginTop: 6,
    marginHorizontal: 6,
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
    marginHorizontal: 6,
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#666",
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  datePickerLabel: {
    alignSelf: "center",
  },
  datePickerValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingLeft: 15,
  },
  datePickerValue: {
    fontSize: 16,
  },
});
