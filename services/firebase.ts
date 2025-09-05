/// <reference types="vite/client" />

import { initializeApp, type FirebaseApp } from 'firebase/app';
// FIX: Changed to namespace import for firebase/auth to resolve module resolution errors.
import * as fbAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!firebaseConfig.apiKey;

let app: FirebaseApp | null = null;
let auth: fbAuth.Auth | null = null;
let db: Firestore | null = null;
let googleProvider: fbAuth.GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
    app = initializeApp(firebaseConfig);
    auth = fbAuth.getAuth(app);
    db = getFirestore(app);
    googleProvider = new fbAuth.GoogleAuthProvider();
}

export { auth, db, googleProvider };
