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

// Auth screens
import WelcomeScreen from "./screens/navigation/welcomeScreen";
import LoginScreen from "./screens/navigation/loginScreen";
import SignUpScreen from "./screens/navigation/signUpScreen";
import MyAccountScreen from "./screens/functionality/myAccountScreen";

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
                    title: "",
                    headerStyle: {
                      backgroundColor: "#000000",
                    },
                    headerTintColor: "#fff",
                  }}
                />
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    title: t("auth.signIn"),
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
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
