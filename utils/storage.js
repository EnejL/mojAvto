import AsyncStorage from "@react-native-async-storage/async-storage";

const VEHICLES_STORAGE_KEY = "@vehicles";

export const saveVehicles = async (vehicles) => {
  try {
    await AsyncStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehicles));
  } catch (error) {
    console.error("Error saving vehicles:", error);
    throw error;
  }
};

export const loadVehicles = async () => {
  try {
    const vehiclesJson = await AsyncStorage.getItem(VEHICLES_STORAGE_KEY);
    return vehiclesJson ? JSON.parse(vehiclesJson) : [];
  } catch (error) {
    console.error("Error loading vehicles:", error);
    throw error;
  }
};
