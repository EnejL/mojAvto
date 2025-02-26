import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { signIn } from "../../utils/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError(t("common.error.required"));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      console.log("Attempting to sign in with:", email);
      await signIn(email, password);
      console.log("Sign in successful");

      // Just clear the form fields
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Sign in error:", error);
      if (error.message && error.message.includes("auth/")) {
        const errorCode = error.message.replace("auth/", "");
        console.log("Error code:", errorCode);
        setError(t(`auth.error.${errorCode}`));
      } else {
        setError(t("auth.error.unknown-error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      Alert.alert(t("auth.forgotPassword"), t("auth.enterEmailFirst"), [
        { text: t("common.ok") },
      ]);
      return;
    }

    setLoading(true);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(t("auth.resetEmailSent"), t("auth.checkEmail"), [
          { text: t("common.ok") },
        ]);
      })
      .catch((error) => {
        console.error("Error sending password reset email:", error);
        Alert.alert(t("auth.resetError"), t("auth.error.unknown-error"), [
          { text: t("common.ok") },
        ]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.formCard}>
        <Text style={styles.title}>{t("auth.signIn")}</Text>

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

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>
            {t("auth.forgotPassword")}
          </Text>
        </TouchableOpacity>

        <Button
          mode="contained"
          onPress={handleSignIn}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          {t("auth.signIn")}
        </Button>

        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>{t("auth.needAccount")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.switchLink}>{t("auth.createAccount")}</Text>
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: "#2196F3",
    fontSize: 14,
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
