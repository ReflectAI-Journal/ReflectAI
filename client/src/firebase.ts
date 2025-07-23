import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: "reflect-ai-d56b2.firebaseapp.com",
  projectId: "reflect-ai-d56b2",
  storageBucket: "reflect-ai-d56b2.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abc123def456",
};

let app;
let auth;
let googleProvider;
let appleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  appleProvider = new OAuthProvider("apple.com");
} catch (error) {
  console.warn("Firebase initialization failed, using demo mode:", error);
  // Create mock objects for demo mode
  auth = null;
  googleProvider = null;
  appleProvider = null;
}

export { auth, googleProvider, appleProvider };
export default app;