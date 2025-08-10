import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function TermsOfUseScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.title}>Pogoji uporabe</Text>
        <Text style={styles.date}>Nazadnje posodobljeno: 10. Avgust 2025</Text>

        <Text style={styles.sectionTitle}>1. Opis storitve</Text>
        <Text style={styles.text}>"Na Poti" omogoča uporabnikom:</Text>
        <Text style={styles.bulletPoint}>• sledenje porabi goriva/elektrike</Text>
        <Text style={styles.bulletPoint}>• pregled bencinskih servisov (lokacije, delovni časi, cene goriv)</Text>

        <Text style={styles.sectionTitle}>2. Uporabniški račun</Text>
        <Text style={styles.text}>Uporaba aplikacije je možna izključno z registriranim računom.</Text>

        <Text style={styles.sectionTitle}>3. Omejitev odgovornosti</Text>
        <Text style={styles.text}>
          Razvijalec ne jamči za popolno točnost prikazanih podatkov (cene goriva, lokacije, delovni časi).{"\n"}
          Razvijalec ne odgovarja za morebitno škodo, nastalo zaradi uporabe aplikacije.
        </Text>

        <Text style={styles.sectionTitle}>4. Pravice razvijalca</Text>
        <Text style={styles.text}>Razvijalec lahko anonimno analizira podatke za izboljšanje aplikacije.</Text>

        <Text style={styles.sectionTitle}>5. Prenehanje uporabe</Text>
        <Text style={styles.text}>
          Uporabnik lahko zahteva izbris svojega uporabniškega računa. Za izbris računa se lahko obrnete na: enej.dev@gmail.com.{"\n"}
          {"\n"}
          Z izbrisom računa se izbrišejo vsi osebni podatki.
        </Text>

        <Text style={styles.sectionTitle}>6. Veljavna zakonodaja</Text>
        <Text style={styles.text}>
          Za vse morebitne spore velja slovensko pravo.{"\n"}
          Pristojna so sodišča v Sloveniji.
        </Text>

        <Text style={styles.sectionTitle}>7. Starostne omejitve</Text>
        <Text style={styles.text}>Aplikacija je namenjena uporabnikom starejšim od 18 let.</Text>
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