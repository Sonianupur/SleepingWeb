// app/firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// (same as before, BUT storageBucket is fixed)
const firebaseConfig = {
  apiKey: "AIzaSyC3ILdM4vXdE-X1FMNGDSDKa77rDphnDUk",
  authDomain: "sleepingai-5abd2.firebaseapp.com",
  projectId: "sleepingai-5abd2",
  storageBucket: "sleepingai-5abd2.appspot.com", // ✅ FIXED
  messagingSenderId: "536125938870",
  appId: "1:536125938870:web:e33dbd39a75b71dbde9a17",
  measurementId: "G-9EZTDZDF4P",
};

// Initialize (avoid double init in Next.js)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Exports used around the app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
