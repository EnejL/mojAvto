import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Surface, Avatar, List, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { signOut, getCurrentUser } from "../../utils/auth";
import { useNavigation } from "@react-navigation/native";

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const currentUser = getCurrentUser();
  
  console.log('Current user data:', {
    displayName: currentUser?.displayName,
    photoURL: currentUser?.photoURL,
  });

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
          {currentUser?.photoURL ? (
            <Avatar.Image
              size={80}
              source={{ uri: currentUser.photoURL }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={80}
              icon="account"
              style={styles.avatar}
              color="#fff"
            />
          )}
          <Text style={styles.greeting}>
            {currentUser?.isAnonymous 
              ? t("auth.greetingAnonymous")
              : t("auth.greeting", {
                  name: currentUser?.displayName || currentUser?.email,
                })
            }
          </Text>
        </Surface>

        <Surface style={styles.section}>
          <List.Item
            title={t("common.privacyPolicy")}
            left={props => <List.Icon {...props} icon="shield-account" />}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />
          <Divider />
          <List.Item
            title={t("common.terms")}
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => navigation.navigate("TermsOfUse")}
          />
          <Divider />
          <List.Item
            title={t("common.faq")}
            left={props => <List.Icon {...props} icon="frequently-asked-questions" />}
            onPress={() => navigation.navigate("FrequentlyAskedQuestions")}
          />
          <Divider />
          <List.Item
            title={t("common.version")}
            description="1.3.1"
            left={props => <List.Icon {...props} icon="information" />}
          />
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
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  avatar: {
    backgroundColor: "#000",
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    textAlign: "center",
  },
  section: {
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  signOutButton: {
    backgroundColor: "#f44336",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
