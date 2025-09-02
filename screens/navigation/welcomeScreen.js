import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, StatusBar, Platform } from "react-native";
import { Button, Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { signInWithGoogle } from "../../utils/googleSignIn";
import AppleSignIn from "../../components/AppleSignIn";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      console.error("Google Sign-In error:", error);
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
});
