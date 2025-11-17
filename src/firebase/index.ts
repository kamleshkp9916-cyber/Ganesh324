'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';

let app: FirebaseApp;

if (getApps().length === 0) {
  try {
    app = initializeApp();
  } catch (e) {
    app = initializeApp(firebaseConfig);
  }
} else {
  app = getApp();
}

const auth = getAuth(app);
const firestore = getFirestore(app);

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  return {
    firebaseApp: app,
    auth: auth,
    firestore: firestore,
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
