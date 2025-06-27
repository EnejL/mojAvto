export default {
  "expo": {
    "name": "Na Poti",
    "slug": "NaPoti",
    "version": "1.1.1",
    "orientation": "portrait",
    "icon": "./assets/app-icon-ios.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splashscreen.png",
      "resizeMode": "cover",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.enejlicina.napoti",
      "buildNumber": "9",
      "googleServicesFile": "./GoogleService-Info.plist",
      "config": {
        "googleMapsApiKey": "AIzaSyCB7pakhzxdYuzfvZbMrcHJ7jcuZmVFprA"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/app-icon-android.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourusername.napoti",
      "versionCode": 8,
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyCB7pakhzxdYuzfvZbMrcHJ7jcuZmVFprA"
        }
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "infoPlist": {
              "NSLocationWhenInUseUsageDescription": "We need your location to show nearby petrol stations and calculate distances."
            },
            "extraPods": [
              {
                "name": "GoogleUtilities",
                "modular_headers": true
              },
              {
                "name": "GoogleDataTransport",
                "modular_headers": true
              },
              {
                "name": "GoogleAppMeasurement",
                "modular_headers": true
              },
              {
                "name": "nanopb",
                "modular_headers": true
              }
            ]
          }
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