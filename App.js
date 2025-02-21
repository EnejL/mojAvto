// App.js
import React from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider as PaperProvider, IconButton } from "react-native-paper";
import { useTranslation } from "react-i18next";
import "./utils/i18n";

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

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// A custom drawer toggle button using Paper's IconButton.
// Placed in the header's right.
function DrawerToggleButton() {
  const navigation = useNavigation();
  return (
    <IconButton
      icon="menu"
      size={24}
      onPress={() => navigation.toggleDrawer()}
    />
  );
}

// MyVehicles stack: VehicleDetails is only accessible here.
function MyVehiclesStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyVehiclesMain"
        component={MyVehiclesScreen}
        options={({ navigation }) => ({
          title: t("vehicles.title"),
          headerRight: () => (
            <>
              <IconButton
                icon="plus"
                size={24}
                onPress={() => navigation.navigate("AddVehicle")}
              />
              <DrawerToggleButton />
            </>
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
        options={{ title: t("vehicles.add") }}
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
        headerTitle: "Home",
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: "#f0f0f0",
        },
        headerTitleStyle: {
          fontSize: 20,
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
    <Stack.Navigator>
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

export default function App() {
  const { t } = useTranslation();

  return (
    <PaperProvider>
      <NavigationContainer>
        <Drawer.Navigator
          screenOptions={{
            headerShown: false,
            drawerPosition: "right",
          }}
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
      </NavigationContainer>
    </PaperProvider>
  );
}
