import { db } from "./firebase";
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
import { getDeviceId } from "./deviceStorage";
import { auth } from "./firebase";

// Vehicles Collection Operations
export const addVehicle = async (vehicleData) => {
  try {
    const deviceId = await getDeviceId();
    const user = auth.currentUser;

    const vehicleWithMetadata = {
      ...vehicleData,
      deviceId,
      createdAt: serverTimestamp(),
    };

    // If user is logged in, associate vehicle with user ID
    if (user) {
      vehicleWithMetadata.userId = user.uid;
    }

    const docRef = await addDoc(
      collection(db, "vehicles"),
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
    const vehicleRef = doc(db, "vehicles", vehicleId);
    await updateDoc(vehicleRef, vehicleData);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    await deleteDoc(doc(db, "vehicles", vehicleId));
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const deviceId = await getDeviceId();
    const q = query(
      collection(db, "vehicles"),
      where("deviceId", "==", deviceId),
      orderBy("createdAt", "desc")
    );
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

// Fillings Subcollection Operations
export const addFilling = async (vehicleId, fillingData) => {
  try {
    const fillingsRef = collection(db, "vehicles", vehicleId, "fillings");
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
    const fillingsRef = collection(db, "vehicles", vehicleId, "fillings");
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

export const getVehicles = async () => {
  try {
    const deviceId = await getDeviceId();
    const user = auth.currentUser;

    let vehicles = [];

    // Always get device-associated vehicles
    const deviceQuery = query(
      collection(db, "vehicles"),
      where("deviceId", "==", deviceId),
      orderBy("createdAt", "desc")
    );
    const deviceSnapshot = await getDocs(deviceQuery);
    const deviceVehicles = deviceSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    vehicles = [...deviceVehicles];

    // If user is logged in, also get user-associated vehicles
    if (user) {
      const userQuery = query(
        collection(db, "vehicles"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const userSnapshot = await getDocs(userQuery);
      const userVehicles = userSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Combine and remove duplicates (in case a vehicle has both deviceId and userId)
      const combinedVehicles = [...deviceVehicles, ...userVehicles];
      vehicles = combinedVehicles.filter(
        (vehicle, index, self) =>
          index === self.findIndex((v) => v.id === vehicle.id)
      );
    }

    return vehicles;
  } catch (error) {
    console.error("Error in getVehicles:", error);
    throw error;
  }
};
