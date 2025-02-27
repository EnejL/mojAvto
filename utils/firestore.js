import { getCurrentUser } from "./auth";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
  where,
} from "firebase/firestore";

// Vehicles Collection Operations
export const addVehicle = async (vehicleData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }
    const vehicleWithMetadata = {
      ...vehicleData,
      userId: user.uid,
      createdAt: serverTimestamp(),
    };
    // Store the vehicle in the user's vehicles subcollection.
    const docRef = await addDoc(
      collection(db, "users", user.uid, "vehicles"),
      vehicleWithMetadata
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw error;
  }
};

export const updateVehicle = async (vehicleId, vehicleData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    // Update the vehicle document under the user's vehicles subcollection.
    const vehicleRef = doc(db, "users", user.uid, "vehicles", vehicleId);
    await updateDoc(vehicleRef, vehicleData);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    // Delete the vehicle document from the user's vehicles subcollection.
    await deleteDoc(doc(db, "users", user.uid, "vehicles", vehicleId));
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");
    // Query vehicles from the authenticated user's vehicles subcollection.
    const vehiclesRef = collection(db, "users", currentUser.uid, "vehicles");
    const q = query(vehiclesRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting vehicles:", error);
    throw error;
  }
};

export const getVehicles = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");
    const vehiclesRef = collection(db, "users", currentUser.uid, "vehicles");
    const q = query(vehiclesRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error in getVehicles:", error);
    throw error;
  }
};

// Fillings Subcollection Operations
export const addFilling = async (vehicleId, fillingData) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    // Store fillings under the vehicle document in the user's vehicles subcollection.
    const fillingsRef = collection(
      db,
      "users",
      user.uid,
      "vehicles",
      vehicleId,
      "fillings"
    );
    const docRef = await addDoc(fillingsRef, {
      ...fillingData,
      date: new Date(fillingData.date),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding filling:", error);
    throw error;
  }
};

export const getVehicleFillings = async (vehicleId) => {
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    // Read fillings from the correct subcollection path.
    const fillingsRef = collection(
      db,
      "users",
      user.uid,
      "vehicles",
      vehicleId,
      "fillings"
    );
    const q = query(fillingsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting fillings:", error);
    throw error;
  }
};

export const getFillings = async (vehicleId) => {
  // This function is identical to getVehicleFillings in this new structure.
  try {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    const fillingsRef = collection(
      db,
      "users",
      user.uid,
      "vehicles",
      vehicleId,
      "fillings"
    );
    const q = query(fillingsRef, orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting fillings:", error);
    throw error;
  }
};
