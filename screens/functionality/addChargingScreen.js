import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { TextInput, Button, Text, Surface, SegmentedButtons } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addChargingSession } from "../../utils/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";

export default function AddChargingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { vehicle } = route.params;
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const scrollViewRef = useRef(null);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const [chargingData, setChargingData] = useState({
    date: new Date(),
    energyAdded: "",
    cost: "",
    odometer: "",
    chargingLocation: {
      type: "Public",
      chargerType: "AC",
      locationName: "",
    },
  });

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

  const formatDecimal = (value) => {
    return value.replace(".", ",");
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (event, selectedDate) => {
    // Only update the date if a date was actually selected (user didn't cancel)
    if (selectedDate) {
      setChargingData({ ...chargingData, date: selectedDate });
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

  // Toggle more details section
  const toggleMoreDetails = () => {
    const toValue = showMoreDetails ? 0 : 200; // Approximate height for the section
    
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setShowMoreDetails(!showMoreDetails);
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

      await addChargingSession(vehicle.id, {
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
      console.error("Error saving charging session:", error);
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

            {/* Collapsible More Details Section */}
            <TouchableOpacity 
              style={styles.moreDetailsButton} 
              onPress={toggleMoreDetails}
            >
              <Text style={styles.moreDetailsText}>
                {t("charging.moreDetails") || "Add more details"}
              </Text>
              <MaterialIcons 
                name={showMoreDetails ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>

            {/* Animated collapsible section */}
            <Animated.View style={[styles.collapsibleSection, { height: animatedHeight }]}>
              <View style={styles.collapsibleContent}>
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
              </View>
            </Animated.View>

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
  moreDetailsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  moreDetailsText: {
    fontSize: 16,
    color: '#666',
  },
  collapsibleSection: {
    overflow: 'hidden',
    marginBottom: 8,
  },
  collapsibleContent: {
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
}); 