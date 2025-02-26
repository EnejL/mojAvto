import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Surface style={styles.headerCard}>
        <Text style={styles.appName}>MojAvto</Text>
        <Text style={styles.tagline}>Fuel Tracking Made Simple</Text>
      </Surface>

      <Text style={styles.welcomeText}>{t("welcome.message")}</Text>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate("Login")}
          style={styles.button}
        >
          {t("auth.signIn")}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate("SignUp")}
          style={styles.button}
        >
          {t("auth.createAccount")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  headerCard: {
    padding: 24,
    marginBottom: 48,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 48,
    color: "#666",
    lineHeight: 24,
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    marginBottom: 16,
    paddingVertical: 8,
  },
});
