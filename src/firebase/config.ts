import { initializeApp, getApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjMoBKWjIAgey7GpgPB9PI0ZIaFXR7Ldg",
  authDomain: "challane.firebaseapp.com",
  projectId: "challane",
  storageBucket: "challane.firebasestorage.app",
  messagingSenderId: "880697432147",
  appId: "1:880697432147:web:bb75326d0bbb97ec56cea6",
};

// Initialize Firebase (avoid multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with configuration
const auth = getAuth(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase Auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Use device language
auth.useDeviceLanguage();

// Initialize Firestore
const db = getFirestore(app);

export { auth, googleProvider, db };
