import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Surface, Avatar } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { signOut, getCurrentUser } from "../../utils/auth";
import { useNavigation } from "@react-navigation/native";

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const currentUser = getCurrentUser();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Surface style={styles.headerCard}>
          <Avatar.Icon
            size={80}
            icon="account"
            style={styles.avatar}
            color="#fff"
          />
          <Text style={styles.greeting}>
            {t("auth.greeting", {
              email: currentUser?.email || t("auth.anonymous"),
            })}
          </Text>
        </Surface>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleSignOut}
          style={styles.signOutButton}
          labelStyle={styles.buttonLabel}
        >
          {t("auth.signOut")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    padding: 24,
    margin: 16,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  avatar: {
    backgroundColor: "#000",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 8,
  },
  bottomContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  signOutButton: {
    backgroundColor: "#f44336",
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
});
