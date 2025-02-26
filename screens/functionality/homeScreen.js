// screens/functionality/homeScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  text: {
    fontSize: 24,
  },
});
