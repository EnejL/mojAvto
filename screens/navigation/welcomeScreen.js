import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, StatusBar, Platform } from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { signInWithGoogle } from "../../utils/googleSignIn";
import AppleSignIn from "../../components/AppleSignIn";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TourModal from "../../components/TourModal";
import { TOUR_STEPS } from "../../utils/tourData";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const insets = useSafeAreaInsets();

  // Set status bar style on screen focus
  useFocusEffect(
    React.useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('#000000');
      }
    }, [])
  );

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("Error", t("auth.error.googleSignInFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require("../../assets/welcomeScreenBg.png")} 
        style={[
          styles.backgroundImage,
          { opacity: imageLoaded ? 1 : 0 }
        ]}
        onLoad={() => setImageLoaded(true)}
        fadeDuration={300}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
      >
        <Surface style={styles.headerCard}>
          <Image
            source={require("../../assets/drivetrack-pro-logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>DriveTrack Pro</Text>
          <Text style={styles.tagline}>{t("auth.welcomeMessage")}</Text>
        </Surface>

        <Surface style={styles.formCard}>
          <Button
            mode="contained"
            onPress={handleGoogleSignIn}
            style={styles.socialButton}
            labelStyle={{color: '#000'}}
            icon={() => (
              <Image
                source={require("../../assets/google-logo.png")}
                style={styles.buttonIcon}
              />
            )}
            loading={loading}
            disabled={loading}
          >
            {t("auth.signInWithGoogle")}
          </Button>

          {Platform.OS === 'ios' && (
            <AppleSignIn />
          )}
        </Surface>
      </KeyboardAwareScrollView>

      {/* Tour Button at Bottom */}
      <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Button
          mode="outlined"
          onPress={() => setShowTour(true)}
          style={styles.tourButton}
          labelStyle={styles.tourButtonLabel}
          icon="rocket-launch"
        >
          Take a Tour
        </Button>
      </View>

      {/* Tour Modal */}
      <TourModal
        visible={showTour}
        onClose={() => setShowTour(false)}
        steps={TOUR_STEPS}
      />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Fallback color that matches the dark background image
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  headerCard: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 48,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  logo: {
    width: 225,
    height: 225,
    marginBottom: 16,
  },
  appName: {
    fontSize: 35,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "#cccccc",
    marginTop: 4,
    textAlign: "center",
  },
  formCard: {
    width: '100%',
    padding: 24,
    borderRadius: 12,
    backgroundColor: "transparent",
    elevation: 8,
  },
  socialButton: {
    backgroundColor: "#ffffff",
    marginBottom: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  buttonIcon: {
    width: 15,
    height: 15,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  tourButton: {
    borderColor: "#ffffff",
    borderWidth: 1.5,
    borderRadius: 12,
    width: "100%",
  },
  tourButtonLabel: {
    color: "#ffffff",
    fontSize: 16,
  },
});
