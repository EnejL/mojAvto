import {
  getAuth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export const ensureAnonymousAuth = async () => {
  try {
    // If there's no current user, sign in anonymously
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser;
  } catch (error) {
    console.error("Error in anonymous auth:", error);
    throw error;
  }
};

export const createAccount = async (email, password) => {
  try {
    const currentUser = auth.currentUser;

    if (currentUser?.isAnonymous) {
      // Link anonymous account with email/password
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(currentUser, credential);
      return currentUser;
    } else {
      // Create new account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    }
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const logOut = async () => {
  try {
    await signOut(auth);
    // Sign in anonymously after logout
    await signInAnonymously(auth);
    return auth.currentUser;
  } catch (error) {
    console.error("Error in logout:", error);
    throw error;
  }
};
