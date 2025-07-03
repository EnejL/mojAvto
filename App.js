import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
// Import the auth object
import { auth } from "./utils/firebase";
import "./utils/i18n";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar, ActivityIndicator, View } from "react-native";

// Import your screens
import WelcomeScreen from "./screens/navigation/welcomeScreen";
import SignUpScreen from "./screens/navigation/signUpScreen";
import ForgotPasswordScreen from "./screens/navigation/forgotPasswordScreen";
import MainAppNavigator from "./screens/navigation/mainAppNavigator";
import PetrolStationDetailsScreen from "./screens/functionality/petrolStationDetailsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
      console.log("Auth state changed:", user ? user.uid : "No User");
    });

    // 3. Cleanup the listener when the component unmounts
    return unsubscribe;
  }, []); // The empty dependency array ensures this runs only once.

  // While the first onAuthStateChanged check is running, show a spinner.
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Now, render the correct navigator based on the user state.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <StatusBar style="auto" />
        <NavigationContainer>
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
            {/* Common screens can be placed outside the conditional logic if they can be accessed from both states */}
            {/* Example:
            <Stack.Screen name="PetrolStationDetails" component={PetrolStationDetailsScreen} />
            */}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// NOTE: Your previous setup had PetrolStationDetailsScreen inside the authenticated stack.
// If you navigate to it from within MainAppNavigator, that's perfect.
// If it needs to be accessible from anywhere, you might adjust the navigator structure.
// The structure above is a simplified, common pattern.