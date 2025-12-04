// utils/firebase.js - MODULAR API VERSION (v22)

import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// @react-native-firebase initializes automatically from the native config files.
// There is no manual initialization step.

// Get the service instances using modular API
const authInstance = getAuth();
const dbInstance = getFirestore();

// Export them for use in your app.
export { authInstance as auth, dbInstance as db };