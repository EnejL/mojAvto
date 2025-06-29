// utils/googleSignIn.js - CORRECTED NATIVE VERSION

import { GoogleSignin } from '@react-native-google-signin/google-signin';
// CORRECT: We only need our initialized native auth instance from firebase.js
import auth from '@react-native-firebase/auth';
import { auth as authInstance } from './firebase'; 

// REMOVED: All imports from 'firebase/auth' are gone.

export const signInWithGoogle = async () => {
  try {
    // 1. Configure Google Sign-In (It's safe to call this every time)
    // The webClientId is used to identify your app to Google's backend.
    // This should be the 'Client ID' of type 'Web application' from your Google Cloud console,
    // which is also found in your GoogleService-Info.plist as the CLIENT_ID of type 3.
    GoogleSignin.configure({
      webClientId: '130352948782-6l7nho00ok5q5oilc41nlna6bjg1vk0t.apps.googleusercontent.com',
    });

    // 2. Check for Play Services (Android only, but safe to call on iOS)
    await GoogleSignin.hasPlayServices();
    
    // 3. Get the user's ID token from the native Google sign-in pop-up
    const { idToken } = await GoogleSignin.signIn();
    
    // 4. CORRECT: Create a Google credential from the native auth instance
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // 5. CORRECT: Sign-in the user with the credential on the native auth instance
    return authInstance.signInWithCredential(googleCredential);

  } catch (error) {
    console.error('Google Sign-In Error:', error);
    // It's better to re-throw the error so the calling screen can handle it
    throw error;
  }
};

/**
 * A complete sign-out function that signs the user out of Firebase
 * and also out of their Google account on the device.
 */
export const signOutFromGoogle = async () => {
  try {
    // First, sign out from the native Google Sign-In manager
    await GoogleSignin.signOut();
    // Then, sign out from Firebase
    await auth.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    throw error;
  }
};