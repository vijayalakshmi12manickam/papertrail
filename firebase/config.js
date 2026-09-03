import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
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

// persistentLocalCache enables full offline read/write with sync-on-reconnect.
// This is what makes "log an expense with no signal" work for free — no extra
// Firebase product needed, it's built into the Firestore SDK.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export { app, auth, db };
