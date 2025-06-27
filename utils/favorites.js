import { db, auth } from './firebase';
import firestore from '@react-native-firebase/firestore';

// Add a station to favorites
export const addToFavorites = async (stationId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    // Use the native chained syntax to get a reference to the document
    const favoriteRef = db.collection('users').doc(currentUser.uid).collection('favorites').doc(stationId);
    
    // Use .set() on the document reference
    await favoriteRef.set({
      // Using a server timestamp is best practice
      addedAt: firestore.FieldValue.serverTimestamp(),
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
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");

    // Use the native chained syntax to get a reference and then delete
    const favoriteRef = db.collection('users').doc(currentUser.uid).collection('favorites').doc(stationId);
    await favoriteRef.delete();

    return true;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    throw error;
  }
};

// Check if a station is favorited
export const isStationFavorited = async (stationId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    // Use the native chained syntax and the .get() method
    const favoriteRef = db.collection('users').doc(currentUser.uid).collection('favorites').doc(stationId);
    const favoriteDoc = await favoriteRef.get();

    // The .exists property is the same in the native SDK
    return favoriteDoc.exists;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    return false;
  }
};

// Get all favorite station IDs for the current user
export const getFavoriteStationIds = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    // Use the native chained syntax and the .get() method
    const favoritesRef = db.collection('users').doc(currentUser.uid).collection('favorites');
    const favoritesSnapshot = await favoritesRef.get();
    
    // The snapshot mapping logic is the same
    return favoritesSnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error getting favorite station IDs:", error);
    return [];
  }
};