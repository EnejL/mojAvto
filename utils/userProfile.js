import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "@react-native-firebase/firestore";

// Default settings applied when a user has no profile document yet
export const defaultUserProfile = {
  language: "en",
  unitSystem: "metric", // "metric" | "imperial"
  currency: "EUR", // "EUR" | "USD"
};

// Load or initialize the current user's profile document
export const getUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userDocRef);

  if (snapshot.exists()) {
    return { ...defaultUserProfile, ...snapshot.data() };
  }

  await setDoc(userDocRef, defaultUserProfile, { merge: true });
  return { ...defaultUserProfile };
};

// Update the current user's profile with partial fields; returns the merged result without an extra read
export const updateUserProfile = async (partialProfile, currentProfile) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDocRef = doc(db, "users", user.uid);
  await setDoc(userDocRef, partialProfile, { merge: true });

  return { ...(currentProfile || defaultUserProfile), ...partialProfile };
};

