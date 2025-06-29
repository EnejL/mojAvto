export default {
  "expo": {
    "name": "Na Poti",
    "slug": "NaPoti",
    "version": "1.1.2", 
    "orientation": "portrait",
    "icon": "./assets/app-icon-ios.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.enejlicina.napoti",
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
            "infoPlist": {
              "NSLocationWhenInUseUsageDescription": "We need your location to show nearby petrol stations and calculate distances.",
              "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location to show nearby petrol stations and calculate distances.",
              "NSLocationUsageDescription": "We need your location to show nearby petrol stations and calculate distances."
            }
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