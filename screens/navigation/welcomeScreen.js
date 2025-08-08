import React, { useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Image, StatusBar, InputAccessoryView, Platform, Keyboard, ScrollView } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { signIn } from "../../utils/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { signInWithGoogle } from "../../utils/googleSignIn";
import AppleSignIn from "../../components/AppleSignIn";

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const emailAccessoryID = 'emailInputAccessory';
  const passwordAccessoryID = 'passwordInputAccessory';

  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      StatusBar.setBackgroundColor('#1a1a2e');
    }, [])
  );

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

      // Map Firebase error codes to our translation keys
      if (error.message && error.message.includes("auth/")) {
        const errorCode = error.message.replace("auth/", "");

        // Map Firebase error codes to our new camelCase keys
        const errorMap = {
          "invalid-email": "invalidEmailFormat",
          "user-not-found": "userNotFound",
          "wrong-password": "invalidCredentials",
          "user-disabled": "userDisabled",
          "too-many-requests": "tooManyAttempts",
          "email-already-in-use": "auth.error.emailTaken",
          "weak-password": "weakPassword",
        };

        // Use the mapped key or fallback to unknownError
        const translationKey = errorMap[errorCode] || "unknownError";
        setError(t(`auth.error.${translationKey}`));
      } else {
        setError(t("auth.error.unknownError"));
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google Sign-In error:", error);
      setError(t("auth.error.googleSignInFailed"));
    } finally {
      setLoading(false);
    }
  };

  const renderInputAccessoryView = (id) => {
    if (Platform.OS !== 'ios') return null;
    
    return (
      <InputAccessoryView nativeID={id}>
        <View style={styles.inputAccessoryView}>
          <Button
            mode="text"
            onPress={() => Keyboard.dismiss()}
            style={styles.doneButton}
          >
            {t("common.done")}
          </Button>
        </View>
      </InputAccessoryView>
    );
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.centerContainer}>
        <Surface style={styles.headerCard}>
          <Text style={styles.appName}>Na Poti</Text>
        </Surface>

        <Text style={styles.welcomeText}>{t("auth.welcomeMessage")}</Text>

        <Surface style={styles.formCard}>
          {/* Email/Password fields commented out - using only Google/Apple Sign-In
          <TextInput
            ref={emailInputRef}
            label={t("auth.email")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            inputAccessoryViewID={emailAccessoryID}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />

          <TextInput
            ref={passwordInputRef}
            label={t("auth.password")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            inputAccessoryViewID={passwordAccessoryID}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye-off" : "eye"}
                onPress={togglePasswordVisibility}
              />
            }
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate("ForgotPassword")}
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

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t("auth.or")}</Text>
            <View style={styles.divider} />
          </View>
          */}

          <Button
            mode="outlined"
            onPress={handleGoogleSignIn}
            style={styles.googleButton}
            icon={() => (
              <Image
                source={require("../../assets/google-logo.png")}
                style={styles.googleIcon}
              />
            )}
            loading={loading}
          >
            {t("auth.signInWithGoogle")}
          </Button>

          {Platform.OS === 'ios' && (
            <View style={styles.appleSignInContainer}>
              <AppleSignIn />
            </View>
          )}

          {/* <View style={styles.switchContainer}>
            <Text style={styles.switchText}>{t("auth.needAccount")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.switchLink}>{t("auth.createAccount")}</Text>
            </TouchableOpacity>
          </View> */}
        </Surface>
      </View>

      {/* {renderInputAccessoryView(emailAccessoryID)} // Commented out - no longer using email auth
      {renderInputAccessoryView(passwordAccessoryID)} // Commented out - no longer using email auth */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#1a1a2e", // Modern dark blue background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerCard: {
    padding: 24,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent white
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  appName: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff", // White text for dark background
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#cccccc", // Light gray text
    fontStyle: "italic",
  },
  welcomeText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#cccccc", // Light gray text
    lineHeight: 24,
  },
  formCard: {
    padding: 24,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Almost white with slight transparency
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
  },
  googleButton: {
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderColor: "#4285F4",
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  inputAccessoryView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 8,
  },
  doneButton: {
    marginRight: 8,
  },
  appleSignInContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});
