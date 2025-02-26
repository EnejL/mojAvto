import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { IconButton, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { View, Text, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { signOut, getCurrentUser } from "../../utils/auth";

// Import all screens
import HomeScreen from "../functionality/homeScreen";
import MyVehiclesScreen from "../functionality/myVehiclesScreen";
import FuelConsumptionScreen from "../functionality/fuelConsumptionScreen";
import PetrolStationsScreen from "../functionality/petrolStationsScreen";
import SettingsScreen from "../functionality/settingsScreen";
import VehicleDetailsScreen from "../functionality/vehicleDetailsScreen";
import AddVehicleScreen from "../functionality/addVehicleScreen";
import EditVehicleScreen from "../functionality/editVehicleScreen";
import VehicleFuelConsumptionScreen from "../functionality/vehicleFuelConsumptionScreen";
import AddFillingScreen from "../functionality/addFillingScreen";
import NoVehiclesWarningScreen from "../functionality/noVehiclesWarningScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// A custom drawer toggle button
function DrawerToggleButton() {
  const navigation = useNavigation();
  return (
    <IconButton
      icon="menu"
      size={36}
      iconColor="#fff"
      style={styles.headerIcon}
      onPress={() => navigation.toggleDrawer()}
    />
  );
}

// Create placeholder components for all screens
const PlaceholderHome = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Home Screen</Text>
  </View>
);

const PlaceholderMyVehicles = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>My Vehicles Screen</Text>
  </View>
);

const PlaceholderVehicleDetails = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Vehicle Details Screen</Text>
  </View>
);

const PlaceholderAddVehicle = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Add Vehicle Screen</Text>
  </View>
);

const PlaceholderEditVehicle = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Edit Vehicle Screen</Text>
  </View>
);

const PlaceholderFuelConsumption = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Fuel Consumption Screen</Text>
  </View>
);

const PlaceholderVehicleFuelConsumption = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Vehicle Fuel Consumption Screen</Text>
  </View>
);

const PlaceholderAddFilling = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Add Filling Screen</Text>
  </View>
);

const PlaceholderNoVehiclesWarning = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>No Vehicles Warning Screen</Text>
  </View>
);

const PlaceholderPetrolStations = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Petrol Stations Screen</Text>
  </View>
);

const PlaceholderSettings = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 24 }}>Settings Screen</Text>
  </View>
);

// MyVehicles stack
function MyVehiclesStack() {
  const { t } = useTranslation();
  const navigation = useNavigation();

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
          headerLeft: null,
          headerRight: () => <DrawerToggleButton />,
        }}
      />
      <Stack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
        options={{
          title: t("vehicles.details"),
          headerRight: () => <DrawerToggleButton />,
          headerBackVisible: true,
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Button
                mode="text"
                onPress={() => navigation.navigate("MyVehiclesMain")}
                labelStyle={{ color: "#fff" }}
              >
                {t("navigation.back")}
              </Button>
            ) : null,
        }}
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
        options={{ title: t("vehicles.edit") }}
      />
    </Stack.Navigator>
  );
}

// Home stack
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <DrawerToggleButton />,
        headerTitle: "Domov",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#000000",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontSize: 20,
          color: "#fff",
        },
      }}
    >
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
    </Stack.Navigator>
  );
}

// Fuel Consumption stack
function FuelConsumptionStack() {
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
        name="FuelConsumption"
        component={FuelConsumptionScreen}
        options={{
          title: t("navigation.fuelConsumption"),
          headerRight: () => <DrawerToggleButton />,
        }}
      />
      <Stack.Screen
        name="VehicleFuelConsumption"
        component={VehicleFuelConsumptionScreen}
        options={({ route }) => ({
          title: route.params.vehicle.name,
          headerRight: () => <DrawerToggleButton />,
        })}
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
        name="NoVehiclesWarning"
        component={NoVehiclesWarningScreen}
        options={{ title: t("fillings.add") }}
      />
    </Stack.Navigator>
  );
}

// Petrol Stations stack
function PetrolStationsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <DrawerToggleButton />,
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
        name="PetrolStations"
        component={PetrolStationsScreen}
        options={{ title: "Petrol Stations" }}
      />
    </Stack.Navigator>
  );
}

// Settings stack
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <DrawerToggleButton />,
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
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Settings" }}
      />
    </Stack.Navigator>
  );
}

// Custom drawer content with logout button
function CustomDrawerContent(props) {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will be handled by the auth state listener in App.js
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.userInfoSection}>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        <DrawerItem
          label={t("auth.signOut")}
          onPress={handleLogout}
          icon={({ color, size }) => (
            <IconButton icon="logout" size={size} color={color} />
          )}
        />
      </View>
    </View>
  );
}

export default function MainAppNavigator() {
  const { t } = useTranslation();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={HomeStack}
        options={{ title: t("navigation.home") }}
      />
      <Drawer.Screen
        name="My Vehicles"
        component={MyVehiclesStack}
        options={{ title: t("navigation.myVehicles") }}
      />
      <Drawer.Screen
        name="Fuel Consumption"
        component={FuelConsumptionStack}
        options={{ title: t("navigation.fuelConsumption") }}
      />
      <Drawer.Screen
        name="Petrol Stations"
        component={PetrolStationsStack}
        options={{ title: t("navigation.petrolStations") }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsStack}
        options={{ title: t("navigation.settings") }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    margin: 0,
    alignSelf: "center",
  },
  userInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f4f4f4",
    alignItems: "center",
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "bold",
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
  },
});
