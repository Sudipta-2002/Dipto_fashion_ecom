import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

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
export { RecaptchaVerifier, signInWithPhoneNumber };
