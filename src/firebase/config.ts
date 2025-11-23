// IMPORTANT: This file is used by both client and server code.
// Do not import any client-side-only modules here.
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

export const firebaseConfig = {
  "projectId": "streamcart-login",
  "appId": "1:658712603017:web:61094aa63c361614659958",
  "storageBucket": "streamcart-login.appspot.com",
  "apiKey": "AIzaSyD0gv_2NnS1zPrRE2rgF85fx61pyVLFKUs",
  "authDomain": "streamcart-login.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "658712603017"
};

// Singleton pattern to initialize Firebase app
let app: FirebaseApp;

if (getApps().length === 0) {
  try {
    // This can happen in some environments (like older Next.js versions or serverless)
    // where the app isn't automatically initialized.
    app = initializeApp(firebaseConfig);
  } catch (e) {
    // This is the more common case on the client, where the app might already be initialized.
    app = getApp();
  }
} else {
  app = getApp();
}

/**
 * A singleton getter for the Firebase App instance.
 * Ensures the app is initialized only once.
 */
export function getFirebaseApp(): FirebaseApp {
    if (!app) {
         if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
    }
    return app;
}
