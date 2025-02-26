import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getCurrentUser, createAccount, signIn, logOut } from "../utils/auth";

export default function AuthScreen({ navigation }) {
  const { t } = useTranslation();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSignIn, setIsSignIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setIsAnonymous(currentUser?.isAnonymous || false);
    setUser(currentUser);
  }, []);

  const handleCreateAccount = async () => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await createAccount(email, password);
      setUser(newUser);
      setEmail("");
      setPassword("");
      navigation.navigate("Home");
    } catch (error) {
      if (error.message && error.message.startsWith("auth/")) {
        setError(t(`auth.error.${error.message.replace("auth/", "")}`));
      } else {
        setError(t("auth.error.unknown-error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const signedInUser = await signIn(email, password);
      setUser(signedInUser);
      setEmail("");
      setPassword("");
      navigation.navigate("Home");
    } catch (error) {
      if (error.message && error.message.startsWith("auth/")) {
        setError(t(`auth.error.${error.message.replace("auth/", "")}`));
      } else {
        setError(t("auth.error.unknown-error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    setLoading(true);
    try {
      const anonymousUser = await logOut();
      setUser(anonymousUser);
      setIsAnonymous(true);
      navigation.navigate("Home");
    } catch (error) {
      setError(t("auth.error.signOut"));
    } finally {
      setLoading(false);
    }
  };

  const renderAuthForm = () => {
    if (user && !user.isAnonymous) {
      return (
        <Surface style={styles.formCard}>
          <Text style={styles.successText}>
            {t("auth.signedInAs", { email: user.email })}
          </Text>
          <Button
            mode="outlined"
            onPress={handleLogOut}
            loading={loading}
            style={styles.logoutButton}
          >
            {t("auth.signOut")}
          </Button>
        </Surface>
      );
    }

    return (
      <Surface style={styles.formCard}>
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
          secureTextEntry
          style={styles.input}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={isSignIn ? handleSignIn : handleCreateAccount}
            loading={loading}
            style={styles.button}
          >
            {t(isSignIn ? "auth.signIn" : "auth.createAccount")}
          </Button>
          <Button
            mode="text"
            onPress={() => setIsSignIn(!isSignIn)}
            style={styles.switchButton}
          >
            {t(isSignIn ? "auth.needAccount" : "auth.haveAccount")}
          </Button>
        </View>
      </Surface>
    );
  };

  return (
    <View style={styles.container}>
      {isAnonymous && user?.isAnonymous ? (
        <Surface style={styles.infoCard}>
          <Text style={styles.infoText}>{t("auth.anonymousInfo")}</Text>
        </Surface>
      ) : null}

      {renderAuthForm()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  formCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 8,
  },
  button: {
    marginVertical: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
  switchButton: {
    marginTop: 8,
  },
  successText: {
    fontSize: 16,
    color: "#4CAF50",
    textAlign: "center",
    padding: 16,
  },
  logoutButton: {
    marginTop: 16,
  },
});
