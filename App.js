import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import * as Linking from "expo-linking";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
// Import the auth object
import { auth } from "./utils/firebase";
import { getSavedLanguage } from "./utils/i18n";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, ActivityIndicator, View } from "react-native";

// Import your screens
import WelcomeScreen from "./screens/navigation/welcomeScreen";
import SignUpScreen from "./screens/navigation/signUpScreen";
import ForgotPasswordScreen from "./screens/navigation/forgotPasswordScreen";
// import EmailVerificationScreen from "./screens/navigation/emailVerificationScreen"; // Commented out - no longer using email verification
import MainAppNavigator from "./screens/navigation/mainAppNavigator";

const Stack = createNativeStackNavigator();

const prefix = Linking.createURL('/');
const linking = {
  prefixes: [
    'com.enejlicina.drivetrackpro://',
    'https://verify.enejlicina.com'
  ],
  config: {
    screens: {
      Verify: 'verify-email',
    },
  },
};

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [languageReady, setLanguageReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize language system first
        await getSavedLanguage();
        
        setLanguageReady(true);
      } catch (error) {
        console.error("Error initializing language:", error);
        setLanguageReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing && languageReady) {
        setInitializing(false);
      }
      console.log("Auth state changed:", user ? user.uid : "No User");
    });

    return unsubscribe;
  }, [languageReady]);

  // Show a spinner until both auth and language are ready
  if (initializing || !languageReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the correct navigator based on the user state.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <StatusBar style="auto" />
        <NavigationContainer linking={linking}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {user ? (
                <Stack.Screen name="MainApp" component={MainAppNavigator} />
              ) : (
                <>
                  <Stack.Screen name="Welcome" component={WelcomeScreen} />
                  <Stack.Screen name="SignUp" component={SignUpScreen} />
                  <Stack.Screen 
                    name="ForgotPassword" 
                    component={ForgotPasswordScreen}
                    options={{
                      headerShown: true,
                      title: t("auth.forgotPassword"),
                      headerStyle: {
                        backgroundColor: "#000000",
                      },
                      headerTintColor: "#fff",
                      headerTitleStyle: {
                        color: "#fff",
                      },
                    }}
                  />
                </>
              )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
