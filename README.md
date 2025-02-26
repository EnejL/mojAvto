# MojAvto

MojAvto is a React Native app built with Expo that helps users track fuel consumption and manage vehicle data. The app uses Firebase for data storage (Cloud Firestore) and authentication (anonymous, email, and Google). It leverages React Native Paper for UI components and theming, providing seamless dark/light mode support.

## Features

- **Vehicle Management:**  
  Add, edit, and list vehicles with details such as make, model, and number plate.
- **Fuel Consumption Tracking:**  
  Record fuel fillings for each vehicle including date, liters, cost, and odometer readings.
- **Firebase Integration:**  
  Uses Cloud Firestore to store vehicles and filling data. Authentication is implemented with anonymous, email, and Google sign-in, with support for upgrading anonymous accounts.
- **Theming:**  
  Built with React Native Paper, the app supports dark and light themes based on the system settings.
- **Cross-Platform:**  
  Developed using Expo for easy deployment on both iOS and Android.

## Getting Started

### Prerequisites

- **Node.js:** [Download Node.js](https://nodejs.org/en/) (LTS version recommended)
- **npm or Yarn:** Package manager for dependencies
- **Expo CLI:**  
  Install globally using:

  ```bash
  npm install -g expo-cli

  ```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/EnejL/MojAvto.git
   cd MojAvto
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Firebase Setup:

   - Create a Firebase Project:
     - Visit the Firebase Console, sign in, and create a new project.
   - Enable Firestore and Authentication:
     - In the Firebase Console, navigate to the Firestore and Authentication sections.
     - Enable Firestore and follow the instructions to set it up.
     - Enable Authentication and select the sign-in method(s) you want to use (e.g., Email/Password, Google, etc.).
   - Enable Authentication:
     - Navigate to Authentication in the Firebase Console.
     - Under Sign-in method, enable:
       - Anonymous
       - Email/Password
       - Google (if desired)
   - Configure Firebase in Your App:
   - In the Firebase Console, go to Project Settings > General > Your apps.
   - Click the web icon (</>) to register a new app if you haven’t already.
   - Copy the Firebase configuration snippet provided.
   - Update your firebase.js file with the copied configuration:

     ```javascript
     // firebase.js
     import { initializeApp } from "firebase/app";
     import { getFirestore } from "firebase/firestore";

     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_PROJECT_ID.appspot.com",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID",
     };

     const app = initializeApp(firebaseConfig);
     const db = getFirestore(app);

     export { db };
     ```

#### Run the app:

1. Start the Expo development server:

   ```bash
   expo start
   ```

2. Run the app on your device or simulator:
   • iOS: Use the Expo Go app or an iOS simulator.
   • Android: Use the Expo Go app or an Android emulator.
   • Follow the instructions displayed by Expo (scan the QR code or choose a simulator option).

##### License

This project is licensed under the MIT License.
