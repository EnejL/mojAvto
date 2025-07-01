import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import all translations
const resources = {
  sl: {
    translation: {
      navigation: {
        home: "Domov",
        myVehicles: "Moja Vozila",
        fuelConsumption: "Poraba Goriva",
        petrolStations: "Črpalke",
        settings: "Nastavitve",
        back: "Nazaj",
      },
      vehicles: {
        title: "Moja Vozila",
        add: "Dodaj Vozilo",
        empty: "Še ni dodanih vozil",
        details: "Informacije o vozilu",
        name: "Ime Vozila (neobvezno)",
        make: "Znamka",
        model: "Model",
        modelPlaceholder: "Najprej izberite znamko",
        edit: "Uredi Vozilo",
        numberPlate: "Registrska Oznaka",
        addFirst: "Dodaj Svoje Prvo Vozilo",
        selected: "Izbrano Vozilo",
        deleteVehicle: "Izbriši Vozilo",
        deleteConfirmMessage: "Ste prepričani, da želite izbrisati to vozilo?",
      },
      fillings: {
        title: "Točenja goriva",
        nav: "Poraba Goriva",
        date: "Datum",
        liters: "Litrov",
        cost: "Strošek",
        odometer: "Stanje Kilometrov",
        add: "Dodaj Točenje",
        empty: "Ni zabeleženih točenj",
        delete: "Odstrani vnos",
        consumption: "Povprečna Poraba Goriva",
        consumptionUnit: "l/100 km",
        notEnoughData: "Ni dovolj podatkov. Vnesite vsaj dve točenji.",
        distanceSince: "Prevoženi kilometri od zadnjega točenja",
        noVehiclesWarning: "Najprej morate dodati vozilo, preden lahko zabeležite točenja goriva.",
        noFillings: "Trenutno ni zabeleženih točenj goriva. Prosimo, vnesite vaše prvo točenje.",
        edit: "Uredi Točenje",
        deleteConfirmMessage: "Ste prepričani, da želite izbrisati to točenje?",
        filling: "točenje",
        statistics: "Statistika vozila",
        avgConsumption: "Povprečna poraba",
        avgCost: "Povprečni strošek",
        avgLiters: "Povprečno točenje",
        totalCost: "Skupni strošek",
        showConsumptionGraph: "Prikaži graf porabe",
        consumptionOverTime: "Poraba goriva skozi čas"
      },
      petrolStations: {
        title: "Bencinske Črpalke",
        list: "Seznam",
        map: "Zemljevid",
        fetchError: "Napaka pri nalaganju bencinskih črpalk",
        description: "Bencinske črpalke bodo tukaj ...",
        viewDetails: "Več informacij",
        prices: "Cene goriv",
        getDirections: "Navigacija",
        openingHours: "Delovni Čas",
        open24Hours: "Odprto 24 ur",
        closed: "Zaprto",
        noOpeningHours: "Informacije o delovnem času niso na voljo",
        searchPlaceholder: "Išči po imenu ali naslovu",
        noSearchResults: "Ni rezultatov iskanja",
        empty: "Ni črpalk na voljo",
        favorites: "Priljubljene",
        noFavorites: "Ni črpalk na voljo",
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
          delete: "Brisanje ni uspelo",
        },
        submit: "Potrdi",
        ok: "V redu",
        delete: "Izbriši",
        done: "Končano",
        version: "Različica",
        privacyPolicy: "Politika zasebnosti",
        terms: "Pogoji uporabe",
        faq: "Pogosto zastavljena vprašanja",
        hide: "Skrij"
      },
      auth: {
        title: "Račun",
        email: "E-pošta",
        password: "Geslo",
        signIn: "Prijava",
        createAccount: "Ustvari Račun",
        anonymousInfo: "Trenutno uporabljate aplikacijo anonimno. Ustvarite račun za shranjevanje podatkov med napravami.",
        error: {
          createAccount: "Ustvarjanje računa ni uspelo",
          signIn: "Prijava ni uspela",
          signOut: "Odjava ni uspela",
          invalidCredentials: "Napačen email ali geslo",
          userDisabled: "Ta račun je onemogočen",
          tooManyAttempts: "Preveč poskusov. Prosimo poskusite kasneje",
          unknownError: "Prišlo je do napake. Prosimo poskusite ponovno",
          emailTaken: "Ta email je že v uporabi",
          weakPassword: "Geslo mora vsebovati vsaj 6 znakov",
          googleSignInFailed: "Prijava z Google računom ni uspela. Prosimo poskusite kasneje.",
        },
        haveAccount: "Že imate račun? Prijavite se",
        needAccount: "Potrebujete račun?",
        signedInAs: "Prijavljeni kot {{email}}",
        signOut: "Odjava",
        greeting: "Pozdravljeni, {{email}}",
        accountManage: "Moj Račun",
        forgotPassword: "Ste pozabili geslo?",
        enterEmailFirst: "Prosimo, najprej vnesite svoj e-poštni naslov",
        resetEmailSent: "E-pošta za ponastavitev gesla poslana",
        checkEmail: "Preverite svojo e-pošto za navodila za ponastavitev gesla",
        resetError: "Napaka pri ponastavitvi gesla",
        confirmPassword: "Potrdi geslo",
        "passwords-dont-match": "Gesli se ne ujemata",
        signInWithGoogle: "Prijava z Google računom",
        or: "ali",
        googleSignInFailed: "Prijava z Google računom ni uspela. Prosimo poskusite ponovno.",
      },
      welcome: {
        message: "Spremljajte porabo goriva in vzdrževanje vašega vozila."
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "sl", // default language
  fallbackLng: "sl",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
