import { getFirestore, doc, setDoc, deleteDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { getCurrentUser } from "./auth";

// Add a station to favorites
export const addToFavorites = async (stationId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const db = getFirestore();
    const favoriteRef = doc(db, `users/${currentUser.uid}/favorites/${stationId}`);
    
    await setDoc(favoriteRef, {
      addedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

// Remove a station from favorites
export const removeFromFavorites = async (stationId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) throw new Error("User not authenticated");

    const db = getFirestore();
    const favoriteRef = doc(db, `users/${currentUser.uid}/favorites/${stationId}`);
    
    await deleteDoc(favoriteRef);

    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Check if a station is favorited
export const isStationFavorited = async (stationId) => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const db = getFirestore();
    const favoriteRef = doc(db, `users/${currentUser.uid}/favorites/${stationId}`);
    const favoriteDoc = await getDoc(favoriteRef);

    return favoriteDoc.exists();
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

// Get all favorite station IDs for the current user
export const getFavoriteStationIds = async () => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];

    const db = getFirestore();
    const favoritesRef = collection(db, `users/${currentUser.uid}/favorites`);
    const favoritesSnapshot = await getDocs(favoritesRef);
    
    return favoritesSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error getting favorite station IDs:", error);
    return [];
  }
}; 