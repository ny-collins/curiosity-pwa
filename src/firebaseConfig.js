import { initializeApp, getApp } from "firebase/app";
import { getFirestore, initializeFirestore, memoryLocalCache } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const appId = firebaseConfig.projectId || 'curiosity-pwa';
export const PIN_STORAGE_KEY = `curiosity-pin-${appId}`;

let app;
let auth;
let db;
let storage;
let functions;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  db = initializeFirestore(app, {
      localCache: memoryLocalCache({ cacheSizeBytes: 100 * 1024 * 1024 }) // 100MB cache
  });
  
  storage = getStorage(app);
  functions = getFunctions(app);
  
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }

} catch (error) {
  console.error("Error initializing Firebase:", error);
  if (error.code === 'duplicate-app') {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
    if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
    }
  }
}

export { db, auth, app, functions, storage, analytics, GoogleAuthProvider };
