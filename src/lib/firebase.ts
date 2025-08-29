
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "streamcart-login",
  "appId": "1:658712603017:web:61094aa63c361614659958",
  "storageBucket": "streamcart-login.firebasestorage.app",
  "apiKey": "AIzaSyD0gv_2NnS1zPrRE2rgF85fx61pyVLFKUs",
  "authDomain": "streamcart-login.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "658712603017"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initializeFirebase() {
    if (typeof window !== "undefined") {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
            auth = initializeAuth(app, {
                persistence: browserLocalPersistence,
            });
            db = getFirestore(app);
        } else {
            app = getApp();
            auth = getAuth(app);
            db = getFirestore(app);
        }
    }
}

// Initialize Firebase on client side
initializeFirebase();

export const getFirebaseApp = (): FirebaseApp => {
    if (!app) {
        initializeFirebase();
    }
    return app!;
}

export const getFirebaseAuth = (): Auth => {
    if (!auth) {
        initializeFirebase();
    }
    return auth!;
};

export const getFirestoreDb = (): Firestore => {
    if (!db) {
        initializeFirebase();
    }
    return db!;
}
