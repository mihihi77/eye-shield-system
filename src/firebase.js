// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLW7yidc5b3l2dk0O0gVKjxP0S7pSaN_U",
  authDomain: "eyeshield-system.firebaseapp.com",
  projectId: "eyeshield-system",
  storageBucket: "eyeshield-system.appspot.com",
  messagingSenderId: "332397388969",
  appId: "1:332397388969:web:9e8cd619c21faab459f5b8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
