import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translations
const resources = {
  en: {
    translation: {
      navigation: {
        home: "Home",
        myVehicles: "My Vehicles",
        fuelConsumption: "Fuel Consumption",
        petrolStations: "Petrol Stations",
        settings: "Settings",
        back: "Back",
      },
      vehicles: {
        title: "My Vehicles",
        add: "Add Vehicle",
        empty: "No vehicles added yet",
        name: "Vehicle Name",
        make: "Vehicle Make",
        model: "Vehicle Model",
        edit: "Edit Vehicle",
        numberPlate: "Number Plate",
      },
      fillings: {
        title: "Fuel Fillings",
        date: "Date",
        liters: "Liters",
        cost: "Cost",
        odometer: "Odometer Reading",
        add: "Add Filling",
        consumption: "Fuel Consumption",
        consumptionUnit: "l/100 km",
        notEnoughData: "Not enough fuel entries",
        distanceSince: "Distance since last filling",
      },
      common: {
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        error: {
          save: "Failed to save",
          load: "Failed to load",
          required: "Please fill in all fields",
        },
      },
      auth: {
        title: "Account",
        email: "Email",
        password: "Password",
        signIn: "Sign In",
        createAccount: "Create Account",
        anonymousInfo:
          "You're currently using the app anonymously. Create an account to save your data across devices.",
        error: {
          createAccount: "Failed to create account",
          signIn: "Failed to sign in",
          signOut: "Failed to sign out",
        },
        haveAccount: "Already have an account? Sign in",
        needAccount: "Need an account? Create one",
        signedInAs: "Signed in as {{email}}",
        signOut: "Sign Out",
      },
    },
  },
  sl: {
    translation: {
      navigation: {
        home: "Domov",
        myVehicles: "Moja Vozila",
        fuelConsumption: "Poraba Goriva",
        petrolStations: "Bencinske Črpalke",
        settings: "Nastavitve",
        back: "Nazaj",
      },
      vehicles: {
        title: "Moja Vozila",
        add: "Dodaj Vozilo",
        empty: "Še ni dodanih vozil",
        details: "Informacije o vozilu",
        name: "Ime Vozila",
        make: "Znamka",
        model: "Model",
        edit: "Uredi Vozilo",
        numberPlate: "Registrska Oznaka",
      },
      fillings: {
        title: "Točenja Goriva",
        nav: "Poraba Goriva",
        date: "Datum",
        liters: "Litrov",
        cost: "Strošek",
        odometer: "Stanje Kilometrov",
        add: "Dodaj Točenje",
        consumption: "Povprečna Poraba Goriva",
        consumptionUnit: "l/100 km",
        notEnoughData: "Premalo vnosov točenj",
        empty: "Še ni točenj",
        distanceSince: "Prevoženi kilometri od zadnjega točenja",
      },
      petrolStations: {
        title: "Bencinske Črpalke",
        description: "Bencinske črpalke bodo tukaj ...",
      },
      settings: {
        title: "Nastavitve",
        language: "Jezik",
        theme: "Tema",
        notifications: "Obvestila",
      },
      common: {
        loading: "Nalaganje...",
        save: "Shrani",
        cancel: "Prekliči",
        error: {
          save: "Shranjevanje ni uspelo",
          load: "Nalaganje ni uspelo",
          required: "Prosim izpolnite vsa polja",
        },
      },
      auth: {
        title: "Račun",
        email: "E-pošta",
        password: "Geslo",
        signIn: "Prijava",
        createAccount: "Ustvari Račun",
        anonymousInfo:
          "Trenutno uporabljate aplikacijo anonimno. Ustvarite račun za shranjevanje podatkov med napravami.",
        error: {
          createAccount: "Ustvarjanje računa ni uspelo",
          signIn: "Prijava ni uspela",
          signOut: "Odjava ni uspela",
        },
        haveAccount: "Že imate račun? Prijavite se",
        needAccount: "Potrebujete račun? Ustvarite ga",
        signedInAs: "Prijavljeni kot {{email}}",
        signOut: "Odjava",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "sl", // default language changed to Slovenian
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
