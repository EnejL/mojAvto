import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { addFilling, getVehicleHistory } from "../../utils/firestore";
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

export default function AddFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const { vehicle } = route.params;
  const screenWidth = Dimensions.get("window").width;
  const isSmallScreen = screenWidth < 450; // Stack fields on iPhone 12 and smaller screens

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userSettings, setUserSettings] = useState(defaultUserProfile);
  const [prevOdometer, setPrevOdometer] = useState(null);

  const currencySymbol = getCurrencySymbol(userSettings.currency);
  const volumeUnit = userSettings.volumeUnit || (userSettings.unitSystem === "imperial" ? "gal" : "L");
  const distanceUnit = userSettings.distanceUnit || (userSettings.unitSystem === "imperial" ? "mi" : "km");

  const [fillingData, setFillingData] = useState({
    date: new Date(),
    liters: "",
    pricePerLiter: "",
    cost: "",
    odometer: "",
  });

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

  useEffect(() => {
    let mounted = true;
    const loadPrevOdometer = async () => {
      try {
        const history = await getVehicleHistory(vehicle.id);
        const max = history.reduce((acc, entry) => {
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
  }, [vehicle.id]);

  // Intentionally do NOT prefill odometer with previous value.

  const toggleDatePicker = () => {
    Keyboard.dismiss();
    setShowDatePicker((v) => !v);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) setFillingData((d) => ({ ...d, date: selectedDate }));
  };

  const onChangeLiters = (text) => {
    const liters = formatDecimalInput(text);
    setFillingData((prev) => {
      const litersNum = parseDecimal(liters);
      const priceNum = parseDecimal(prev.pricePerLiter);
      const next = { ...prev, liters };
      if (litersNum !== null && priceNum !== null) {
        next.cost = formatComputedDecimal(litersNum * priceNum);
      }
      return next;
    });
  };

  const onChangePricePerLiter = (text) => {
    const pricePerLiter = formatDecimalInput(text);
    setFillingData((prev) => {
      const litersNum = parseDecimal(prev.liters);
      const priceNum = parseDecimal(pricePerLiter);
      const next = { ...prev, pricePerLiter };
      if (litersNum !== null && priceNum !== null) {
        next.cost = formatComputedDecimal(litersNum * priceNum);
      }
      return next;
    });
  };

  const onChangeCost = (text) => {
    const cost = formatDecimalInput(text);
    setFillingData((prev) => {
      const litersNum = parseDecimal(prev.liters);
      const costNum = parseDecimal(cost);
      const next = { ...prev, cost };
      if (litersNum !== null && costNum !== null && litersNum > 0) {
        next.pricePerLiter = formatComputedDecimal(costNum / litersNum);
      }
      return next;
    });
  };

  const renderClearIcon = (value, onClear) => {
    if (!value || value.length === 0) return null;
    return <TextInput.Icon icon="close" onPress={onClear} iconColor={ENTRY_COLORS.muted} />;
  };

  const formatDisplayDate = (date) => date?.toLocaleDateString?.() || "";

  const handleSave = async () => {
    if (!fillingData.date || !fillingData.liters || !fillingData.cost || !fillingData.odometer) {
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
        date: fillingData.date.toISOString().split("T")[0],
        liters,
        cost,
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
    <EntryScreenLayout
      scrollRef={scrollRef}
      bottom={
        <Button
          mode="contained"
          onPress={handleSave}
          disabled={loading}
          loading={loading}
          buttonColor={ENTRY_COLORS.blue}
          style={styles.primaryButton}
          contentStyle={styles.primaryButtonContent}
          labelStyle={styles.primaryButtonLabel}
        >
          {t("common.save")}
        </Button>
      }
    >
      <EntryCard style={styles.vehicleCard}>
        <Text style={styles.vehicleName}>{vehicle.name}</Text>
        <Text style={styles.vehicleMeta}>
          {vehicle.make} {vehicle.model}
        </Text>
      </EntryCard>

      <View style={styles.field}>
        <EntryLabelRow label={t("fillings.date")} />
        <TouchableOpacity style={styles.dateField} onPress={toggleDatePicker} activeOpacity={0.85}>
          <Text style={styles.dateValue}>{formatDisplayDate(fillingData.date)}</Text>
          <MaterialIcons name="calendar-today" size={18} color={ENTRY_COLORS.muted} />
        </TouchableOpacity>
        {showDatePicker ? (
          <View style={styles.inlinePicker}>
            <DateTimePicker
              value={fillingData.date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              textColor={Platform.OS === "ios" ? ENTRY_COLORS.text : undefined}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <EntryLabelRow
          label={`${t("fillings.odometer")} (${distanceUnit})`}
          allowWrap={true}
          right={
            prevOdometer !== null ? (
              <EntryPill>{`${t("fillings.previous")}: ${formatOdometer(prevOdometer)}`}</EntryPill>
            ) : null
          }
        />
        <TextInput
          value={fillingData.odometer}
          onChangeText={(text) => setFillingData((d) => ({ ...d, odometer: text }))}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          outlineStyle={styles.inputOutline}
          contentStyle={styles.inputContent}
          textColor={ENTRY_COLORS.text}
          outlineColor={ENTRY_COLORS.border}
          activeOutlineColor={ENTRY_COLORS.blue}
          placeholderTextColor={ENTRY_COLORS.placeholder}
          onFocus={() => setShowDatePicker(false)}
          right={renderClearIcon(fillingData.odometer, () => setFillingData((d) => ({ ...d, odometer: "" })))}
        />
      </View>

      <EntryDivider />

      <View style={[styles.row, isSmallScreen && styles.rowStacked]}>
        <View style={[styles.field, isSmallScreen ? styles.fieldFull : styles.fieldHalf]}>
          <EntryLabelRow label={`${t("fillings.liters")} (${volumeUnit})`} />
          <TextInput
            value={fillingData.liters}
            onChangeText={onChangeLiters}
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
            right={renderClearIcon(fillingData.liters, () => setFillingData((d) => ({ ...d, liters: "" })))}
          />
        </View>

        <View style={[styles.field, isSmallScreen ? styles.fieldFull : styles.fieldHalf]}>
          <EntryLabelRow label={`${t("fillings.pricePerLiter")} (${currencySymbol}/${volumeUnit})`} allowWrap={true} />
          <TextInput
            value={fillingData.pricePerLiter}
            onChangeText={onChangePricePerLiter}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            textColor={ENTRY_COLORS.text}
            outlineColor={ENTRY_COLORS.border}
            activeOutlineColor={ENTRY_COLORS.blue}
            placeholderTextColor={ENTRY_COLORS.placeholder}
            placeholder={`${currencySymbol} 0.00`}
            onFocus={() => setShowDatePicker(false)}
            right={renderClearIcon(fillingData.pricePerLiter, () =>
              setFillingData((d) => ({ ...d, pricePerLiter: "" }))
            )}
          />
        </View>
      </View>

      <View style={styles.field}>
        <EntryLabelRow label={t("common.totalCost")} />
        <TextInput
          value={fillingData.cost}
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
          right={renderClearIcon(fillingData.cost, () => setFillingData((d) => ({ ...d, cost: "" })))}
        />
      </View>
    </EntryScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  rowStacked: {
    flexDirection: "column",
  },
  fieldHalf: {
    width: "48%",
  },
  fieldFull: {
    width: "100%",
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
    height: 68,
  },
  currencyPrefix: {
    color: ENTRY_COLORS.muted,
    fontWeight: "900",
    fontSize: 18,
    paddingTop: 6,
    paddingLeft: 2,
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
  primaryButton: {
    borderRadius: 18,
  },
  primaryButtonContent: {
    height: 58,
  },
  primaryButtonLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
    letterSpacing: 0.2,
  },
});
