export default {
  "expo": {
    "name": "DriveTrack Pro",
    "slug": "NaPoti",
    "version": "1.7.0", 
    "orientation": "portrait",
    "icon": "./assets/app-icon-ios.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "scheme": "com.enejlicina.drivetrackpro",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.enejlicina.drivetrackpro",
      "deploymentTarget": "15.1",
      "associatedDomains": ["applinks:verify.enejlicina.com"],
      "buildNumber": "20",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      },
      "googleServicesFile": "./GoogleService-Info.plist",
      "config": {
        "googleMapsApiKey": "AIzaSyCB7pakhzxdYuzfvZbMrcHJ7jcuZmVFprA"
      }
    },
    "android": {
      "package": "com.enejlicina.drivetrackpro",
      "versionCode": 2,
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/app-icon-android.png",
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
      "expo-apple-authentication",
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static",
            "deploymentTarget": "15.1"
          },
          "android": {
            "minSdkVersion": 24
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