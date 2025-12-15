import React, { useEffect, useRef, useState } from "react";
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
  ActivityIndicator,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import { signOut, getCurrentUser, deleteAccount } from "../../utils/auth";
import { useNavigation } from "@react-navigation/native";
import i18n, { saveLanguage, getCurrentLanguage } from "../../utils/i18n";
import {
  defaultUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../utils/userProfile";

export default function MyAccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const currentUser = getCurrentUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);
  const [settings, setSettings] = useState(defaultUserProfile);

  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const deleteButtonAnim = useRef(new Animated.Value(100)).current; // Start translated down (hidden)

  useEffect(() => {
    const loadSettings = async () => {
      if (!currentUser || currentUser.isAnonymous) {
        setSettings(defaultUserProfile);
        setSettingsLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        setSettings(profile);

        // Align language with stored preference
        if (profile.language && profile.language !== getCurrentLanguage()) {
          i18n.changeLanguage(profile.language);
          await saveLanguage(profile.language);
        }
      } catch (error) {
        setSettings(defaultUserProfile);
      } finally {
        setSettingsLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

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

  const persistSetting = async (field, value) => {
    // Optimistically update local state to keep UI responsive
    setSettings((prev) => ({ ...prev, [field]: value }));

    // If user is anonymous or missing, skip remote writes
    if (!currentUser || currentUser.isAnonymous) {
      return;
    }

    try {
      setSavingField(field);
      const merged = await updateUserProfile({ [field]: value }, settings);
      setSettings(merged);
    } catch (error) {
      // If save fails, revert to previous state by reloading defaults + last known
      setSettings((prev) => ({ ...defaultUserProfile, ...prev }));
    } finally {
      setSavingField(null);
    }
  };

  const handleLanguageChange = async (languageCode) => {
    try {
      // Change the language immediately
      i18n.changeLanguage(languageCode);
      // Save the language preference to persistent storage
      await saveLanguage(languageCode);
      await persistSetting("language", languageCode);
    } catch (error) {
      // Error handled silently - language change may still work
    }
  };

  const handleUnitChange = async (unitSystem) => {
    await persistSetting("unitSystem", unitSystem);
  };

  const handleCurrencyChange = async (currency) => {
    await persistSetting("currency", currency);
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
          nestedScrollEnabled
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

          <Surface style={[styles.section, styles.accordionSurface]}>
            <List.Accordion
              title={t("settings.preferences")}
              description={t("settings.preferencesDescription")}
              left={(props) => <List.Icon {...props} icon="cog" />}
              expanded={settingsExpanded}
              onPress={() => setSettingsExpanded((prev) => !prev)}
              style={styles.accordionHeader}
            >
              {settingsLoading ? (
                <View style={styles.accordionLoading}>
                  <ActivityIndicator />
                </View>
              ) : (
                <View style={styles.accordionContent}>
                  <List.Subheader>{t("settings.language")}</List.Subheader>
                    <List.Item
                      title={t("settings.languageEn")}
                      right={(props) =>
                        settings.language === "en" ? (
                          <List.Icon {...props} icon="check" color="#4CAF50" />
                        ) : null
                      }
                      onPress={() => handleLanguageChange("en")}
                      disabled={savingField === "language"}
                    />
                    <Divider />
                    <List.Item
                      title={t("settings.languageSl")}
                      right={(props) =>
                        settings.language === "sl" ? (
                          <List.Icon {...props} icon="check" color="#4CAF50" />
                        ) : null
                      }
                      onPress={() => handleLanguageChange("sl")}
                      disabled={savingField === "language"}
                    />

                  <Divider />

                  <List.Subheader>{t("settings.unitSystem")}</List.Subheader>
                    <List.Item
                      title={t("settings.unitMetric")}
                      description="km, L, L/100 km"
                      right={(props) =>
                        settings.unitSystem === "metric" ? (
                          <List.Icon {...props} icon="check" color="#4CAF50" />
                        ) : null
                      }
                      onPress={() => handleUnitChange("metric")}
                      disabled={savingField === "unitSystem"}
                    />
                    <Divider />
                    <List.Item
                      title={t("settings.unitImperial")}
                      description="mi, gal, MPG"
                      right={(props) =>
                        settings.unitSystem === "imperial" ? (
                          <List.Icon {...props} icon="check" color="#4CAF50" />
                        ) : null
                      }
                      onPress={() => handleUnitChange("imperial")}
                      disabled={savingField === "unitSystem"}
                    />

                  <Divider />

                  <List.Subheader>{t("settings.currency")}</List.Subheader>
                    <List.Item
                      title={t("settings.currencyEUR")}
                      right={(props) =>
                        settings.currency === "EUR" ? (
                          <List.Icon {...props} icon="check" color="#4CAF50" />
                        ) : null
                      }
                      onPress={() => handleCurrencyChange("EUR")}
                      disabled={savingField === "currency"}
                    />
                    <Divider />
                    <List.Item
                      title={t("settings.currencyUSD")}
                      right={(props) =>
                        settings.currency === "USD" ? (
                          <List.Icon {...props} icon="check" color="#4CAF50" />
                        ) : null
                      }
                      onPress={() => handleCurrencyChange("USD")}
                      disabled={savingField === "currency"}
                    />
                </View>
              )}
            </List.Accordion>
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
  accordionLoading: {
    paddingVertical: 16,
    alignItems: "center",
  },
  accordionHeader: {
    // backgroundColor: "#f8f9fa",
  },
  accordionContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  accordionSurface: {
    borderRadius: 8,
    overflow: "hidden",
  },
});
