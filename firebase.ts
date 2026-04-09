
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB9L9pYIus440vTpGdXslGl9KYg5lLWtnU",
  authDomain: "reva-ims.firebaseapp.com",
  projectId: "reva-ims",
  storageBucket: "reva-ims.firebasestorage.app",
  messagingSenderId: "844172805769",
  appId: "1:844172805769:web:e69f11e7c9486baca1a858",
  measurementId: "G-HHFX3G1B2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics is only supported in browser environments
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
