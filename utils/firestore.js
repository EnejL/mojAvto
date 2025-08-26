// utils/firestore.js - FINAL CORRECTED NATIVE VERSION

import { db, auth } from './firebase';
// We need to import the firestore instance itself to access FieldValue
import firestore from '@react-native-firebase/firestore';

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
      // Use the native SDK's server timestamp
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    
    // Use the native chained syntax
    const docRef = await db.collection('users').doc(user.uid).collection('vehicles').add(vehicleWithMetadata);
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
    
    // Use the native chained syntax for doc() and update()
    const vehicleRef = db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId);
    await vehicleRef.update(vehicleData);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw error;
  }
};

export const deleteVehicle = async (vehicleId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    // Use the native chained syntax for doc() and delete()
    await db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).delete();
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");
    
    // Use the native chained syntax for collection(), orderBy(), and get()
    const vehiclesRef = db.collection('users').doc(currentUser.uid).collection('vehicles');
    const querySnapshot = await vehiclesRef.orderBy('createdAt', 'desc').get();

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
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    // Use the native chained syntax for sub-collections
    const docRef = await db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('fillings').add(fillingWithMetadata);
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
    
    const fillingsRef = db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('fillings');
    const querySnapshot = await fillingsRef.orderBy('date', 'desc').get();

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
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    
    const fillingRef = db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('fillings').doc(fillingId);
    await fillingRef.update(fillingWithMetadata);
  } catch (error) {
    console.error("Error updating filling:", error);
    throw error;
  }
};

export const deleteFilling = async (vehicleId, fillingId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    await db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('fillings').doc(fillingId).delete();
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
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    // Use the native chained syntax for sub-collections
    const docRef = await db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('chargingSessions').add(chargingSessionWithMetadata);
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
    
    const chargingSessionsRef = db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('chargingSessions');
    const querySnapshot = await chargingSessionsRef.orderBy('date', 'desc').get();

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
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };
    
    const chargingSessionRef = db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('chargingSessions').doc(chargingSessionId);
    await chargingSessionRef.update(chargingSessionWithMetadata);
  } catch (error) {
    console.error("Error updating charging session:", error);
    throw error;
  }
};

export const deleteChargingSession = async (vehicleId, chargingSessionId) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    
    await db.collection('users').doc(user.uid).collection('vehicles').doc(vehicleId).collection('chargingSessions').doc(chargingSessionId).delete();
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