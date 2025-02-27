import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { createAccount } from "../../utils/auth";

export default function SignUpScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleCreateAccount = async () => {
    if (!email || !password || !confirmPassword) {
      setError(t("common.error.required"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.error.passwords-dont-match"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createAccount(email, password);

      // Navigate to the main app
      navigation.reset({
        index: 0,
        routes: [{ name: "MainApp" }],
      });
    } catch (error) {
      if (error.message && error.message.includes("auth/")) {
        const errorCode = error.message.replace("auth/", "");
        setError(t(`auth.error.${errorCode}`));
      } else {
        setError(t("auth.error.unknown-error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.formCard}>
        <Text style={styles.title}>{t("auth.createAccount")}</Text>

        <TextInput
          label={t("auth.email")}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <TextInput
          label={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          style={styles.input}
          right={
            <TextInput.Icon
              icon={passwordVisible ? "eye-off" : "eye"}
              onPress={togglePasswordVisibility}
            />
          }
        />

        <TextInput
          label={t("auth.confirmPassword")}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!passwordVisible}
          style={styles.input}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleCreateAccount}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          {t("auth.createAccount")}
        </Button>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>{t("auth.haveAccount")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.switchLink}>{t("auth.signIn")}</Text>
          </TouchableOpacity>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  formCard: {
    padding: 24,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  switchText: {
    color: "#666",
  },
  switchLink: {
    color: "#2196F3",
    marginLeft: 4,
  },
});
