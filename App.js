import "react-native-gesture-handler";
import React, { useEffect, useMemo, useState } from "react";
import * as Linking from "expo-linking";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, MD3LightTheme, configureFonts } from "react-native-paper";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
// Import the auth object
import { auth } from "./utils/firebase";
import { getSavedLanguage } from "./utils/i18n";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, ActivityIndicator, View } from "react-native";
// Import Analytics and Crashlytics utilities
import { setAnalyticsUserId, setAnalyticsUserProperties, logScreenView } from "./utils/analytics";
import { initializeCrashlytics, logCrashlytics } from "./utils/crashlytics";

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
  const navigationRef = useNavigationContainerRef();
  const [fontsLoaded, fontError] = useFonts({
    InterRegular: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    InterBold: Inter_700Bold,
  });

  useEffect(() => {
    if (fontError) {
      console.error("Error loading custom fonts:", fontError);
      logCrashlytics(`Font loading failed: ${fontError.message}`);
    }
  }, [fontError]);

  const paperTheme = useMemo(() => {
    if (!fontsLoaded) {
      return MD3LightTheme;
    }

    const fontConfig = {
      displayLarge: { fontFamily: "InterBold", fontWeight: "700" },
      displayMedium: { fontFamily: "InterSemiBold", fontWeight: "600" },
      displaySmall: { fontFamily: "InterSemiBold", fontWeight: "600" },
      headlineLarge: { fontFamily: "InterBold", fontWeight: "700" },
      headlineMedium: { fontFamily: "InterSemiBold", fontWeight: "600" },
      headlineSmall: { fontFamily: "InterSemiBold", fontWeight: "600" },
      titleLarge: { fontFamily: "InterSemiBold", fontWeight: "600" },
      titleMedium: { fontFamily: "InterMedium", fontWeight: "500" },
      titleSmall: { fontFamily: "InterMedium", fontWeight: "500" },
      labelLarge: { fontFamily: "InterMedium", fontWeight: "500" },
      labelMedium: { fontFamily: "InterMedium", fontWeight: "500" },
      labelSmall: { fontFamily: "InterRegular", fontWeight: "400" },
      bodyLarge: { fontFamily: "InterRegular", fontWeight: "400" },
      bodyMedium: { fontFamily: "InterRegular", fontWeight: "400" },
      bodySmall: { fontFamily: "InterRegular", fontWeight: "400" },
    };

    return {
      ...MD3LightTheme,
      fonts: configureFonts({ config: fontConfig }),
    };
  }, [fontsLoaded]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Crashlytics early
        logCrashlytics('App initializing');
        
        // Initialize language system
        await getSavedLanguage();
        
        setLanguageReady(true);
        logCrashlytics('App initialized successfully');
      } catch (error) {
        console.error("Error initializing app:", error);
        // Record error to Crashlytics
        const { recordError } = await import('./utils/crashlytics');
        recordError(error, { context: 'app_initialization' });
        setLanguageReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // Initialize Analytics and Crashlytics with user info
      if (user) {
        try {
          // Set user ID for Analytics
          await setAnalyticsUserId(user.uid);
          
          // Set user properties for Analytics
          await setAnalyticsUserProperties({
            user_id: user.uid,
            email_verified: user.emailVerified,
          });
          
          // Initialize Crashlytics with user info
          initializeCrashlytics({
            userId: user.uid,
            email: user.email || undefined,
            displayName: user.displayName || undefined,
          });
          
          logCrashlytics(`User signed in: ${user.uid}`);
        } catch (error) {
          console.error("Error setting up user tracking:", error);
        }
      } else {
        // User signed out - clear user identifiers
        try {
          await setAnalyticsUserId(null);
          logCrashlytics('User signed out');
        } catch (error) {
          console.error("Error clearing user tracking:", error);
        }
      }
      
      if (initializing && languageReady) {
        setInitializing(false);
      }
      console.log("Auth state changed:", user ? user.uid : "No User");
    });

    return unsubscribe;
  }, [languageReady]);

  // Show a spinner until both auth and language are ready
  if (initializing || !languageReady || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Handle navigation state changes for screen tracking
  const handleNavigationStateChange = () => {
    const currentRoute = navigationRef.getCurrentRoute();
    if (currentRoute) {
      const routeName = currentRoute.name;
      logScreenView(routeName);
      logCrashlytics(`Screen viewed: ${routeName}`);
    }
  };

  // Render the correct navigator based on the user state.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style="auto" />
        <NavigationContainer 
          ref={navigationRef}
          linking={linking}
          onReady={handleNavigationStateChange}
          onStateChange={handleNavigationStateChange}
        >
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
