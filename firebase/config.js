import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Replace with your Firebase project config (Settings > Project settings in Firebase console).
// Keep this out of source control in a real project (.env + app.config.js), but Firebase web
// config is not a secret in the security sense — Firestore security rules are what protect data.
const firebaseConfig = {
  apiKey: "AIzaSyDLPA1fIK1rDlkhJwxwGkknth_Zd_xGluY",
  authDomain: "papertrail-fd4c2.firebaseapp.com",
  projectId: "papertrail-fd4c2",
  storageBucket: "papertrail-fd4c2.firebasestorage.app",
  messagingSenderId: "290157711831",
  appId: "1:290157711831:web:9479a06c31c9f4f8f83b92",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// initializeAuth must be called exactly once — guard against Fast Refresh re-invocation.
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// persistentLocalCache needs IndexedDB (via LocalStorage), which doesn't exist
// in React Native — the SDK detected that and was silently falling back to
// memory cache anyway (with a console warning on every launch). memoryLocalCache
// is that same fallback made explicit: reads/writes are cached and offline
// writes still queue and sync on reconnect, but only for the current app
// session — nothing survives a force-quit while offline. Cross-restart offline
// data for reference lists (categories/accounts/currencies) is instead handled
// by the AsyncStorage-backed React Query persister in App.js.
const db = initializeFirestore(app, {
  localCache: memoryLocalCache(),
});

export { app, auth, db };
