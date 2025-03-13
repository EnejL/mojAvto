import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { TextInput, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";
import BrandLogo from "../../components/BrandLogo";

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        t("auth.error"),
        t("auth.emailRequired"),
        [{ text: t("common.ok") }],
        { cancelable: true }
      );
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        t("auth.resetEmailSent"),
        t("auth.resetEmailInstructions"),
        [
          {
            text: t("common.ok"),
            onPress: () => navigation.navigate("Login"),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      let errorMessage = t("auth.resetError");
      if (error.code === "auth/user-not-found") {
        errorMessage = t("auth.userNotFound");
      } else if (error.code === "auth/invalid-email") {
        errorMessage = t("auth.invalidEmail");
      }
      Alert.alert(t("auth.error"), errorMessage, [{ text: t("common.ok") }], {
        cancelable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t("auth.forgotPassword")}</Text>
        <Text style={styles.subtitle}>
          {t("auth.forgotPasswordInstructions")}
        </Text>

        <View style={styles.formContainer}>
          <TextInput
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            outlineColor="#ccc"
            activeOutlineColor="#000"
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            {t("common.submit")}
          </Button>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate("Login")}
          ></TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: "#000",
  },
  linkContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#000",
    fontSize: 16,
  },
});

export default ForgotPasswordScreen;
