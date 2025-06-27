import { auth } from "./firebase";
import { getDeviceId } from "./deviceStorage";
import { updateVehicle } from "./firestore";


// Function to get vehicles by device ID
export const getVehiclesByDeviceId = async (deviceId) => {
  try {
    // Use the db instance directly
    const vehiclesRef = db.collection("vehicles");
    const q = vehiclesRef
      .where("deviceId", "==", deviceId)
      .where("userId", "==", null);

    const querySnapshot = await q.get();
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting vehicles by device ID:", error);
    throw error;
  }
};

// Function to migrate device data to user account
export const migrateDeviceDataToUser = async (userId) => {
  try {
    const deviceId = await getDeviceId();
    const deviceVehicles = await getVehiclesByDeviceId(deviceId);

    for (const vehicle of deviceVehicles) {
      await updateVehicle(vehicle.id, {
        userId,
        // Keep the deviceId as well for reference
        deviceId,
      });
    }

    console.log(`Migrated ${deviceVehicles.length} vehicles to user ${userId}`);
    return deviceVehicles.length;
  } catch (error) {
    console.error("Error migrating device data:", error);
    return 0;
  }
};

// Set up auth state listener to handle login
export const setupAuthListener = () => {
  return auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log("User signed in:", user.uid);
      const migratedCount = await migrateDeviceDataToUser(user.uid);
      if (migratedCount > 0) {
        console.log(`Successfully migrated ${migratedCount} vehicles to user account`);
      }
    } else {
      console.log("User signed out");
    }
  });
};

// Login with email and password
export const signIn = async (email, password) => {
  try {
    // Call the method on your auth instance
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error.code);
    throw error;
  }
};

// Register with email and password
export const createAccount = async (email, password) => {
  try {
    // Call the method on your auth instance
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error creating account:", error.code);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    // Call the method on your auth instance
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
