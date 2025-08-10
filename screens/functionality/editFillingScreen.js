import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { TextInput, Button, Surface, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { updateFilling, deleteFilling } from "../../utils/firestore";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import FormLabel from "../../components/FormLabel";

export default function EditFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { filling, vehicleId } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef(null);

  const formatDecimal = (value) => {
    return value.replace(".", ",");
  };

  // Parse the date from the filling object
  const parseDate = (dateValue) => {
    if (dateValue instanceof Date) {
      return dateValue;
    } else if (dateValue.seconds) {
      return new Date(dateValue.seconds * 1000);
    } else {
      return new Date(dateValue);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const [fillingData, setFillingData] = useState({
    date: parseDate(filling.date),
    liters: filling.liters.toString().replace(".", ","),
    cost: filling.cost.toString().replace(".", ","),
    odometer: filling.odometer.toString(),
  });

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

      await updateFilling(vehicleId, filling.id, {
        date: formatDate(fillingData.date),
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
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <ScrollView ref={scrollViewRef}>
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
    </TouchableWithoutFeedback>
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
