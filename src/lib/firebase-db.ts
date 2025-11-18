
"use client";

import { initializeFirebase } from '@/firebase';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// This function returns the singleton Firestore instance.
export function getFirestoreDb() {
    return getFirestore(initializeFirebase().firebaseApp);
}

// This function returns the singleton Storage instance.
export function getFirebaseStorage() {
    return getStorage(initializeFirebase().firebaseApp);
}

export { initializeFirebase };
    

