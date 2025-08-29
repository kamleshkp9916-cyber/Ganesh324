
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
    if (!getApps().length) {
        app = initializeApp(firebaseConfig);
        auth = initializeAuth(app, {
            persistence: browserLocalPersistence
        });
        db = getFirestore(app);
    } else {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    }
}

// Call initialization right away
initializeFirebase();

export const getFirebaseAuth = (): Auth => {
    if (!auth) initializeFirebase();
    return auth;
};
export const getFirestoreDb = (): Firestore => {
    if (!db) initializeFirebase();
    return db;
};
