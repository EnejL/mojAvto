import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Keyboard, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Button, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { deleteFilling, updateFilling } from "../../utils/firestore";
import { defaultUserProfile, getUserProfile } from "../../utils/userProfile";
import {
  ENTRY_COLORS,
  EntryCard,
  EntryDivider,
  EntryLabelRow,
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
const getCurrencySymbol = (code) => (code === "USD" ? "$" : "€");

const parseDate = (dateValue) => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (dateValue?.seconds) return new Date(dateValue.seconds * 1000);
  return new Date(dateValue);
};

export default function EditFillingScreen({ route, navigation }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const { filling, vehicleId, vehicle } = route.params;

  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userSettings, setUserSettings] = useState(defaultUserProfile);

  const currencySymbol = getCurrencySymbol(userSettings.currency);
  const volumeUnit = userSettings.volumeUnit || (userSettings.unitSystem === "imperial" ? "gal" : "L");
  const distanceUnit = userSettings.distanceUnit || (userSettings.unitSystem === "imperial" ? "mi" : "km");

  const initial = useMemo(() => {
    const liters = typeof filling?.liters === "number" ? filling.liters : parseFloat(String(filling?.liters || 0));
    const cost = typeof filling?.cost === "number" ? filling.cost : parseFloat(String(filling?.cost || 0));
    const pricePerLiter = liters > 0 && Number.isFinite(cost) ? cost / liters : null;

    return {
      date: parseDate(filling?.date),
      liters: String(filling?.liters ?? "").replace(".", ","),
      pricePerLiter: pricePerLiter !== null ? formatComputedDecimal(pricePerLiter) : "",
      cost: String(filling?.cost ?? "").replace(".", ","),
      odometer: String(filling?.odometer ?? ""),
    };
  }, [filling]);

  const [fillingData, setFillingData] = useState(initial);

  useEffect(() => {
    setFillingData(initial);
  }, [initial]);

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

  const toggleDatePicker = () => {
    Keyboard.dismiss();
    setShowDatePicker((v) => !v);
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) setFillingData((d) => ({ ...d, date: selectedDate }));
  };

  const renderClearIcon = (value, onClear) => {
    if (!value || value.length === 0) return null;
    return <TextInput.Icon icon="close" onPress={onClear} iconColor={ENTRY_COLORS.muted} />;
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

      await updateFilling(vehicleId, filling.id, {
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

  const handleDelete = () => {
    Alert.alert(t("common.delete"), t("fillings.deleteConfirmMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await deleteFilling(vehicleId, filling.id);
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
            {t("fillings.delete")}
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
            />
          </View>
        ) : null}
      </View>

      <View style={styles.field}>
        <EntryLabelRow label={`${t("fillings.odometer")} (${distanceUnit})`} />
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

      <View style={styles.row}>
        <View style={[styles.field, styles.fieldHalf]}>
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

        <View style={[styles.field, styles.fieldHalf]}>
          <EntryLabelRow label={`${t("fillings.pricePerLiter")} (${currencySymbol}/${volumeUnit})`} />
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
            right={renderClearIcon(fillingData.pricePerLiter, () => setFillingData((d) => ({ ...d, pricePerLiter: "" })))}
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
});
