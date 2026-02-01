import React, { useEffect, useRef, useState } from "react";
import { Alert, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, SegmentedButtons, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { deleteChargingSession, getVehicleHistory, updateChargingSession } from "../../utils/firestore";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { defaultUserProfile, getUserProfile } from "../../utils/userProfile";
import {
  ENTRY_COLORS,
  EntryCard,
  EntryDivider,
  EntryLabelRow,
  EntryPill,
  EntryScreenLayout,
} from "../../components/EntryScreenLayout";

const formatDecimalInput = (value) => value.replace(".", ",");
const parseDecimal = (value) => {
  if (!value) return null;
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const formatComputedDecimal = (value) => {
  if (!Number.isFinite(value)) return "";
  return value.toFixed(2).replace(".", ",");
};
const formatOdometer = (value) => {
  if (value === null || value === undefined) return "";
  return Math.round(parseFloat(value)).toLocaleString("de-DE");
};
const getCurrencySymbol = (code) => (code === "USD" ? "$" : "€");

export default function EditChargingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { chargingSession, vehicleId, vehicle } = route.params;
  const scrollRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [userSettings, setUserSettings] = useState(defaultUserProfile);
  const [prevOdometer, setPrevOdometer] = useState(null);

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

  const renderClearIcon = (value, onClear) => {
    if (!value || value.length === 0) return null;
    return <TextInput.Icon icon="close" onPress={onClear} iconColor={ENTRY_COLORS.muted} />;
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

  const currencySymbol = getCurrencySymbol(userSettings.currency);
  const distanceUnit = userSettings.distanceUnit || (userSettings.unitSystem === "imperial" ? "mi" : "km");

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const profile = await getUserProfile();
        setUserSettings(profile);
      } catch (e) {
        setUserSettings(defaultUserProfile);
      }
    };
    loadUserSettings();
    const unsubscribe = navigation?.addListener?.("focus", loadUserSettings);
    return unsubscribe;
  }, [navigation]);

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

  useEffect(() => {
    let mounted = true;
    const loadPrevOdometer = async () => {
      try {
        const history = await getVehicleHistory(vehicleId);
        const max = history.reduce((acc, entry) => {
          // Exclude this session itself if present in history
          if (entry?.type === "charging" && entry?.id === chargingSession.id) return acc;
          const odo = typeof entry.odometer === "number" ? entry.odometer : parseInt(entry.odometer, 10);
          if (!Number.isFinite(odo)) return acc;
          return acc === null || odo > acc ? odo : acc;
        }, null);
        if (mounted) setPrevOdometer(max);
      } catch (e) {
        if (mounted) setPrevOdometer(null);
      }
    };
    loadPrevOdometer();
    return () => {
      mounted = false;
    };
  }, [vehicleId, chargingSession.id]);

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

  const onChangeEnergyAdded = (text) => {
    setChargingData((prev) => ({ ...prev, energyAdded: formatDecimalInput(text) }));
  };

  const onChangeCost = (text) => {
    setChargingData((prev) => ({ ...prev, cost: formatDecimalInput(text) }));
  };

  const pricePerKWhComputed = (() => {
    const energyNum = parseDecimal(chargingData.energyAdded);
    const costNum = parseDecimal(chargingData.cost);
    if (energyNum !== null && costNum !== null && energyNum > 0) {
      return formatComputedDecimal(costNum / energyNum);
    }
    return null;
  })();

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
        date: chargingData.date.toISOString().split("T")[0],
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
            alert(t("common.error.delete"));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <EntryScreenLayout
      scrollRef={scrollRef}
      bottom={
        <View style={styles.bottomRow}>
          <Button
            mode="outlined"
            onPress={handleDelete}
            disabled={loading}
            textColor={ENTRY_COLORS.danger}
            style={styles.deleteButton}
            contentStyle={styles.bottomButtonContent}
            labelStyle={styles.bottomButtonLabel}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="trash-can" size={size} color={color} />
            )}
          >
            {t("charging.delete")}
          </Button>

          <Button
            mode="contained"
            onPress={handleSave}
            disabled={loading}
            loading={loading}
            buttonColor={ENTRY_COLORS.blue}
            style={styles.saveButton}
            contentStyle={styles.bottomButtonContent}
            labelStyle={styles.bottomButtonLabel}
          >
            {t("common.save")}
          </Button>
        </View>
      }
    >
      {vehicle ? (
        <EntryCard style={styles.vehicleCard}>
          <Text style={styles.vehicleName}>{vehicle.name}</Text>
          <Text style={styles.vehicleMeta}>
            {vehicle.make} {vehicle.model}
          </Text>
        </EntryCard>
      ) : null}

      <View style={styles.field}>
        <EntryLabelRow label={t("charging.date")} />
        <TouchableOpacity style={styles.dateField} onPress={toggleDatePicker} activeOpacity={0.85}>
          <Text style={styles.dateValue}>{chargingData.date?.toLocaleDateString?.() || ""}</Text>
          <MaterialIcons name="calendar-today" size={18} color={ENTRY_COLORS.muted} />
        </TouchableOpacity>
        {showDatePicker ? (
          <View style={styles.inlinePicker}>
            <DateTimePicker
              value={chargingData.date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <EntryLabelRow
          label={`${t("charging.odometer")} (${distanceUnit})`}
          required
          right={
            prevOdometer !== null ? (
              <EntryPill>{`Prev: ${formatOdometer(prevOdometer)}`}</EntryPill>
            ) : null
          }
        />
        <TextInput
          value={chargingData.odometer}
          onChangeText={(text) => setChargingData((d) => ({ ...d, odometer: text }))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          textColor={ENTRY_COLORS.text}
          outlineColor={ENTRY_COLORS.border}
          activeOutlineColor={ENTRY_COLORS.blue}
          placeholderTextColor={ENTRY_COLORS.placeholder}
          placeholder={formatOdometer(prevOdometer)}
          onFocus={() => setShowDatePicker(false)}
          right={renderClearIcon(chargingData.odometer, () =>
            setChargingData((d) => ({ ...d, odometer: "" }))
          )}
        />
      </View>

      <EntryDivider />

      <View style={styles.field}>
        <EntryLabelRow label={`${t("charging.energyAdded")} (kWh)`} required />
        <TextInput
          value={chargingData.energyAdded}
          onChangeText={onChangeEnergyAdded}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          textColor={ENTRY_COLORS.text}
          outlineColor={ENTRY_COLORS.border}
          activeOutlineColor={ENTRY_COLORS.blue}
          placeholderTextColor={ENTRY_COLORS.placeholder}
          placeholder="0.00"
          onFocus={() => setShowDatePicker(false)}
          right={renderClearIcon(chargingData.energyAdded, () =>
            setChargingData((d) => ({ ...d, energyAdded: "" }))
          )}
        />
      </View>

      <View style={styles.field}>
        <EntryLabelRow label={t("common.totalCost")} required />
        <TextInput
          value={chargingData.cost}
          onChangeText={onChangeCost}
          keyboardType="numeric"
          mode="outlined"
          style={styles.inputBig}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputBigContent}
          textColor={ENTRY_COLORS.text}
          outlineColor={ENTRY_COLORS.border}
          activeOutlineColor={ENTRY_COLORS.blue}
          placeholderTextColor={ENTRY_COLORS.placeholder}
          placeholder={`${currencySymbol} 0.00`}
          onFocus={() => setShowDatePicker(false)}
          left={<TextInput.Icon icon={() => <Text style={styles.currencyPrefix}>{currencySymbol}</Text>} />}
          right={renderClearIcon(chargingData.cost, () =>
            setChargingData((d) => ({ ...d, cost: "" }))
          )}
        />
      </View>

      {pricePerKWhComputed !== null ? (
        <View style={styles.computedRow}>
          <EntryLabelRow label={`${t("charging.pricePerKWh")} (${currencySymbol}/kWh)`} />
          <Text style={styles.computedValue}>
            {currencySymbol} {pricePerKWhComputed}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.moreDetailsButton}
        onPress={() => setShowMoreDetails((v) => !v)}
        activeOpacity={0.85}
      >
        <Text style={styles.moreDetailsText}>{t("charging.moreDetails")}</Text>
        <MaterialIcons
          name={showMoreDetails ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={ENTRY_COLORS.muted}
        />
      </TouchableOpacity>

      {showMoreDetails ? (
        <EntryCard style={styles.detailsCard}>
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>{t("charging.locationType")}</Text>
            <SegmentedButtons
              value={chargingData.chargingLocation.type}
              onValueChange={(value) =>
                setChargingData((d) => ({
                  ...d,
                  chargingLocation: { ...d.chargingLocation, type: value },
                }))
              }
              buttons={locationTypeOptions}
              disabled={loading}
              style={styles.segmentedButtons}
            />
          </View>

          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>{t("charging.chargerType")}</Text>
            <SegmentedButtons
              value={chargingData.chargingLocation.chargerType}
              onValueChange={(value) =>
                setChargingData((d) => ({
                  ...d,
                  chargingLocation: { ...d.chargingLocation, chargerType: value },
                }))
              }
              buttons={chargerTypeOptions}
              disabled={loading}
              style={styles.segmentedButtons}
            />
          </View>

          <View style={styles.field}>
            <EntryLabelRow label={t("charging.locationName")} />
            <TextInput
              value={chargingData.chargingLocation.locationName}
              onChangeText={(text) =>
                setChargingData((d) => ({
                  ...d,
                  chargingLocation: { ...d.chargingLocation, locationName: text },
                }))
              }
              mode="outlined"
              style={styles.input}
              outlineStyle={styles.inputOutline}
              contentStyle={styles.inputContent}
              textColor={ENTRY_COLORS.text}
              outlineColor={ENTRY_COLORS.border}
              activeOutlineColor={ENTRY_COLORS.blue}
              placeholderTextColor={ENTRY_COLORS.placeholder}
              placeholder={t("charging.locationNamePlaceholder")}
              onFocus={() => setShowDatePicker(false)}
              right={renderClearIcon(chargingData.chargingLocation.locationName, () =>
                setChargingData((d) => ({
                  ...d,
                  chargingLocation: { ...d.chargingLocation, locationName: "" },
                }))
              )}
            />
          </View>
        </EntryCard>
      ) : null}
    </EntryScreenLayout>
  );
}

const styles = StyleSheet.create({
  bottomRow: {
    flexDirection: "row",
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 18,
    borderColor: "rgba(255, 77, 79, 0.7)",
  },
  saveButton: {
    flex: 1,
    borderRadius: 18,
  },
  bottomButtonContent: {
    height: 58,
  },
  bottomButtonLabel: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  vehicleCard: {
    paddingVertical: 22,
  },
  vehicleName: {
    color: ENTRY_COLORS.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  vehicleMeta: {
    color: ENTRY_COLORS.muted,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  field: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldHalf: {
    width: "48%",
  },
  input: {
    backgroundColor: ENTRY_COLORS.surface,
  },
  inputBig: {
    backgroundColor: ENTRY_COLORS.surface,
  },
  inputOutline: {
    borderRadius: 18,
  },
  inputContent: {
    height: 56,
  },
  inputBigContent: {
    height: 56,
    paddingTop: 0,
    paddingBottom: 0,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  currencyPrefix: {
    color: ENTRY_COLORS.muted,
    fontWeight: "900",
    fontSize: 18,
    paddingLeft: 2,
    includeFontPadding: false,
  },
  dateField: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ENTRY_COLORS.border,
    backgroundColor: ENTRY_COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateValue: {
    color: ENTRY_COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  inlinePicker: {
    marginTop: 8,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: ENTRY_COLORS.border,
    backgroundColor: ENTRY_COLORS.surface,
  },
  moreDetailsButton: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ENTRY_COLORS.border,
    backgroundColor: ENTRY_COLORS.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  moreDetailsText: {
    color: ENTRY_COLORS.muted,
    fontSize: 16,
    fontWeight: "800",
  },
  detailsCard: {
    marginTop: 10,
  },
  selectorContainer: {
    marginBottom: 14,
  },
  selectorLabel: {
    color: ENTRY_COLORS.muted,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 6,
  },
  computedRow: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ENTRY_COLORS.border,
    backgroundColor: ENTRY_COLORS.surface,
  },
  computedValue: {
    fontSize: 18,
    fontWeight: "700",
    color: ENTRY_COLORS.text,
    marginTop: 4,
  },
}); 