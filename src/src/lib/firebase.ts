import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0gv_2NnS1zPrRE2rgF85fx61pyVLFKUs",
  authDomain: "streamcart-login.firebaseapp.com",
  databaseURL: "https://streamcart-login-default-rtdb.firebaseio.com",
  projectId: "streamcart-login",
  storageBucket: "streamcart-login.firebasestorage.app",
  messagingSenderId: "658712603017",
  appId: "1:658712603017:web:61094aa63c361614659958"
  
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Only experimentalForceLongPolling is valid in v10
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export function getFirestoreDb() {
  return db;
}

export function getFirebaseStorage() {
  return getStorage(app);
}
