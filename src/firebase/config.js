import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Add Firestore
import { getStorage } from "firebase/storage"; // Add Storage

const firebaseConfig = {
  apiKey: "AIzaSyAo-kp-FtaHP6jKMHyKl9OSnH6Bd_3urnc",
  authDomain: "class-p-f441a.firebaseapp.com",
  databaseURL: "https://class-p-f441a-default-rtdb.firebaseio.com",
  projectId: "class-p-f441a",
  storageBucket: "class-p-f441a.firebasestorage.app",
  messagingSenderId: "865272212373",
  appId: "1:865272212373:web:990d0c70160f03b22c249c",
  measurementId: "G-JDM9NQJMBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app); // Realtime Database
export const db = getFirestore(app); // Firestore Database
export const storage = getStorage(app); // Firebase Storage
export const analytics = getAnalytics(app);

export default app;
  