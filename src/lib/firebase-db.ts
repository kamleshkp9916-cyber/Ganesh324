
"use client";

import { initializeFirebase } from '@/firebase';
import { getFirestore } from 'firebase/firestore';

// This function returns the singleton Firestore instance.
export function getFirestoreDb() {
    return getFirestore(initializeFirebase().firebaseApp);
}

    