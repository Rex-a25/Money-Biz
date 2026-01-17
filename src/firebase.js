// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // 1. Import getAuth
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 
  apiKey: "AIzaSyBAtv_7cXujJ2_Vf4Wuo4E_cHrdRSDc3mQ",
  authDomain: "bizpilot-5a819.firebaseapp.com",
  projectId: "bizpilot-5a819",
  storageBucket: "bizpilot-5a819.firebasestorage.app",
  messagingSenderId: "462714362536",
  appId: "1:462714362536:web:86ddbbd1d9dd307422009d",
  measurementId: "G-NNVJNBL7V1"
};

const app = initializeApp(firebaseConfig);

// 2. EXPORT the auth instance so AuthContext can see it
export const auth = getAuth(app); 

// 3. EXPORT the database (we need this next)
export const db = getFirestore(app);

export default app;