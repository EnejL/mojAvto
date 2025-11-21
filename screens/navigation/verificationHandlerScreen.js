// screens/VerificationHandlerScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../utils/firebase'; // Make sure this path is correct
import { Button, Title } from 'react-native-paper';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const VerificationHandlerScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [status, setStatus] = useState('Verifying your email...');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const handleVerification = async () => {
      // The oobCode is the verification code from the email link's query parameters
      const { oobCode } = route.query || {};

      if (oobCode) {
        try {
          // Use the code to apply the email verification
          await applyActionCode(auth, oobCode);
          setStatus('Email successfully verified!');
          setIsVerified(true);
        } catch (err) {
          setStatus('Verification Failed');
          Alert.alert('Error', 'The verification link is invalid, has expired, or has already been used.');
        }
      } else {
        setStatus('Invalid verification link.');
      }
    };

    handleVerification();
  }, [route.query]);

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={isVerified ? "email-check" : "email-alert"} 
        size={80} 
        color={isVerified ? "#4CAF50" : "#F44336"}
        style={styles.icon}
      />
      <Title style={styles.statusText}>{status}</Title>
      
      {isVerified ? (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')} // Navigate to your Login screen
          style={styles.button}
        >
          Proceed to Login
        </Button>
      ) : (
        <ActivityIndicator size="large" color="#000000" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  icon: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '80%',
  },
});

export default VerificationHandlerScreen;
