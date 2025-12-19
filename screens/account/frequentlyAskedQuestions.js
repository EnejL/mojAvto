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
    <View style={styles.wrapper}>
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
                theme={{
                  colors: {
                    background: "#1A1A1A",
                    text: "#FFFFFF",
                  },
                }}
              >
                <List.Item
                  description={faq.answer}
                  descriptionStyle={styles.answer}
                  descriptionNumberOfLines={10}
                  style={styles.answerContainer}
                  theme={{
                    colors: {
                      background: "#1A1A1A",
                    },
                  }}
                />
              </List.Accordion>
              {index < faqs.length - 1 && <Divider style={styles.divider} />}
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
    marginBottom: 24,
    color: "#FFFFFF",
  },
  questionContainer: {
    paddingVertical: 4,
    backgroundColor: "#1A1A1A",
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    flexWrap: 'wrap',
    lineHeight: 22,
  },
  answer: {
    fontSize: 14,
    color: "#CCCCCC",
    lineHeight: 20,
  },
  answerContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: "#1A1A1A",
  },
  divider: {
    backgroundColor: "#2A2A2A",
  },
});