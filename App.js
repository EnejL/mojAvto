// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider } from "react-native-paper";
import "react-native-gesture-handler";
import "./utils/i18n";
import { useTranslation } from "react-i18next";
import { StatusBar } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./utils/firebase";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import WelcomeScreen from "./screens/navigation/welcomeScreen";
import SignUpScreen from "./screens/navigation/signUpScreen";
import ForgotPasswordScreen from "./screens/navigation/forgotPasswordScreen";

import MainAppNavigator from "./screens/navigation/mainAppNavigator";
import PetrolStationDetailsScreen from "./screens/functionality/petrolStationDetailsScreen";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <NavigationContainer>
          <Stack.Navigator>
            {user ? (
              <Stack.Screen
                name="MainApp"
                component={MainAppNavigator}
                options={{ headerShown: false }}
              />
            ) : (
              <>
                <Stack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{
                    headerShown: false
                  }}
                />
                <Stack.Screen
                  name="SignUp"
                  component={SignUpScreen}
                  options={{
                    title: t("auth.createAccount"),
                    headerStyle: {
                      backgroundColor: "#000000",
                    },
                    headerTintColor: "#fff",
                    headerBackTitle: t("navigation.back"),
                  }}
                  listeners={({ navigation }) => ({
                    beforeRemove: (e) => {
                      if (e.data.action.type === "GO_BACK") {
                        e.preventDefault();
                        navigation.navigate("Welcome");
                      }
                    },
                  })}
                />
                <Stack.Screen
                  name="ForgotPassword"
                  component={ForgotPasswordScreen}
                  options={{
                    title: t("auth.forgotPassword"),
                    headerStyle: {
                      backgroundColor: "#000000",
                    },
                    headerTintColor: "#fff",
                    headerBackTitle: t("navigation.back"),
                  }}
                />
              </>
            )}
            <Stack.Screen
              name="PetrolStationDetails"
              component={PetrolStationDetailsScreen}
              options={({ route }) => ({
                title: route.params.station.name,
                headerBackTitle: t("navigation.back"),
                headerStyle: {
                  backgroundColor: "#000000",
                },
                headerTintColor: "#fff",
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
