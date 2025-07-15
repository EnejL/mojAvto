export default {
  "expo": {
    "name": "Na Poti",
    "slug": "NaPoti",
    "version": "1.2.0", 
    "orientation": "portrait",
    "icon": "./assets/app-icon-ios.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "scheme": "com.enejlicina.napoti",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.enejlicina.napoti",
      "associatedDomains": ["applinks:verify.enejlicina.com"],
      "buildNumber": "10",
      "googleServicesFile": "./GoogleService-Info.plist",
      "config": {
        "googleMapsApiKey": "AIzaSyCB7pakhzxdYuzfvZbMrcHJ7jcuZmVFprA"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },

    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "We need your location to show nearby petrol stations and calculate distances.",
          "locationAlwaysPermission": "We need your location to show nearby petrol stations and calculate distances.",
          "locationWhenInUsePermission": "We need your location to show nearby petrol stations and calculate distances."
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          "ios": {
            "reversedClientId": "com.googleusercontent.apps.130352948782-s3sa4o899noegmhnjh6sofe898ieqgaf"
          }
        }
      ],
      '@react-native-firebase/app',
      '@react-native-firebase/auth',
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "extraPods": [
              { "name": "FirebaseAuth", "modular_headers": true },
              { "name": "FirebaseAuthInterop", "modular_headers": true },
              { "name": "FirebaseAppCheckInterop", "modular_headers": true },
              { "name": "FirebaseCore", "modular_headers": true },
              { "name": "FirebaseCoreExtension", "modular_headers": true },
              { "name": "GoogleUtilities", "modular_headers": true },
              { "name": "RecaptchaInterop", "modular_headers": true },
              { "name": "FirebaseFirestore", "modular_headers": true },
              { "name": "FirebaseFirestoreInternal", "modular_headers": true }
            ]
          },
          "android": {
            "minSdkVersion": 21
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