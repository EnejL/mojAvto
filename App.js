// App.js
import React, { useEffect } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, IconButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import "./utils/i18n";
import { StatusBar, StyleSheet, View } from "react-native";
import { ensureAnonymousAuth } from "./utils/auth";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";

// Import screens
import HomeScreen from "./screens/homeScreen";
import MyVehiclesScreen from "./screens/myVehiclesScreen";
import FuelConsumptionScreen from "./screens/fuelConsumptionScreen";
import PetrolStationsScreen from "./screens/petrolStationsScreen";
import SettingsScreen from "./screens/settingsScreen";
import VehicleDetailsScreen from "./screens/vehicleDetailsScreen";
import AddVehicleScreen from "./screens/addVehicleScreen";
import AddFillingScreen from "./screens/addFillingScreen";
import EditVehicleScreen from "./screens/editVehicleScreen";
import VehicleFuelConsumptionScreen from "./screens/vehicleFuelConsumptionScreen";
import AuthScreen from "./screens/authScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// A custom drawer toggle button using Paper's IconButton.
// Placed in the header's right.
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

// MyVehicles stack: VehicleDetails is only accessible here.
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
        options={({ navigation }) => ({
          title: t("vehicles.title"),
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="plus"
                size={36}
                iconColor="#fff"
                style={styles.headerIcon}
                onPress={() => navigation.navigate("AddVehicle")}
              />
              <DrawerToggleButton />
            </View>
          ),
        })}
      />
      <Stack.Screen
        name="VehicleDetails"
        component={VehicleDetailsScreen}
        options={{
          title: t("vehicles.details"),
          headerRight: () => <DrawerToggleButton />,
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
        name="AddFilling"
        component={AddFillingScreen}
        options={{ title: t("fillings.add") }}
      />
      <Stack.Screen
        name="EditVehicle"
        component={EditVehicleScreen}
        options={{ title: t("vehicles.edit") }}
      />
    </Stack.Navigator>
  );
}

// Home stack.
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
        name="Home"
        component={HomeScreen}
        options={{ title: "Home" }}
      />
    </Stack.Navigator>
  );
}

// Fuel Consumption stack.
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
        options={{ title: t("fillings.add") }}
      />
    </Stack.Navigator>
  );
}

// Petrol Stations stack.
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

// Settings stack.
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

// Auth stack.
function AuthStack() {
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
        name="Auth"
        component={AuthScreen}
        options={{
          title: t("auth.title"),
          headerRight: () => <DrawerToggleButton />,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    margin: 0,
    alignSelf: "center",
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: "#f4f4f4",
    borderTopWidth: 1,
    paddingTop: 15,
    paddingHorizontal: 15,
  },
  accountButton: {
    backgroundColor: "#2196F3",
    borderRadius: 15,
  },
  accountButtonLabel: {
    color: "#fff",
  },
});

export default function App() {
  const { t } = useTranslation();

  useEffect(() => {
    ensureAnonymousAuth().catch(console.error);
  }, []);

  return (
    <PaperProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerPosition: "right",
          }}
          drawerContent={(props) => (
            <View style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>
                <DrawerContentScrollView {...props}>
                  <DrawerItemList
                    {...props}
                    itemStyle={(index) =>
                      index < props.state.routes.length - 2
                        ? styles.drawerItem
                        : null
                    }
                  />
                </DrawerContentScrollView>
              </View>
              <View style={styles.bottomDrawerSection}>
                <DrawerItem
                  label={t("auth.title")}
                  onPress={() => props.navigation.navigate("Account")}
                  style={styles.accountButton}
                  labelStyle={styles.accountButtonLabel}
                />
              </View>
            </View>
          )}
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
          <Drawer.Screen
            name="Account"
            component={AuthStack}
            options={{
              title: t("auth.title"),
              drawerItemStyle: { height: 0 }, // Hide from drawer list
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
