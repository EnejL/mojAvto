# React Native Firebase v22 migration plan

This document is a step-by-step plan to migrate the app from the current (namespaced) React Native Firebase API to the v22 **modular** API. The official guide: [rnfirebase.io/migrating-to-v22](https://rnfirebase.io/migrating-to-v22).

---

## Step 1: Upgrade packages to v22

1. In `package.json`, ensure all `@react-native-firebase/*` packages are on v22 (or latest v22.x):
   - `@react-native-firebase/app`
   - `@react-native-firebase/auth`
   - `@react-native-firebase/firestore`
   - `@react-native-firebase/analytics`
   - `@react-native-firebase/crashlytics`
2. Run `npm install` (or `yarn`).
3. Rebuild the native app (e.g. `npx expo prebuild --clean` if using Expo, then build).

---

## Step 2: App / getApp (if needed)

- The modular API often uses **getApp()** to pass the app instance into service getters.
- In React Native Firebase, many modules use a **default app** automatically. Check the docs for each package: if a function is `getX(app)` and you only have one app, you can call `getX()` and it will use the default app.
- If you need to reference the app explicitly:
  ```js
  import { getApp } from '@react-native-firebase/app';
  const app = getApp();
  ```

---

## Step 3: Auth → modular API

**Current (namespaced):** `auth()`, `auth().signInWithCredential()`, `auth.AppleAuthProvider.credential()`.

**Target (modular):** `getAuth()`, then use functions that take the auth instance as the first argument.

1. **`utils/firebase.js`**  
   Already uses `getAuth()` and exports the instance. No change needed here.

2. **`utils/googleSignIn.js`**  
   - Replace `import auth from '@react-native-firebase/auth'` with modular imports, e.g.:
     - `import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth'`
   - Use `const auth = getAuth()` (or use the auth instance from `utils/firebase.js`).
   - Replace `auth.GoogleAuthProvider.credential(idToken)` with `GoogleAuthProvider.credential(idToken)`.
   - Replace `authInstance.signInWithCredential(googleCredential)` with `signInWithCredential(auth, googleCredential)` (or equivalent modular `signInWithCredential` that takes `auth` as first argument).

3. **`components/AppleSignIn.js`**  
   - Replace `import auth from '@react-native-firebase/auth'` with modular imports, e.g.:
     - `import { getAuth, OAuthProvider, signInWithCredential } from '@react-native-firebase/auth'` (Apple may use OAuthProvider or AppleAuthProvider in modular API; check RNFB auth reference).
   - Replace `auth().signInWithCredential(credential)` with `signInWithCredential(auth, credential)` where `auth = getAuth()`.
   - Replace `auth.AppleAuthProvider.credential(...)` with the modular equivalent (e.g. `AppleAuthProvider.credential(...)` if exported).

4. **`App.js`**  
   - It uses `onAuthStateChanged` from `firebase/auth`. Switch to modular: `import { onAuthStateChanged } from '@react-native-firebase/auth'` (or from `firebase/auth` if that’s the Web compat). Ensure the first argument is the auth instance from `getAuth()`.

5. **Any other file** that calls `auth()` or `auth().*`: use the shared auth instance from `firebase.js` and the modular function that takes `(auth, ...)`.

---

## Step 4: Firestore → modular API

**Current (namespaced):** `firestore()`, `db.collection(...).doc(...)`, etc.

**Target (modular):** `getFirestore()`, then `collection(db, 'path')`, `doc(db, 'col', 'id')`, `getDocs`, `setDoc`, `getDoc`, etc., with `db` as first argument.

1. **`utils/firebase.js`**  
   Already uses `getFirestore()` and exports `db`. Keep as is.

2. **`utils/firestore.js`**  
   - It already uses modular-style imports from `@react-native-firebase/firestore` (e.g. `collection`, `doc`, `getDocs`).
   - Ensure every call passes `db` (from `getFirestore()` or from `utils/firebase.js`) as the first argument where required (e.g. `collection(db, 'vehicles')`, `doc(db, 'users', id)`).
   - Replace any remaining `firestore().collection(...)` with `collection(db, ...)` and equivalent for other operations.

3. **`utils/userProfile.js`**  
   - Uses `doc`, `getDoc`, `setDoc`. Ensure they use the modular form with `db` as first argument (e.g. `doc(db, 'users', uid)`).

4. **`utils/auth.js`**  
   - Same: any Firestore usage must use `db` and modular helpers (`collection`, `doc`, `getDocs`, `getDoc`, `setDoc`, etc.).

---

## Step 5: Analytics → modular API

**Current (namespaced):** `analytics().logEvent()`, `analytics().setUserId()`, `analytics().logScreenView()`, etc.

**Target (modular):** `getAnalytics()`, then `logEvent(analytics, name, params)`, `setUserId(analytics, id)`, `logScreenView(analytics, params)`, etc.

1. **`utils/analytics.js`**  
   - Replace:
     - `import analytics from '@react-native-firebase/analytics'`
     - with: `import { getAnalytics, logEvent, setUserId, setUserProperties, logScreenView } from '@react-native-firebase/analytics'` (or the exact names from the RNFB analytics modular API).
   - At top level: `const analytics = getAnalytics();`
   - Replace every call:
     - `analytics().logEvent(...)` → `logEvent(analytics, ...)`
     - `analytics().setUserId(...)` → `setUserId(analytics, ...)`
     - `analytics().setUserProperty(...)` → use `setUserProperties(analytics, { key: value })` or the per-property modular equivalent.
     - `analytics().logScreenView(...)` → `logScreenView(analytics, ...)` (with the params object expected by the modular API).
   - Keep the same exported helper functions; only the implementation inside uses the modular calls.

2. **`App.js`**  
   - No change if it only uses your `utils/analytics.js` helpers. If it imports analytics directly, switch those to the new modular usage.

---

## Step 6: Crashlytics → modular API

**Current (namespaced):** `crashlytics().log(message)`, `crashlytics().setUserId()`, `crashlytics().recordError()`, etc.

**Target (modular):** `getCrashlytics()`, then `log(crashlytics, message)`, `setUserId(crashlytics, id)`, `recordError(crashlytics, error)`, etc.

1. **`utils/crashlytics.js`**  
   - Replace:
     - `import crashlytics from '@react-native-firebase/crashlytics'`
     - with: `import { getCrashlytics, log, setUserId, setAttribute, recordError, crash } from '@react-native-firebase/crashlytics'` (check the actual export names in the package’s modular `index.d.ts`).
   - At top level: `const crashlytics = getCrashlytics();`
   - Replace every call:
     - `crashlytics().log(message)` → `log(crashlytics, message)`
     - `crashlytics().setUserId(id)` → `setUserId(crashlytics, id)`
     - `crashlytics().setAttribute(key, value)` → `setAttribute(crashlytics, key, value)` (or equivalent).
     - `crashlytics().recordError(error)` → `recordError(crashlytics, error)`
     - `crashlytics().crash()` → `crash(crashlytics)`
   - Keep the same exported API from `utils/crashlytics.js` so the rest of the app does not need to change.

---

## Step 7: Verify and test

1. Remove any deprecation-silence flag so all warnings are visible.
2. Run the app and confirm there are no deprecation warnings for Firebase.
3. Test: Auth (email, Google, Apple if used), Firestore read/write, Analytics events and screen views, Crashlytics logs and error reporting.
4. Optional: set `globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true` temporarily to catch any remaining namespaced usage.

---

## Step 8: Optional – strict mode

- To ensure no namespaced API is used, set in your app entry (e.g. first line of `index.js` or a bootstrap file):
  ```js
  globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true;
  ```
- Run the app and fix any errors (stack traces will point to remaining namespaced calls).
- Remove the flag after migration is complete.

---

## Order of work (suggested)

1. Upgrade packages (Step 1).
2. Auth (Step 3) – few files, high visibility.
3. Analytics (Step 5) – one utility file.
4. Crashlytics (Step 6) – one utility file.
5. Firestore (Step 4) – multiple files but already partly modular.
6. App/getApp (Step 2) only if you need an explicit app reference.
7. Verify and test (Step 7).

---

## References

- [Migrating to v22](https://rnfirebase.io/migrating-to-v22) – React Native Firebase
- [Firebase Web modular upgrade](https://firebase.google.com/docs/web/modular-upgrade) – same patterns for Auth, Firestore, Analytics
- [Firebase JS reference](https://firebase.google.com/docs/reference/js) – modular function names and signatures
- RNFB package docs: [Analytics](https://rnfirebase.io/analytics/usage), [Crashlytics](https://rnfirebase.io/crashlytics/usage), [Auth](https://rnfirebase.io/auth/usage), [Firestore](https://rnfirebase.io/firestore/usage)
