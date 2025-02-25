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
    // Translate Firebase errors to user-friendly error codes
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error("auth/email-taken");
      case "auth/invalid-email":
        throw new Error("auth/invalid-email");
      case "auth/weak-password":
        throw new Error("auth/weak-password");
      default:
        throw new Error("auth/unknown-error");
    }
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
    // Translate Firebase errors to user-friendly error codes
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        throw new Error("auth/invalid-credentials");
      case "auth/invalid-email":
        throw new Error("auth/invalid-email");
      case "auth/user-disabled":
        throw new Error("auth/user-disabled");
      case "auth/too-many-requests":
        throw new Error("auth/too-many-attempts");
      default:
        throw new Error("auth/unknown-error");
    }
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
