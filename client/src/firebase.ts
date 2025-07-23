// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfdr6NOIXScjwBbm6qGVG5PMGCz5RwGBo",
  authDomain: "reflect-ai-d56b2.firebaseapp.com",
  projectId: "reflect-ai-d56b2",
  storageBucket: "reflect-ai-d56b2.appspot.com",
  messagingSenderId: "449183677567",
  appId: "1:449183677567:web:172458cd7048393ab2d34a",
  measurementId: "G-K5Y196DY1P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);