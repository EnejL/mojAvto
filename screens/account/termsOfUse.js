import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function TermsOfUseScreen() {
  const { t } = useTranslation();
  const sections = t('termsOfUse.sections', { returnObjects: true });

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.title}>{t('termsOfUse.title')}</Text>
        <Text style={styles.date}>{t('termsOfUse.lastUpdated')}</Text>

        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.text}>{section.content}</Text>
            {section.bulletPoints && section.bulletPoints.map((point, pointIndex) => (
              <Text key={pointIndex} style={styles.bulletPoint}>• {point}</Text>
            ))}
          </View>
        ))}
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 16,
    marginBottom: 4,
  },
}); 