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
