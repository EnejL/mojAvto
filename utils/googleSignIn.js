import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '130352948782-6l7nho00ok5q5oilc41nlna6bjg1vk0t.apps.googleusercontent.com',
  iosClientId: '130352948782-s3sa4o899noegmhnjh6sofe898ieqgaf.apps.googleusercontent.com',
});

export const signInWithGoogle = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices();
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    
    // Create a Google credential with the token
    const googleCredential = GoogleAuthProvider.credential(idToken);
    
    // Sign-in the user with the credential
    return signInWithCredential(auth, googleCredential);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

export const signOutFromGoogle = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.error('Google Sign-Out Error:', error);
    throw error;
  }
}; 