import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Button, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { isEmailVerified, resendEmailVerification, reloadUser, signOut } from "../../utils/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EmailVerificationScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get the current user's email
    const user = require("../../utils/firebase").auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  const handleCheckVerification = async () => {
    setLoading(true);
    try {
      // Reload user data to get the latest verification status
      await reloadUser();
      
      if (isEmailVerified()) {
        Alert.alert(
          t("auth.verification.success"),
          t("auth.verification.emailVerified"),
          [
            {
              text: t("common.ok"),
              onPress: () => {
                // The auth state change will automatically navigate to the main app
              }
            }
          ]
        );
      } else {
        Alert.alert(
          t("auth.verification.notVerified"),
          t("auth.verification.checkEmail"),
          [{ text: t("common.ok") }]
        );
      }
    } catch (error) {
      Alert.alert(
        t("common.error.load"),
        t("auth.verification.checkError"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await resendEmailVerification();
      Alert.alert(
        t("auth.verification.emailSent"),
        t("auth.verification.checkEmail"),
        [{ text: t("common.ok") }]
      );
    } catch (error) {
      Alert.alert(
        t("auth.verification.resendError"),
        t("auth.verification.tryAgain"),
        [{ text: t("common.ok") }]
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // The auth state change will automatically navigate to the welcome screen
    } catch (error) {
      // Error handled silently - navigation will handle auth state
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="email-check" 
            size={80} 
            color="#2196F3" 
          />
        </View>

        <Text style={styles.title}>{t("auth.verification.title")}</Text>
        
        <Text style={styles.description}>
          {t("auth.verification.description", { email })}
        </Text>

        <Text style={styles.instructions}>
          {t("auth.verification.instructions")}
        </Text>

        <Button
          mode="contained"
          onPress={handleCheckVerification}
          loading={loading}
          style={styles.button}
          disabled={loading}
        >
          {t("auth.verification.checkVerification")}
        </Button>

        <Button
          mode="outlined"
          onPress={handleResendEmail}
          loading={resendLoading}
          style={styles.button}
          disabled={resendLoading}
        >
          {t("auth.verification.resendEmail")}
        </Button>

        <Button
          mode="text"
          onPress={handleSignOut}
          style={styles.signOutButton}
        >
          {t("auth.verification.signOut")}
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  card: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: "#666",
    lineHeight: 24,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    color: "#888",
    lineHeight: 20,
  },
  button: {
    marginBottom: 12,
    width: "100%",
  },
  signOutButton: {
    marginTop: 8,
  },
}); 