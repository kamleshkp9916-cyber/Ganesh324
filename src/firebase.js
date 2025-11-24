/**
 * Minimal firebase helper for this project.
 * Exports:
 *  - initializeFirebase() -> { auth, firestore, functions }
 *  - getFunctionsClient() -> functions instance
 *  - getAuthClient() -> auth instance
 *  - getFirestoreClient() -> firestore instance
 *
 * Uses modular SDK (v9+). Replace config values with env/.env when ready.
 */

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD0gv_2NnS1zPrRE2rgF85fx61pyVLFKUs",
  authDomain: "streamcart-login.firebaseapp.com",
  projectId: "streamcart-login",
  appId: "1:658712603017:web:c0e2fff239fee585659958"
};

let cached = {};

export function initializeFirebase() {
  if (cached.app) return cached;
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const functions = getFunctions(app);
  cached = { app, auth, firestore, functions };
  return cached;
}

export function getFunctionsClient() {
  return initializeFirebase().functions;
}

export function getAuthClient() {
  return initializeFirebase().auth;
}

export function getFirestoreClient() {
  return initializeFirebase().firestore;
}

export default initializeFirebase;
