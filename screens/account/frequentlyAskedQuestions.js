import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface, List, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function FrequentlyAskedQuestionsScreen() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const faqs = t('faq.questions', { returnObjects: true });

  const handlePress = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.title}>{t('faq.title')}</Text>
        
        {faqs.map((faq, index) => (
          <View key={index}>
            <List.Accordion
              title={faq.question}
              titleStyle={styles.question}
              titleNumberOfLines={3}
              expanded={expandedId === index}
              onPress={() => handlePress(index)}
              style={styles.questionContainer}
            >
              <List.Item
                description={faq.answer}
                descriptionStyle={styles.answer}
                descriptionNumberOfLines={10}
                style={styles.answerContainer}
              />
            </List.Accordion>
            {index < faqs.length - 1 && <Divider />}
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
    marginBottom: 24,
  },
  questionContainer: {
    paddingVertical: 4,
  },
  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    flexWrap: 'wrap',
    lineHeight: 22,
  },
  answer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  answerContainer: {
    paddingLeft: 16,
    paddingRight: 16,
  },
});