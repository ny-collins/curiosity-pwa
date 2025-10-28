// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage"; // Import getStorage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmfZu_t_WtS1fZFQ6v2HqcitA8ODw6cWk",
  authDomain: "curiosity-pwa.firebaseapp.com",
  projectId: "curiosity-pwa",
  storageBucket: "curiosity-pwa.firebasestorage.app", // Make sure this is correct in your Firebase project
  messagingSenderId: "361925578003",
  appId: "1:361925578003:web:93fa63e239180f32061ee6",
  measurementId: "G-H6TK2EPB53"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app); // Initialize Storage

// App ID and Local Storage Key for PIN
const appId = firebaseConfig.projectId || 'default-app-id';
const PIN_STORAGE_KEY = 'curiosity_pin';

// Export app, db, auth, functions, storage, and provider
export { db, auth, app, functions, storage, appId, PIN_STORAGE_KEY, GoogleAuthProvider };
