import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDeVTjtr0QNBxrQoGGOI4YeUKBTfLhhg-I",
  authDomain: "store-inventory-d0806.firebaseapp.com",
  projectId: "store-inventory-d0806",
  storageBucket: "store-inventory-d0806.firebasestorage.app",
  messagingSenderId: "656561678398",
  appId: "1:656561678398:web:4941495dbbda87ce90096f",
  measurementId: "G-7FGTSL1S4S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
