import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import {
  Text,
  Surface,
  Avatar,
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function MyAccountScreen() {
  // Fixed scrolling issues
  const { t } = useTranslation();
  const navigation = useNavigation();
  const currentUser = getCurrentUser();
  const [isDeleting, setIsDeleting] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingField, setSavingField] = useState(null);
  const [settings, setSettings] = useState(defaultUserProfile);
  const [measurementExpanded, setMeasurementExpanded] = useState(false);
  const [currencyExpanded, setCurrencyExpanded] = useState(false);
  const [languageExpanded, setLanguageExpanded] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const deleteButtonAnim = useRef(new Animated.Value(200)).current; // Start translated down (hidden off-screen)

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
      setLanguageExpanded(false);
    } catch (error) {
      // Error handled silently - language change may still work
    }
  };

  const getEffectiveDistanceUnit = () =>
    settings.distanceUnit || (settings.unitSystem === "imperial" ? "mi" : "km");

  const getEffectiveVolumeUnit = () =>
    settings.volumeUnit || (settings.unitSystem === "imperial" ? "gal" : "L");

  const getEffectiveConsumptionUnit = () =>
    settings.consumptionUnit ||
    (settings.unitSystem === "imperial" ? "mpg" : "l_per_100km");

  const getEffectiveElectricConsumptionUnit = () =>
    settings.electricConsumptionUnit ||
    (settings.unitSystem === "imperial" ? "kwh_per_100mi" : "kwh_per_100km");

  const getMeasurementSummary = () => {
    const distance = getEffectiveDistanceUnit();
    const volume = getEffectiveVolumeUnit();
    const fuelConsumption = getEffectiveConsumptionUnit();
    const electricConsumption = getEffectiveElectricConsumptionUnit();

    const distanceLabel =
      distance === "mi" ? t("settings.unitMilesShort") : t("settings.unitKilometresShort");
    const volumeLabel =
      volume === "gal" ? t("settings.unitGallonsShort") : t("settings.unitLitresShort");
    const fuelLabel =
      fuelConsumption === "mpg"
        ? t("settings.unitMpg")
        : fuelConsumption === "km_per_l"
          ? t("settings.unitKmPerL")
          : t("settings.unitLPer100Km");

    const electricLabel =
      electricConsumption === "kwh_per_100mi"
        ? t("settings.unitKwhPer100Mi")
        : electricConsumption === "mi_per_kwh"
          ? t("settings.unitMiPerKwh")
          : electricConsumption === "km_per_kwh"
            ? t("settings.unitKmPerKwh")
            : t("settings.unitKwhPer100Km");

    return `${distanceLabel} • ${volumeLabel} • ${fuelLabel} • ${electricLabel}`;
  };

  const persistMeasurementSettings = async (partial) => {
    const prev = {
      distanceUnit: getEffectiveDistanceUnit(),
      volumeUnit: getEffectiveVolumeUnit(),
      consumptionUnit: getEffectiveConsumptionUnit(),
      electricConsumptionUnit: getEffectiveElectricConsumptionUnit(),
    };

    let next = { ...prev, ...(partial || {}) };

    // Keep the legacy `unitSystem` field in sync with distance only.
    // Unlike before, changing one measurement does NOT auto-change the others.
    const unitSystem = next.distanceUnit === "mi" ? "imperial" : "metric";

    // Optimistic UI update
    setSettings((prevSettings) => ({
      ...prevSettings,
      ...next,
      unitSystem,
    }));

    if (!currentUser || currentUser.isAnonymous) {
      return;
    }

    try {
      setSavingField("unitSystem");
      const merged = await updateUserProfile(
        {
          ...next,
          unitSystem,
        },
        settings
      );
      setSettings(merged);
      setMeasurementExpanded(false);
    } catch (error) {
      setSettings((prevState) => ({ ...defaultUserProfile, ...prevState }));
    } finally {
      setSavingField(null);
    }
  };

  const handleCurrencyChange = async (currency) => {
    await persistSetting("currency", currency);
    setCurrencyExpanded(false);
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

  const getCurrencyLabel = () => {
    if (settings.currency === "USD") return "USD ($)";
    if (settings.currency === "EUR") return "EUR (€)";
    if (settings.currency === "GBP") return "GBP (£)";
    return settings.currency || "USD ($)";
  };

  const getCurrencyFullName = (code) => {
    if (code === "USD") return "United States Dollar (USD)";
    if (code === "EUR") return "Euro (EUR)";
    if (code === "GBP") return "British Pound (GBP)";
    return code;
  };

  const getLanguageLabel = () => {
    if (settings.language === "en") return "English";
    if (settings.language === "sl") return "Slovenščina";
    return "English";
  };

  const getLanguageFullName = (code) => {
    if (code === "en") return "English";
    if (code === "sl") return "Slovenščina";
    return "English";
  };

  const getUserDisplayName = () => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) {
      const emailParts = currentUser.email.split("@");
      return emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1);
    }
    return "User";
  };

  const getUserEmail = () => {
    return currentUser?.email || "user@example.com";
  };

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollPosition = contentOffset.y;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const overscroll = scrollPosition - maxScroll;
    const overscrollThreshold = 80;
    const hideThreshold = 150; // Hide when scrolled back up by 150px from bottom

    if (overscroll > overscrollThreshold && !isDeleteVisible) {
      // Show button when overscrolling past threshold
      setIsDeleteVisible(true);
      Animated.timing(deleteButtonAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else if (isDeleteVisible && scrollPosition < maxScroll - hideThreshold) {
      // Once visible, only hide if user scrolls significantly away from bottom
      setIsDeleteVisible(false);
      Animated.timing(deleteButtonAnim, {
        toValue: 200,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
    // If button is visible and user is still near bottom, keep it visible
  };

  const renderProfileHeader = () => (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        {currentUser?.photoURL ? (
          <Avatar.Image size={100} source={{ uri: currentUser.photoURL }} style={styles.avatar} />
        ) : (
          <Avatar.Icon size={100} icon="account" style={styles.avatar} color="#fff" />
        )}
      </View>
      <Text style={styles.userName}>{getUserDisplayName()}</Text>
      <Text style={styles.userEmail}>{getUserEmail()}</Text>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("common.preferences")}</Text>

      {/* Measurement Units */}
      <Surface style={styles.preferenceCard}>
        <TouchableOpacity
          style={styles.preferenceRow}
          onPress={() => setMeasurementExpanded(!measurementExpanded)}
          disabled={settingsLoading || savingField === "unitSystem"}
        >
          <View style={styles.preferenceRowLeft}>
            <View style={[styles.iconCircle, styles.measurementIcon]}>
              <MaterialCommunityIcons name="ruler" size={20} color="#fff" />
            </View>
            <View style={styles.preferenceRowText}>
              <Text style={styles.preferenceTitle}>{t("settings.unitSystem")}</Text>
              <Text style={styles.preferenceSubtitle}>
                {settingsLoading ? t("common.loading") : getMeasurementSummary()}
              </Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name={measurementExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {measurementExpanded && !settingsLoading && (
          <View style={styles.expandedContent}>
            <Text style={styles.measurementSubsectionTitle}>{t("settings.distance")}</Text>
            {["km", "mi"].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={styles.radioOption}
                onPress={() => persistMeasurementSettings({ distanceUnit: unit })}
                disabled={savingField === "unitSystem"}
              >
                <View style={styles.radioButton}>
                  {getEffectiveDistanceUnit() === unit && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioOptionText}>
                  {unit === "km" ? t("settings.unitKilometres") : t("settings.unitMiles")}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.measurementDivider} />

            <Text style={styles.measurementSubsectionTitle}>{t("settings.volume")}</Text>
            {["L", "gal"].map((unit) => (
              <TouchableOpacity
                key={unit}
                style={styles.radioOption}
                onPress={() => persistMeasurementSettings({ volumeUnit: unit })}
                disabled={savingField === "unitSystem"}
              >
                <View style={styles.radioButton}>
                  {getEffectiveVolumeUnit() === unit && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioOptionText}>
                  {unit === "L" ? t("settings.unitLitres") : t("settings.unitGallons")}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={styles.measurementDivider} />

            <Text style={styles.measurementSubsectionTitle}>{t("settings.consumption")}</Text>
            <Text style={styles.measurementGroupTitle}>{t("vehicles.fuelConsumption")}</Text>
            {[
              { value: "l_per_100km", label: t("settings.unitLPer100Km") },
              { value: "mpg", label: t("settings.unitMpg") },
              { value: "km_per_l", label: t("settings.unitKmPerL") },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.radioOption}
                onPress={() => persistMeasurementSettings({ consumptionUnit: opt.value })}
                disabled={savingField === "unitSystem"}
              >
                <View style={styles.radioButton}>
                  {getEffectiveConsumptionUnit() === opt.value && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.measurementDivider} />

            <Text style={styles.measurementGroupTitle}>{t("vehicles.electricConsumption")}</Text>
            {[
              { value: "kwh_per_100km", label: t("settings.unitKwhPer100Km") },
              { value: "kwh_per_100mi", label: t("settings.unitKwhPer100Mi") },
              { value: "km_per_kwh", label: t("settings.unitKmPerKwh") },
              { value: "mi_per_kwh", label: t("settings.unitMiPerKwh") },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.radioOption}
                onPress={() => persistMeasurementSettings({ electricConsumptionUnit: opt.value })}
                disabled={savingField === "unitSystem"}
              >
                <View style={styles.radioButton}>
                  {getEffectiveElectricConsumptionUnit() === opt.value && (
                    <View style={styles.radioButtonSelected} />
                  )}
                </View>
                <Text style={styles.radioOptionText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Surface>

      {/* Currency */}
      <Surface style={styles.preferenceCard}>
        <TouchableOpacity
          style={styles.preferenceRow}
          onPress={() => setCurrencyExpanded(!currencyExpanded)}
          disabled={settingsLoading || savingField === "currency"}
        >
          <View style={styles.preferenceRowLeft}>
            <View style={[styles.iconCircle, styles.currencyIcon]}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#fff" />
            </View>
            <View style={styles.preferenceRowText}>
              <Text style={styles.preferenceTitle}>{t("settings.currency")}</Text>
              <Text style={styles.preferenceSubtitle}>{getCurrencyLabel()}</Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name={currencyExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {currencyExpanded && (
          <View style={styles.expandedContent}>
            {["USD", "EUR", "GBP"].map((currency) => (
              <TouchableOpacity
                key={currency}
                style={styles.radioOption}
                onPress={() => handleCurrencyChange(currency)}
                disabled={savingField === "currency"}
              >
                <View style={styles.radioButton}>
                  {settings.currency === currency && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioOptionText}>{getCurrencyFullName(currency)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Surface>

      {/* Language */}
      <Surface style={styles.preferenceCard}>
        <TouchableOpacity
          style={styles.preferenceRow}
          onPress={() => setLanguageExpanded(!languageExpanded)}
          disabled={settingsLoading || savingField === "language"}
        >
          <View style={styles.preferenceRowLeft}>
            <View style={[styles.iconCircle, styles.languageIcon]}>
              <MaterialCommunityIcons name="web" size={20} color="#fff" />
            </View>
            <View style={styles.preferenceRowText}>
              <Text style={styles.preferenceTitle}>{t("settings.language")}</Text>
              <Text style={styles.preferenceSubtitle}>{getLanguageLabel()}</Text>
            </View>
          </View>
          <MaterialCommunityIcons
            name={languageExpanded ? "chevron-up" : "chevron-down"}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {languageExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.languageNote}>Changing language requires an app restart.</Text>
            {["en", "sl"].map((language) => (
              <TouchableOpacity
                key={language}
                style={styles.radioOption}
                onPress={() => handleLanguageChange(language)}
                disabled={savingField === "language"}
              >
                <View style={styles.radioButton}>
                  {settings.language === language && <View style={styles.radioButtonSelected} />}
                </View>
                <View style={styles.radioOptionContent}>
                  <Text style={styles.radioOptionFlag}>{language === "en" ? "🇬🇧" : "🇸🇮"}</Text>
                  <Text style={styles.radioOptionText}>{getLanguageFullName(language)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Surface>
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {t("common.support")} &amp; {t("common.legal")}
      </Text>

      <TouchableOpacity
        style={styles.supportCard}
        onPress={() => navigation.navigate("PrivacyPolicy")}
      >
        <View style={styles.preferenceRowLeft}>
          <View style={[styles.iconCircle, styles.privacyIcon]}>
            <MaterialCommunityIcons name="shield-search" size={20} color="#fff" />
          </View>
          <Text style={styles.supportCardTitle}>{t("common.privacyPolicy")}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.supportCard}
        onPress={() => navigation.navigate("TermsOfUse")}
      >
        <View style={styles.preferenceRowLeft}>
          <View style={[styles.iconCircle, styles.termsIcon]}>
            <MaterialCommunityIcons name="file-document" size={20} color="#fff" />
          </View>
          <Text style={styles.supportCardTitle}>{t("common.terms")}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.supportCard}
        onPress={() => navigation.navigate("FrequentlyAskedQuestions")}
      >
        <View style={styles.preferenceRowLeft}>
          <View style={[styles.iconCircle, styles.faqIcon]}>
            <MaterialCommunityIcons name="help-circle" size={20} color="#fff" />
          </View>
          <Text style={styles.supportCardTitle}>{t("common.faq")}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => (
    <>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" />
        <Text style={styles.signOutText}>{t("auth.signOut")}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t("common.version")} 3.0.1</Text>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderProfileHeader()}
        {renderPreferencesSection()}
        {renderSupportSection()}
        {renderFooter()}
      </ScrollView>

      {currentUser && !currentUser.isAnonymous && (
        <Animated.View
          style={[
            styles.deleteButtonContainer,
            { 
              transform: [{ translateY: deleteButtonAnim }],
              opacity: deleteButtonAnim.interpolate({
                inputRange: [0, 200],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
            disabled={isDeleting}
          >
            <MaterialCommunityIcons 
              name="delete-forever" 
              size={20} 
              color="#FF3B30" 
            />
            <Text style={styles.deleteButtonText}>
              {isDeleting ? t("common.loading") : t("auth.deleteAccount")}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: "#1A1A1A",
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#999999",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  preferenceCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  preferenceSubtitle: {
    fontSize: 14,
    color: "#999999",
    marginTop: 2,
  },
  segmentedButtons: {
    backgroundColor: "#2A2A2A",
    borderRadius: 20,
  },
  segmentedButton: {
    minHeight: 40,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  preferenceRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  preferenceRowText: {
    marginLeft: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  currencyIcon: {
    backgroundColor: "#34C759",
  },
  languageIcon: {
    backgroundColor: "#4A9EFF",
  },
  measurementIcon: {
    backgroundColor: "#3A3A3A",
  },
  privacyIcon: {
    backgroundColor: "#5AC8FA",
  },
  termsIcon: {
    backgroundColor: "#AF52DE",
  },
  faqIcon: {
    backgroundColor: "#5E5CE6",
  },
  supportCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  supportCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginLeft: 16,
    flex: 1,
  },
  signOutButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  signOutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF3B30",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 8,
  },
  loadingIndicator: {
    marginVertical: 8,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#2A2A2A",
  },
  measurementSubsectionTitle: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 8,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  measurementGroupTitle: {
    fontSize: 14,
    color: "#CCCCCC",
    marginBottom: 8,
    marginTop: 4,
    fontWeight: "600",
  },
  measurementDivider: {
    height: 1,
    backgroundColor: "#2A2A2A",
    marginVertical: 12,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4A9EFF",
  },
  radioOptionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  radioOptionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  radioOptionText: {
    fontSize: 16,
    color: "#FFFFFF",
    flex: 1,
  },
  languageNote: {
    fontSize: 12,
    color: "#999999",
    marginBottom: 12,
    fontStyle: "italic",
  },
  deleteButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#000000",
    padding: 16,
    paddingBottom: 110,
  },
  deleteButton: {
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FF3B30",
    marginLeft: 8,
  },
});
