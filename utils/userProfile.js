import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "@react-native-firebase/firestore";

// Default settings applied when a user has no profile document yet
export const defaultUserProfile = {
  language: "en",
  unitSystem: "metric", // "metric" | "imperial"
  // Detailed measurement preferences (used by the settings UI; unitSystem stays in sync)
  distanceUnit: "km", // "km" | "mi"
  volumeUnit: "L", // "L" | "gal"
  // Fuel consumption: "l_per_100km" | "mpg" | "km_per_l"
  consumptionUnit: "l_per_100km",
  // Electric consumption: "kwh_per_100km" | "kwh_per_100mi" | "mi_per_kwh" | "km_per_kwh"
  electricConsumptionUnit: "kwh_per_100km",
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

