// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrJDx8K3KRdeoQzEicW3ZIfxmCYRDVmtE",
  authDomain: "eksamendb.firebaseapp.com",
  projectId: "eksamendb",
  storageBucket: "eksamendb.appspot.com",
  messagingSenderId: "542609944765",
  appId: "1:542609944765:web:377fe0d0898e4c38d347d4",
  measurementId: "G-96L2EKSNZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const database = getFirestore(app)
const storage = getStorage(app)

export { app, database, auth, storage }