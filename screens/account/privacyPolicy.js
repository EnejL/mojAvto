import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Surface } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section}>
        <Text style={styles.title}>Politika zasebnosti</Text>
        <Text style={styles.date}>Nazadnje posodobljeno: 10. Avgust 2025</Text>

        <Text style={styles.sectionTitle}>1. Splošne informacije</Text>
        <Text style={styles.text}>
          Aplikacijo "DriveTrack Pro" razvija Enej Ličina.{"\n"}
          Za vsa vprašanja o zasebnosti se lahko obrnete na: enej.dev@gmail.com.
        </Text>

        <Text style={styles.sectionTitle}>2. Namen aplikacije</Text>
        <Text style={styles.text}>
          "DriveTrack Pro" omogoča uporabnikom sledenje porabi goriva oziroma električne energije za njihova vozila ter pregled bencinskih servisov v Sloveniji.
        </Text>

        <Text style={styles.sectionTitle}>3. Zbiranje in obdelava osebnih podatkov</Text>
        <Text style={styles.text}>Zbiramo naslednje podatke:</Text>
        <Text style={styles.bulletPoint}>• Ime in priimek</Text>
        <Text style={styles.bulletPoint}>• E-naslov</Text>
        <Text style={styles.bulletPoint}>• Podatke o vozilu (znamka, model, registrska številka)</Text>
        <Text style={styles.bulletPoint}>• Lokacijo (za iskanje bencinskih servisov)</Text>
        <Text style={styles.bulletPoint}>• Podatke o polnjenju goriva</Text>
        <Text style={styles.bulletPoint}>• Podatke o polnjenju elektrike</Text>

        <Text style={styles.subsectionTitle}>Podlaga za obdelavo:</Text>
        <Text style={styles.text}>Uporabniška privolitev pri registraciji računa.</Text>

        <Text style={styles.subsectionTitle}>Obdelava tretjih oseb:</Text>
        <Text style={styles.text}>Uporabljamo Googlovo storitev Firebase za avtentikacijo in hranjenje podatkov.</Text>

        <Text style={styles.subsectionTitle}>Obdobje hrambe podatkov:</Text>
        <Text style={styles.text}>Vaše podatke hranimo do izbrisa uporabniškega računa oz. največ 6 mesecev po izbrisu računa.</Text>

        <Text style={styles.subsectionTitle}>Vaše pravice:</Text>
        <Text style={styles.bulletPoint}>• Pravica do dostopa do podatkov</Text>
        <Text style={styles.bulletPoint}>• Pravica do izbrisa podatkov ("pravica do pozabe")</Text>
        <Text style={styles.text}>Za uveljavljanje pravic nas kontaktirajte na zgoraj navedeni e-naslov.</Text>

        <Text style={styles.sectionTitle}>4. Piškotki in analitika</Text>
        <Text style={styles.text}>
          Aplikacija uporablja Google Analytics for Firebase za zbiranje anonimnih podatkov o uporabi. Namen je izključno analiza uporabe aplikacije.{"\n"}
          Piškotkov ni možno onemogočiti znotraj aplikacije.
        </Text>

        <Text style={styles.sectionTitle}>5. Posredovanje podatkov v tretje države</Text>
        <Text style={styles.text}>Podatki se ne prenašajo izven EU/EGP.</Text>

        <Text style={styles.sectionTitle}>6. Starostna omejitev</Text>
        <Text style={styles.text}>Aplikacijo lahko uporabljajo samo osebe, stare 18 let ali več.</Text>

        <Text style={styles.sectionTitle}>7. Blagovne znamke</Text>
        <Text style={styles.text}>
          Vse blagovne znamke in logotipi (znamke vozil, logotipi bencinskih servisov ipd.) so last njihovih zakonitih imetnikov.
        </Text>
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
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