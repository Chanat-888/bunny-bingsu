// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFcQbwYA0FWXcRIShePka82ivH5WVWUUE",
  authDomain: "bunnybingsu-fd865.firebaseapp.com",
  projectId: "bunnybingsu-fd865",
  storageBucket: "bunnybingsu-fd865.appspot.com",
  messagingSenderId: "888481936585",
  appId: "1:888481936585:web:13215614f90f9c131cc918",
  measurementId: "G-96V748YMD9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Firestore database instance
export const db = getFirestore(app);
