// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace the below configuration with your own from the Firebase Console.
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

export { db };
