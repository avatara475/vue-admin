import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCEAJcHcYH66lakTXesfhL2GJYWu9eNLU0",
  authDomain: "admin-48437.firebaseapp.com", //this is for email&password authentication
  databaseURL: "https://admin-48437-default-rtdb.firebaseio.com", //this is for realtime database
  storageBucket: "admin-48437.firebasestorage.app",
  messagingSenderId: "886373942453",
  appId: "1:886373942453:web:fa700be2ff4b79badceafc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);

export { database, auth };