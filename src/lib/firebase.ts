
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

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});
const db = getFirestore(app);

export { app as firebaseApp, auth as firebaseAuth, db as firestoreDb };

export const getFirebaseAuth = (): Auth => auth;
export const getFirestoreDb = (): Firestore => db;
