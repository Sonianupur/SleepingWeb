
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyC3ILdM4vXdE-X1FMNGDSDKa77rDphnDUk",
  authDomain: "sleepingai-5abd2.firebaseapp.com",
  projectId: "sleepingai-5abd2",
  storageBucket: "sleepingai-5abd2.appspot.com", // 
  messagingSenderId: "536125938870",
  appId: "1:536125938870:web:e33dbd39a75b71dbde9a17",
  measurementId: "G-9EZTDZDF4P",
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
