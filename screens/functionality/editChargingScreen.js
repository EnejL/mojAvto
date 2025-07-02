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
import { TextInput, Button, Surface, Text, SegmentedButtons } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { updateChargingSession, deleteChargingSession } from "../../utils/firestore";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EditChargingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { chargingSession, vehicleId } = route.params;
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scrollViewRef = useRef(null);

  const formatDecimal = (value) => {
    return value.replace(".", ",");
  };

  // Parse the date from the charging session object
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

  // Charging location type options
  const locationTypeOptions = [
    { value: 'Home', label: t('charging.locationHome') || 'Home' },
    { value: 'Public', label: t('charging.locationPublic') || 'Public' },
    { value: 'Workplace', label: t('charging.locationWorkplace') || 'Workplace' },
  ];

  // Charger type options
  const chargerTypeOptions = [
    { value: 'AC', label: 'AC' },
    { value: 'DC Fast', label: 'DC Fast' },
  ];

  const [chargingData, setChargingData] = useState({
    date: parseDate(chargingSession.date),
    energyAdded: chargingSession.energyAdded.toString().replace(".", ","),
    cost: chargingSession.cost.toString().replace(".", ","),
    odometer: chargingSession.odometer.toString(),
    chargingLocation: {
      type: chargingSession.chargingLocation?.type || "Public",
      chargerType: chargingSession.chargingLocation?.chargerType || "AC",
      locationName: chargingSession.chargingLocation?.locationName || "",
    },
  });

  const handleDateChange = (event, selectedDate) => {
    // Only update the date if a date was actually selected (user didn't cancel)
    if (selectedDate) {
      setChargingData({ ...chargingData, date: selectedDate });
    }
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
      !chargingData.date ||
      !chargingData.energyAdded ||
      !chargingData.cost ||
      !chargingData.odometer
    ) {
      alert(t("common.error.required"));
      return;
    }

    setLoading(true);
    try {
      const energyAddedStr = chargingData.energyAdded.replace(",", ".");
      const costStr = chargingData.cost.replace(",", ".");

      const energyAdded = parseFloat(parseFloat(energyAddedStr).toFixed(2));
      const cost = parseFloat(parseFloat(costStr).toFixed(2));

      await updateChargingSession(vehicleId, chargingSession.id, {
        date: formatDate(chargingData.date),
        energyAdded: energyAdded,
        cost: cost,
        odometer: parseInt(chargingData.odometer, 10),
        chargingLocation: {
          type: chargingData.chargingLocation.type,
          chargerType: chargingData.chargingLocation.chargerType,
          locationName: chargingData.chargingLocation.locationName.trim(),
        },
      });

      navigation.goBack();
    } catch (error) {
      console.error("Error updating charging session:", error);
      alert(t("common.error.save"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(t("common.delete"), t("charging.deleteConfirmMessage"), [
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
            await deleteChargingSession(vehicleId, chargingSession.id);
            navigation.goBack();
          } catch (error) {
            console.error("Error deleting charging session:", error);
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
              <Text style={styles.datePickerLabel}>{t("charging.date")}</Text>
              <View style={styles.datePickerValueContainer}>
                <Text style={styles.datePickerValue}>
                  {formatDate(chargingData.date)}
                </Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </View>
            </TouchableOpacity>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={chargingData.date}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
              />
            )}

            <TextInput
              label={t("charging.energyAdded")}
              value={chargingData.energyAdded}
              onChangeText={(text) => {
                const formattedText = formatDecimal(text);
                setChargingData({ ...chargingData, energyAdded: formattedText });
              }}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
              right={<TextInput.Affix text="kWh" />}
            />

            <TextInput
              label={t("charging.cost")}
              value={chargingData.cost}
              onChangeText={(text) => {
                const formattedText = formatDecimal(text);
                setChargingData({ ...chargingData, cost: formattedText });
              }}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
              right={<TextInput.Affix text="€" />}
            />

            <TextInput
              label={t("charging.odometer")}
              value={chargingData.odometer}
              onChangeText={(text) =>
                setChargingData({ ...chargingData, odometer: text })
              }
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
              right={<TextInput.Affix text="km" />}
            />

            {/* Location Type Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>{t("charging.locationType")}</Text>
              <SegmentedButtons
                value={chargingData.chargingLocation.type}
                onValueChange={(value) => setChargingData({ 
                  ...chargingData, 
                  chargingLocation: { ...chargingData.chargingLocation, type: value }
                })}
                buttons={locationTypeOptions}
                style={styles.segmentedButtons}
                disabled={loading}
              />
            </View>

            {/* Charger Type Selector */}
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>{t("charging.chargerType")}</Text>
              <SegmentedButtons
                value={chargingData.chargingLocation.chargerType}
                onValueChange={(value) => setChargingData({ 
                  ...chargingData, 
                  chargingLocation: { ...chargingData.chargingLocation, chargerType: value }
                })}
                buttons={chargerTypeOptions}
                style={styles.segmentedButtons}
                disabled={loading}
              />
            </View>

            {/* Optional Location Name */}
            <TextInput
              label={t("charging.locationName")}
              value={chargingData.chargingLocation.locationName}
              onChangeText={(text) =>
                setChargingData({ 
                  ...chargingData, 
                  chargingLocation: { ...chargingData.chargingLocation, locationName: text }
                })
              }
              style={styles.input}
              mode="outlined"
              onFocus={() => setShowDatePicker(false)}
              placeholder={t("charging.locationNamePlaceholder")}
            />
          </Surface>

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
              {t("charging.delete")}
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
  formCard: {
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
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
  bottomContainer: {
    marginTop: 16,
  },
  deleteButton: {
    marginBottom: 16,
    borderColor: "#d32f2f",
  },
  deleteButtonLabel: {
    color: "#d32f2f",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  button: {
    width: "48%",
  },
  cancelButton: {
    borderColor: "#666",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
  },
}); 