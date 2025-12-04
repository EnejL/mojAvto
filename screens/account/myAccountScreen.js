import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Text,
  Button,
  Surface,
  Avatar,
  List,
  Divider,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { signOut, getCurrentUser, deleteAccount } from "../../utils/auth";
import { useNavigation } from "@react-navigation/native";
import i18n, { saveLanguage, getCurrentLanguage } from "../../utils/i18n";

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const currentUser = getCurrentUser();
  const [isDeleting, setIsDeleting] = useState(false);

  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const deleteButtonAnim = useRef(new Animated.Value(100)).current; // Start translated down (hidden)

  const hideDeleteButton = () => {
    if (isDeleteVisible) {
      setIsDeleteVisible(false);
      Animated.timing(deleteButtonAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      // Error handled silently - navigation will handle auth state
    }
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      // Change the language immediately
      i18n.changeLanguage(languageCode);
      // Save the language preference to persistent storage
      await saveLanguage(languageCode);
    } catch (error) {
      // Error handled silently - language change may still work
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("auth.deleteAccount"),
      t("auth.deleteAccountConfirm") + "\n\n" + t("auth.deleteAccountWarning"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("auth.deleteAccount"),
          style: "destructive",
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(t("auth.deleteAccount"), t("auth.deleteAccountWarning"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("auth.deleteAccount"),
        style: "destructive",
        onPress: performDeleteAccount,
      },
    ]);
  };

  const performDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      Alert.alert(t("common.ok"), t("auth.deleteAccountSuccess"), [
        { text: t("common.ok") },
      ]);
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      Alert.alert(t("common.error.delete"), t("auth.deleteAccountError"), [
        { text: t("common.ok") },
      ]);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const overscroll = contentOffset.y - (contentSize.height - layoutMeasurement.height);
    const overscrollThreshold = 80;

    if (overscroll > overscrollThreshold && !isDeleteVisible) {
      setIsDeleteVisible(true);
      Animated.timing(deleteButtonAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (overscroll < 0 && isDeleteVisible) {
      // Hide if user scrolls back up from the bottom
      setIsDeleteVisible(false);
      Animated.timing(deleteButtonAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };


  return (
    <TouchableWithoutFeedback onPress={hideDeleteButton}>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          bounces={true}
        >
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
                  })}
            </Text>
          </Surface>

          <Surface style={styles.section}>
            <List.Section title={t("settings.language")}>
            <List.Item
                title={t("settings.languageEn")}
                right={(props) =>
                  getCurrentLanguage() === "en" ? (
                    <List.Icon {...props} icon="check" color="#4CAF50" />
                  ) : null
                }
                onPress={() => handleLanguageChange("en")}
              />
              <Divider />
              <List.Item
                title={t("settings.languageSl")}
                right={(props) =>
                  getCurrentLanguage() === "sl" ? (
                    <List.Icon {...props} icon="check" color="#4CAF50" />
                  ) : null
                }
                onPress={() => handleLanguageChange("sl")}
              />
            </List.Section>
          </Surface>

          <Surface style={styles.section}>
            <List.Item
              title={t("common.privacyPolicy")}
              left={(props) => <List.Icon {...props} icon="shield-account" />}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            />
            <Divider />
            <List.Item
              title={t("common.terms")}
              left={(props) => <List.Icon {...props} icon="file-document" />}
              onPress={() => navigation.navigate("TermsOfUse")}
            />
            <Divider />
            <List.Item
              title={t("common.faq")}
              left={(props) => (
                <List.Icon {...props} icon="frequently-asked-questions" />
              )}
              onPress={() => navigation.navigate("FrequentlyAskedQuestions")}
            />
            <Divider />
            <List.Item
              title={t("common.version")}
              description="2.1.0"
              left={(props) => <List.Icon {...props} icon="information" />}
            />
          </Surface>
        </ScrollView>

        {currentUser && !currentUser.isAnonymous && (
          <Animated.View
            style={[
              styles.deleteButtonContainer,
              { transform: [{ translateY: deleteButtonAnim }] },
            ]}
          >
            <Button
              mode="contained"
              onPress={handleDeleteAccount}
              style={styles.deleteButton}
              labelStyle={styles.buttonLabel}
              disabled={isDeleting}
              icon="delete-forever"
            >
              {isDeleting ? t("common.loading") : t("auth.deleteAccount")}
            </Button>
          </Animated.View>
        )}

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
    </TouchableWithoutFeedback>
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
  scrollContent: {
    paddingBottom: 100,
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
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  signOutButton: {
    backgroundColor: "#f44336",
    paddingVertical: 6,
  },
  deleteButton: {
    backgroundColor: "#B00020",
    paddingVertical: 3,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingBottom: 110,
  },
});
