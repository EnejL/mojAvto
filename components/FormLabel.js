import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

const FormLabel = ({ children, required = false, style }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, style]}>
        {children}
        {required && <Text style={styles.asterisk}> *</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  asterisk: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },
});

export default FormLabel;
