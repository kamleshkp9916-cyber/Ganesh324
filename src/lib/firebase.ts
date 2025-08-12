
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "streamcart-login",
  "appId": "1:658712603017:web:61094aa63c361614659958",
  "storageBucket": "streamcart-login.firebasestorage.app",
  "apiKey": "AIzaSyD0gv_2NnS1zPrRE2rgF85fx61pyVLFKUs",
  "authDomain": "streamcart-login.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "658712603017"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
