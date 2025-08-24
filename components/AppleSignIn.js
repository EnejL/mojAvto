// components/AppleSignIn.js
import React from 'react';
import { Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import auth from '@react-native-firebase/auth';

function AppleSignIn() {
  const handleAppleSignIn = async () => {
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const { identityToken, nonce } = appleCredential;

      const credential = auth.AppleAuthProvider.credential(identityToken, nonce);

      const result = await auth().signInWithCredential(credential);
      console.log('Firebase sign-in successful:', result.user.uid);
      
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('User canceled Apple Sign-In.');
      } else {
        console.error('Apple Sign-In Error:', error);
        Alert.alert('Sign-In Error', 'Could not sign in with Apple. Please try again.');
      }
    }
  };

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
