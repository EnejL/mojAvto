// petrolStationsScreen.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { Card, Title, Paragraph } from "react-native-paper";
import { useTranslation } from "react-i18next";

const PetrolStationsScreen = () => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Card>
        <Card.Content>
          <Title>{t("petrolStations.title")}</Title>
          <Paragraph>Petrol stations will go here ...</Paragraph>
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

export default PetrolStationsScreen;
