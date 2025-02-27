import { auth } from "./firebase";
import { getDeviceId } from "./deviceStorage";
import { updateVehicle } from "./firestore";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";

// Function to get vehicles by device ID
export const getVehiclesByDeviceId = async (deviceId) => {
  try {
    const db = getFirestore();
    const vehiclesRef = collection(db, "vehicles");
    const q = query(
      vehiclesRef,
      where("deviceId", "==", deviceId),
      where("userId", "==", null) // Only get vehicles without a userId
    );

    const querySnapshot = await getDocs(q);
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

    // Get all vehicles associated with this device that don't have a userId
    const deviceVehicles = await getVehiclesByDeviceId(deviceId);

    // Update each vehicle to associate with the user ID
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
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is signed in
      console.log("User signed in:", user.uid);
      const migratedCount = await migrateDeviceDataToUser(user.uid);
      if (migratedCount > 0) {
        console.log(
          `Successfully migrated ${migratedCount} vehicles to user account`
        );
      }
    } else {
      // User is signed out
      console.log("User signed out");
    }
  });
};

// Login with email and password
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    // Rethrow with a more specific message
    throw { message: `auth/${error.code}` };
  }
};

// Register with email and password
export const createAccount = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error creating account:", error);
    // Rethrow with a more specific message
    throw { message: `auth/${error.code}` };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return null;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};
