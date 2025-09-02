import { auth } from "./firebase";
import { getDeviceId } from "./deviceStorage";
import { updateVehicle } from "./firestore";

const actionCodeSettings = {
  url: 'https://verify.enejlicina.com/verify-email',
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.enejlicina.napoti',
  },
  android: {
    packageName: 'com.enejlicina.napoti',
  },
};

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
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    await userCredential.user.sendEmailVerification(actionCodeSettings);

    return userCredential.user;
  } catch (error) {
    console.error("Error creating account:", error.code);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
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

// Check if user's email is verified
export const isEmailVerified = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

// Resend email verification
export const resendEmailVerification = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Send email verification WITH the new settings
      await user.sendEmailVerification(actionCodeSettings);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error resending email verification:", error);
    throw error;
  }
};

export const reloadUser = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      return user;
    }
    return null;
  } catch (error) {
    console.error("Error reloading user:", error);
    throw error;
  }
};

// Delete user account and all associated data
export const deleteAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user is currently signed in");
    }

    const userId = user.uid;

    // First, delete all user data from Firestore
    await deleteAllUserData(userId);

    // Then delete the user account from Firebase Auth
    await user.delete();

    console.log("Account deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

// Helper function to delete all user data from Firestore
const deleteAllUserData = async (userId) => {
  try {
    // Import db here to avoid circular dependency
    const { db } = await import('./firebase');
    
    // Get all vehicles for the user
    const vehiclesRef = db.collection('users').doc(userId).collection('vehicles');
    const vehiclesSnapshot = await vehiclesRef.get();

    // Delete all subcollections for each vehicle (fillings, chargingSessions)
    const deletePromises = [];
    
    vehiclesSnapshot.docs.forEach(vehicleDoc => {
      const vehicleId = vehicleDoc.id;
      
      // Delete fillings subcollection
      deletePromises.push(
        deleteSubcollection(vehiclesRef.doc(vehicleId).collection('fillings'))
      );
      
      // Delete chargingSessions subcollection
      deletePromises.push(
        deleteSubcollection(vehiclesRef.doc(vehicleId).collection('chargingSessions'))
      );
    });

    // Wait for all subcollections to be deleted
    await Promise.all(deletePromises);

    // Delete all vehicles
    const vehicleDeletePromises = vehiclesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(vehicleDeletePromises);

    // Delete the user document itself
    await db.collection('users').doc(userId).delete();

    console.log(`Deleted all data for user ${userId}`);
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
};

// Helper function to delete all documents in a subcollection
const deleteSubcollection = async (subcollectionRef) => {
  const snapshot = await subcollectionRef.get();
  const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
  await Promise.all(deletePromises);
};
