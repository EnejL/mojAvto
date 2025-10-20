# MojAvto

MojAvto is a React Native application for managing and tracking your vehicle-related activities.

## Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Xcode (for iOS development)
- Android Studio (for Android development)
- CocoaPods (for iOS dependencies)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd SloGas
```

2. Install dependencies:
```bash
npm install
```

3. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

## Development

A collection of useful commands for building and running the application during development.

### Build commands
Builds the application for the specified platform and profile using EAS.

**Production Builds**
```bash
eas build --platform ios --profile production --clear-cache
```
```bash
eas build --platform android --profile production --clear-cache
```

**Development Builds**
```bash
eas build --profile development --platform ios --clear-cache
```
```bash
eas build --profile development --platform android --clear-cache
```

### Clean and regenerate native files
Cleans and regenerates the native `ios` and `android` directories. This is useful when native dependencies have been added or changed.

```bash
npx expo prebuild --platform ios --clean
```

### Submit to App Store Connect
Submits the latest successful build to the Apple App Store for review.

```bash
eas submit --platform ios --latest
```
### Submit to Google Play Console
Submits the latest successful build to the Google Play Console for review.

```bash
eas submit --platform android --latest
```

### Start development server
Starts the local development server and launches the app in a simulator or on a connected device.

```bash
npx expo start --dev-client
```

## Splash Screen Management

The app includes an automated script to easily update the splash screen across all platforms.

### Updating the Splash Screen

To update the splash screen image:

1. **Replace the main splash screen image:**
   ```bash
   # Place your new splash screen image at:
   assets/splashscreen.png
   ```

2. **Run the update script:**
   ```bash
   ./update-splash.sh
   ```

3. **Rebuild the app to see changes:**
   ```bash
   # For iOS
   expo run:ios
   
   # For Android
   expo run:android
   ```

**What the script does:**
- Automatically copies your new image to all required locations
- Updates iOS splash screen in the Xcode project
- Updates Android splash screen for all screen densities (hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi)
- Provides feedback on what was updated

**Note:** If using Expo Go, the splash screen will update automatically without rebuilding.

## Firebase Cloud Functions

The app uses Firebase Cloud Functions to fetch and parse petrol station data from an external API.

### Prerequisites

Before deploying Firebase Functions, ensure you have:

1. **Firebase CLI installed globally:**
```bash
npm install -g firebase-tools
```

2. **Authenticated with Firebase:**
```bash
firebase login
```

This will open a browser window to authenticate with your Google account that has access to the Firebase project.


## Project Structure

```
mojAvto/
├── android/          # Android native code
├── ios/             # iOS native code
├── components/      # Reusable components
├── screens/         # Screen components
├── utils/           # Utility functions and services
│   ├── translations/ # Internationalization files
│   ├── auth.js      # Authentication utilities
│   ├── firebase.js  # Firebase configuration
│   └── ...          # Other utility files
├── assets/          # Images, fonts, etc.
├── App.js           # Main application component
└── package.json     # Project dependencies
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
