// homeScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Title>App Home Screen</Title>
          <Paragraph>This is the app home screen. (Placeholder text)</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
});

export default HomeScreen;
