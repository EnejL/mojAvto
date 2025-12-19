import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function TermsOfUseScreen() {
  const { t } = useTranslation();
  const sections = t('termsOfUse.sections', { returnObjects: true });

  return (
    <View style={styles.wrapper}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000000",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    elevation: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#FFFFFF",
  },
  date: {
    fontSize: 14,
    color: "#999999",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 16,
    marginBottom: 4,
    color: "#FFFFFF",
  },
}); 