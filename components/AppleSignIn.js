// components/AppleSignIn.js

import React from 'react';
import { Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import auth from '@react-native-firebase/auth';

function AppleSignIn() {
  const handleAppleSignIn = async () => {
    try {
      // 1. Prompt the user to sign in with their Apple ID using Face ID/Touch ID
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Apple only gives you the fullName and email the VERY FIRST time a user signs up.
      // You should save it to your database then.
      
      const { identityToken, nonce } = appleCredential;

      // 2. Create the credential using React Native Firebase
      const credential = auth.AppleAuthProvider.credential(identityToken, nonce);

      // 3. Sign in to Firebase with the new credential
      const result = await auth().signInWithCredential(credential);
      console.log('Firebase sign-in successful:', result.user.uid);
      
      // The onAuthStateChanged listener in your App.js will now handle navigation
      // to the main app.
      
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign-In.');
      } else {
        console.error('Apple Sign-In Error:', error);
        Alert.alert('Sign-In Error', 'Could not sign in with Apple. Please try again.');
      }
    }
  };

  // This renders the official "Sign in with Apple" button
  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
      cornerRadius={12} 
      style={{ width: '100%', height: 44, marginBottom: 16 }}
      onPress={handleAppleSignIn}
    />
  );
}

export default AppleSignIn;
