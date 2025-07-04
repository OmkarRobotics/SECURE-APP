// Import the functions you need from the SDKs you need
// ✅ These are correct for Expo React Native
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDgO5Er6RaiFdqK-exLQgyhQe0IO0S87nk",
  authDomain: "app-bc1dd.firebaseapp.com",
  projectId: "app-bc1dd",
  storageBucket: "app-bc1dd.firebasestorage.app",
  messagingSenderId: "753243751073",
  appId: "1:753243751073:web:5ac2134d78e7d6548526e0",
  measurementId: "G-0QBFMF0B0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);