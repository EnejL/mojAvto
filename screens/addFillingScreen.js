import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Title } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function AddFillingScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { vehicleName } = route.params;
  const [filling, setFilling] = useState({
    date: new Date().toISOString().split("T")[0],
    liters: "",
    cost: "",
    odometer: "",
  });

  const handleSave = () => {
    // Validate inputs
    if (!filling.liters || !filling.cost || !filling.odometer) {
      alert(t("common.error.required"));
      return;
    }

    // Here you would save the filling to storage
    // For now, just go back
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>{t("fillings.add")}</Title>
      <TextInput
        label={t("fillings.date")}
        value={filling.date}
        onChangeText={(text) => setFilling({ ...filling, date: text })}
        style={styles.input}
      />
      <TextInput
        label={t("fillings.liters")}
        value={filling.liters}
        onChangeText={(text) => setFilling({ ...filling, liters: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label={t("fillings.cost")}
        value={filling.cost}
        onChangeText={(text) => setFilling({ ...filling, cost: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label={t("fillings.odometer")}
        value={filling.odometer}
        onChangeText={(text) => setFilling({ ...filling, odometer: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSave}>
        {t("common.save")}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
});
