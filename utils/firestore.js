// utils/firestore.js - MODULAR API VERSION (v22)

import { db, auth } from './firebase';
// Import modular functions from React Native Firebase
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from '@react-native-firebase/firestore';

// =================================================================
// Vehicles Collection Operations
// =================================================================

export const addVehicle = async (vehicleData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const vehicleWithMetadata = {
      ...vehicleData,
      userId: user.uid,
      // Use the modular API's server timestamp
      createdAt: serverTimestamp(),
    };
    
    // Use the modular API
    const docRef = await addDoc(collection(db, 'users', user.uid, 'vehicles'), vehicleWithMetadata);
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
    
    // Use the modular API
    const vehicleRef = doc(db, 'users', user.uid, 'vehicles', vehicleId);
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

    // Use the modular API
    await deleteDoc(doc(db, 'users', user.uid, 'vehicles', vehicleId));
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");
    
    // Use the modular API
    const vehiclesRef = collection(db, 'users', currentUser.uid, 'vehicles');
    const q = query(vehiclesRef, orderBy('createdAt', 'desc'));
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

// =================================================================
// Fillings Subcollection Operations
// =================================================================

export const addFilling = async (vehicleId, fillingData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const fillingWithMetadata = {
      ...fillingData,
      date: new Date(fillingData.date),
      createdAt: serverTimestamp(),
    };

    // Use the modular API for sub-collections
    const docRef = await addDoc(collection(db, 'users', user.uid, 'vehicles', vehicleId, 'fillings'), fillingWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error("Error adding filling:", error);
    throw error;
  }
};

export const getVehicleFillings = async (vehicleId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const fillingsRef = collection(db, 'users', user.uid, 'vehicles', vehicleId, 'fillings');
    const q = query(fillingsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error)
  {
    console.error("Error getting fillings:", error);
    throw error;
  }
};

export const updateFilling = async (vehicleId, fillingId, fillingData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const fillingWithMetadata = {
      ...fillingData,
      date: new Date(fillingData.date),
      updatedAt: serverTimestamp(),
    };
    
    const fillingRef = doc(db, 'users', user.uid, 'vehicles', vehicleId, 'fillings', fillingId);
    await updateDoc(fillingRef, fillingWithMetadata);
  } catch (error) {
    console.error("Error updating filling:", error);
    throw error;
  }
};

export const deleteFilling = async (vehicleId, fillingId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    await deleteDoc(doc(db, 'users', user.uid, 'vehicles', vehicleId, 'fillings', fillingId));
  } catch (error) {
    console.error("Error deleting filling:", error);
    throw error;
  }
};

// =================================================================
// ChargingSessions Subcollection Operations
// =================================================================

export const addChargingSession = async (vehicleId, chargingSessionData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const chargingSessionWithMetadata = {
      ...chargingSessionData,
      vehicleId: vehicleId,
      userId: user.uid,
      date: new Date(chargingSessionData.date),
      createdAt: serverTimestamp(),
    };

    // Use the modular API for sub-collections
    const docRef = await addDoc(collection(db, 'users', user.uid, 'vehicles', vehicleId, 'chargingSessions'), chargingSessionWithMetadata);
    return docRef.id;
  } catch (error) {
    console.error("Error adding charging session:", error);
    throw error;
  }
};

export const getVehicleChargingSessions = async (vehicleId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    const chargingSessionsRef = collection(db, 'users', user.uid, 'vehicles', vehicleId, 'chargingSessions');
    const q = query(chargingSessionsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting charging sessions:", error);
    throw error;
  }
};

export const updateChargingSession = async (vehicleId, chargingSessionId, chargingSessionData) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const chargingSessionWithMetadata = {
      ...chargingSessionData,
      date: new Date(chargingSessionData.date),
      updatedAt: serverTimestamp(),
    };
    
    const chargingSessionRef = doc(db, 'users', user.uid, 'vehicles', vehicleId, 'chargingSessions', chargingSessionId);
    await updateDoc(chargingSessionRef, chargingSessionWithMetadata);
  } catch (error) {
    console.error("Error updating charging session:", error);
    throw error;
  }
};

export const deleteChargingSession = async (vehicleId, chargingSessionId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    await deleteDoc(doc(db, 'users', user.uid, 'vehicles', vehicleId, 'chargingSessions', chargingSessionId));
  } catch (error) {
    console.error("Error deleting charging session:", error);
    throw error;
  }
};

// =================================================================
// Unified History Operations (Fillings + Charging Sessions)
// =================================================================

export const getVehicleHistory = async (vehicleId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    // Fetch both fillings and charging sessions
    const [fillings, chargingSessions] = await Promise.all([
      getVehicleFillings(vehicleId),
      getVehicleChargingSessions(vehicleId)
    ]);

    // Add type field to distinguish between events
    const fillingsWithType = fillings.map(filling => ({
      ...filling,
      type: 'filling',
      sortDate: filling.date,
    }));

    const chargingSessionsWithType = chargingSessions.map(session => ({
      ...session,
      type: 'charging',
      sortDate: session.date,
    }));

    // Combine and sort by date (newest first)
    const combinedHistory = [...fillingsWithType, ...chargingSessionsWithType];
    
    combinedHistory.sort((a, b) => {
      const dateA = a.sortDate.seconds ? new Date(a.sortDate.seconds * 1000) : new Date(a.sortDate);
      const dateB = b.sortDate.seconds ? new Date(b.sortDate.seconds * 1000) : new Date(b.sortDate);
      return dateB - dateA; // Newest first
    });

    return combinedHistory;
  } catch (error) {
    console.error("Error getting vehicle history:", error);
    throw error;
  }
};