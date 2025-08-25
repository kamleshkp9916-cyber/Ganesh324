
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

function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
            auth = initializeAuth(app, {
                persistence: browserLocalPersistence
            });
        } else {
            app = getApp();
            // This ensures we get the auth instance associated with the app,
            // which is crucial in a Next.js environment with Fast Refresh.
            auth = getAuth(app);
        }
    }
}

// Initialize on load to be ready for other parts of the app
initializeFirebase();


export const getFirebaseApp = (): FirebaseApp => {
    if (!app) {
        initializeFirebase();
    }
    return app;
}

export const getFirebaseAuth = (): Auth => {
    if (!auth) {
        initializeFirebase();
    }
    return auth;
};
