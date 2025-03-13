import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import screens
import MyVehiclesScreen from "../functionality/myVehiclesScreen";
import PetrolStationsScreen from "../functionality/petrolStationsScreen";
import SettingsScreen from "../functionality/settingsScreen";
import VehicleDetailsScreen from "../functionality/vehicleDetailsScreen";
import AddVehicleScreen from "../functionality/addVehicleScreen";
import EditVehicleScreen from "../functionality/editVehicleScreen";
import AuthScreen from "../navigation/authScreen";
import MyAccountScreen from "../functionality/myAccountScreen";
import AddFillingScreen from "../functionality/addFillingScreen";
import EditFillingScreen from "../functionality/editFillingScreen";
import ForgotPasswordScreen from "../navigation/forgotPasswordScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// MyVehicles stack
function MyVehiclesStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="MyVehiclesMain"
        component={MyVehiclesScreen}
        options={{
          title: t("vehicles.title"),
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
        options={({ route, navigation }) => ({
          title: t("vehicles.details"),
          headerBackTitle: t("navigation.back"),
          headerRight: () => (
            <IconButton
              icon="cog"
              color="#fff"
              size={24}
              style={styles.headerIcon}
              onPress={() => {
                // Navigate within the same stack
                navigation.navigate("EditVehicle", {
                  vehicle: route.params.vehicle,
                });
              }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          title: t("vehicles.add"),
          headerBackTitle: t("navigation.back"),
        }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{
          title: t("vehicles.edit"),
          headerBackTitle: t("navigation.back"),
        }}
      />
      <Stack.Screen
        name="AddFilling"
        component={AddFillingScreen}
        options={{
          title: t("fillings.add"),
          headerBackTitle: t("navigation.back"),
        }}
      />
      <Stack.Screen
        name="EditFilling"
        component={EditFillingScreen}
        options={{
          title: t("fillings.edit"),
          headerBackTitle: t("navigation.back"),
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: t("auth.title") }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: t("auth.forgotPassword"),
          headerBackTitle: t("navigation.back"),
        }}
      />
    </Stack.Navigator>
  );
}

// Petrol Stations stack
function PetrolStationsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="PetrolStationsMain"
        component={PetrolStationsScreen}
        options={{
          title: t("navigation.petrolStations"),
          headerLeft: () => null, // Remove back button
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: t("auth.title") }}
      />
    </Stack.Navigator>
  );
}

// Settings stack
function SettingsStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{
          title: t("navigation.settings"),
          headerLeft: () => null, // Remove back button
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: t("auth.title") }}
      />
    </Stack.Navigator>
  );
}

// Add MyAccountScreen to each stack navigator
function AccountStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="MyAccountMain"
        component={MyAccountScreen}
        options={{
          title: t("auth.title"),
          headerLeft: () => null, // Remove back button
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: t("auth.forgotPassword"),
          headerBackTitle: t("navigation.back"),
        }}
      />
    </Stack.Navigator>
  );
}

export default function MainAppNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#777777",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MyVehicles"
        component={MyVehiclesStack}
        options={{
          title: t("navigation.myVehicles"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="car" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="PetrolStationsTab"
        component={PetrolStationsStack}
        options={{
          title: t("navigation.petrolStations"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="gas-station"
              color={color}
              size={size}
            />
          ),
        }}
      />
      {/* Temporarily hidden Settings tab
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          title: t("navigation.settings"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
      */}
      <Tab.Screen
        name="Account"
        component={AccountStack}
        options={{
          title: t("auth.title"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    margin: 0,
    marginTop: -4,
    alignSelf: "center",
  },
  accountIcon: {
    backgroundColor: "#333",
    marginRight: 10,
    marginTop: -4,
  },
});
