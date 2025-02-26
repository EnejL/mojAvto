// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import { useTranslation } from "react-i18next";
import "./utils/i18n";
import { StatusBar } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";

// Auth screens
import WelcomeScreen from "./screens/navigation/welcomeScreen";
import LoginScreen from "./screens/navigation/loginScreen";
import SignUpScreen from "./screens/navigation/signUpScreen";

// Main app
import MainAppNavigator from "./screens/navigation/mainAppNavigator";

const Stack = createNativeStackNavigator();

export default function App() {
  const { t } = useTranslation();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) {
    return null; // Or a loading screen
  }

  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="MainApp" component={MainAppNavigator} />
          ) : (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
