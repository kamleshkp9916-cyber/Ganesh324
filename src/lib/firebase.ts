
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence, Auth } from "firebase/auth";

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
let auth: Auth;

// This function ensures Firebase is initialized, but only on the client-side.
function initializeFirebase() {
    if (typeof window !== "undefined") {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
            // Use initializeAuth for more explicit control, especially with persistence.
            auth = initializeAuth(app, {
                persistence: browserLocalPersistence,
            });
        } else {
            app = getApp();
            // Crucially, get the auth instance from the existing app.
            auth = getAuth(app);
        }
    }
}

// Call initialization on module load.
initializeFirebase();

// Export a function that returns the app instance.
export const getFirebaseApp = (): FirebaseApp => {
    if (!app) {
        initializeFirebase();
    }
    return app;
}

// Export a function that returns the auth instance.
export const getFirebaseAuth = (): Auth => {
    if (!auth) {
        initializeFirebase();
    }
    return auth;
};
