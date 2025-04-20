import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
});

export const signInWithGoogle = async () => {
  try {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();
    
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    
    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}; 