import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  SafeAreaView,
  Platform,
} from "react-native";
import { TextInput, Button, Text, Surface, Title } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        t("common.error.required"),
        t("auth.enterEmailFirst"),
        [{ text: t("common.ok") }],
        { cancelable: true }
      );
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        t("auth.resetEmailSent"),
        t("auth.checkEmail"),
        [
          {
            text: t("common.ok"),
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      let errorMessage = t("auth.resetError");
      if (error.code === "auth/user-not-found") {
        errorMessage = t("auth.error.userNotFound");
      } else if (error.code === "auth/invalid-email") {
        errorMessage = t("auth.error.invalidEmail");
      }
      Alert.alert(t("auth.error.unknownError"), errorMessage, [{ text: t("common.ok") }], {
        cancelable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Title style={styles.title}>{t("auth.forgotPassword")}</Title>

          <Surface style={styles.formCard}>
            <Text style={styles.instructions}>
              {t("auth.forgotPasswordInstructions")}
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                label={t("auth.email")}
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                disabled={loading}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleResetPassword}
              style={styles.button}
              loading={loading}
              disabled={loading || !email.trim()}
            >
              {t("common.submit")}
            </Button>
          </Surface>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    justifyContent: "center",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  formCard: {
    padding: 24,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#fff",
  },
  instructions: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
});

export default ForgotPasswordScreen;
