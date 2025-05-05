import 'dotenv/config';

export default {
  "expo": {
    "name": "Na Poti",
    "slug": "NaPoti",
    "version": "1.1.0",
    "orientation": "portrait",
    "icon": "./assets/app-icon-ios.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splashscreen.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.enejlicina.napoti",
      "buildNumber": "7",
      "config": {
        "googleMapsApiKey": process.env.GOOGLE_MAPS_API_KEY,
        "googleSignIn": {
          "reservedClientId": "com.googleusercontent.apps.YOUR_CLIENT_ID"
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/app-icon-android.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourusername.napoti",
      "versionCode": 4,
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_API_KEY
        }
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Na Poti to use your location."
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "9049abbc-1ba0-443b-aa02-c71be3a3d337"
      }
    }
  }
}; 