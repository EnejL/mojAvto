// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence
} from "firebase/auth";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAgyenYvKy85JCjRb_xkN-XmH90CRtx_pc",
  authDomain: "mojavto-c67fe.firebaseapp.com",
  projectId: "mojavto-c67fe",
  storageBucket: "mojavto-c67fe.firebasestorage.app",
  messagingSenderId: "130352948782",
  appId: "1:130352948782:web:2578faad7e60bf5fe361bf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { db, auth };
