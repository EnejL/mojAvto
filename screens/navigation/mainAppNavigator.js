import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Import screens
import MyVehiclesScreen from "../functionality/myVehiclesScreen";
import SettingsScreen from "../functionality/settingsScreen";
import VehicleDetailsScreen from "../functionality/vehicleDetailsScreen";
import AddVehicleScreen from "../functionality/addVehicleScreen";
import EditVehicleScreen from "../functionality/editVehicleScreen";
import AuthScreen from "../navigation/authScreen";
import MyAccountScreen from "../account/myAccountScreen";
import AddFillingScreen from "../functionality/addFillingScreen";
import EditFillingScreen from "../functionality/editFillingScreen";
import AddChargingScreen from "../functionality/addChargingScreen";
import EditChargingScreen from "../functionality/editChargingScreen";
import PrivacyPolicyScreen from "../account/privacyPolicy";
import TermsOfUseScreen from "../account/termsOfUse";
import FrequentlyAskedQuestionsScreen from "../account/frequentlyAskedQuestions";

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
          headerBackVisible: false,
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
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0B141E",
            borderBottomColor: "#15202B",
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#0B141E",
          },
        }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{
          title: t("vehicles.edit"),
          headerBackTitle: t("navigation.back"),
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0B141E",
            borderBottomColor: "#15202B",
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#0B141E",
          },
        }}
      />
      <Stack.Screen
        name="AddFilling"
        component={AddFillingScreen}
        options={{
          title: t("fillings.add"),
          headerBackTitle: t("navigation.back"),
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0B141E",
            borderBottomColor: "#15202B",
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#0B141E",
          },
        }}
      />
      <Stack.Screen
        name="EditFilling"
        component={EditFillingScreen}
        options={{
          title: t("fillings.edit"),
          headerBackTitle: t("navigation.back"),
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0B141E",
            borderBottomColor: "#15202B",
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#0B141E",
          },
        }}
      />
      <Stack.Screen
        name="AddCharging"
        component={AddChargingScreen}
        options={{
          title: t("charging.add"),
          headerBackTitle: t("navigation.back"),
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0B141E",
            borderBottomColor: "#15202B",
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#0B141E",
          },
        }}
      />
      <Stack.Screen
        name="EditCharging"
        component={EditChargingScreen}
        options={{
          title: t("charging.edit"),
          headerBackTitle: t("navigation.back"),
          headerBackTitleVisible: false,
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#0B141E",
            borderBottomColor: "#15202B",
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: "#0B141E",
          },
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
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: t("common.privacyPolicy"),
        }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{
          title: t("common.terms"),
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
        contentStyle: {
          backgroundColor: "#000000",
        },
      }}
    >
      <Stack.Screen
        name="MyAccountMain"
        component={MyAccountScreen}
        options={{
          title: t("navigation.account"),
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: t("common.privacyPolicy"),
          contentStyle: {
            backgroundColor: "#000000",
          },
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{
          title: t("common.terms"),
          contentStyle: {
            backgroundColor: "#000000",
          },
          animation: "fade",
        }}
      />
      <Stack.Screen
        name="FrequentlyAskedQuestions"
        component={FrequentlyAskedQuestionsScreen}
        options={{
          title: t("common.faq"),
          contentStyle: {
            backgroundColor: "#000000",
          },
          animation: "fade",
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
        tabBarActiveTintColor: "#ffffff",
        tabBarInactiveTintColor: "#999999",
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          borderTopWidth: 1,
          borderTopColor: "#2A2A2A",
          height: 60,
          paddingBottom: 4,
          paddingTop: 4,
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
