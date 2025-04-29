import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface, List, Divider } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function FrequentlyAskedQuestionsScreen() {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
        question: "Ali je aplikacija brezplačna?",
        answer: "Da, aplikacija je popolnoma brezplačna za uporabo."
    },
    {
      question: "Kako dodam novo vozilo?",
      answer: "V glavnem meniju izberite 'Moja Vozila' in nato izberite 'Dodaj Vozilo'. Izpolnite zahtevane podatke o vozilu (ime, znamka, model) in kliknite 'Dodaj Vozilo'."
    },
    {
      question: "Kako beležim polnjenje goriva?",
      answer: "Kliknite na želeno vozilo v meniju 'Moja Vozila', nato izberite 'Dodaj Točenje'. Vnesite datum, količino goriva, ceno na liter in stanje števca kilometrov. Aplikacija bo samodejno izračunala porabo ko bosta vnešeni najmanj dve točenji."
    },
    {
      question: "Kako deluje iskanje bencinskih servisov?",
      answer: "Aplikacija uporablja vašo trenutno lokacijo za prikaz najbližjih bencinskih servisov na zemljevidu. Po želji, lahko tudi ročno vnesete lokacijo za iskanje."
    },
    {
      question: "Ali se moji podatki sinhronizirajo med napravami?",
      answer: "Da, vsi vaši podatki se sinhronizirajo. To pomeni, da imate dostop do svojih podatkov na vseh napravah, kjer ste prijavljeni."
    },
    {
      question: "Kako izbrišem svoj račun?",
      answer: "Za izbris računa se obrnite na naslov enej.dev@gmail.com."
    },
    {
      question: "Kako natančni so podatki o cenah goriva?",
      answer: "Cene goriva se posodabljajo redno, vendar ne moremo zagotoviti 100% točnosti v realnem času. Priporočamo, da preverite ceno na bencinskem servisu."
    },
    {
      question: "Kako deluje izračun porabe goriva?",
      answer: "Aplikacija izračuna porabo na podlagi razlike v kilometrih med polnjenji in količine natočenega goriva. Formula je: (litri / razlika v kilometrih) * 100."
    },
    {
      question: "Ali lahko izvozim svoje podatke?",
      answer: "Trenutno ta funkcija še ni na voljo. Načrtujemo dodajanje možnosti izvoza podatkov v CSV formatu v prihodnji posodobitvi."
    }
  ];

  const handlePress = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.title}>Pogosta vprašanja</Text>
        
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