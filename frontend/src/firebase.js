// Firebase Phone Auth has been replaced by Fast2SMS OTP via the backend.
// RecaptchaVerifier and signInWithPhoneNumber are no longer used.
// This file is kept as a stub for any future Firebase service integration.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDEFVIapAsFkv4uubKBf5hZeLKQrSv8C4",
  authDomain: "dipto-fashion.firebaseapp.com",
  projectId: "dipto-fashion",
  storageBucket: "dipto-fashion.firebasestorage.app",
  messagingSenderId: "968398661945",
  appId: "1:968398661945:web:1040fd427ee1b33ad620e8",
  measurementId: "G-C7TZH9Y9EY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
