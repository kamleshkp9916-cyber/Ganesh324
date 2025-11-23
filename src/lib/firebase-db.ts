
"use client";

import { getFirebaseApp } from '@/firebase/config';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// This function returns the singleton Firestore instance.
export function getFirestoreDb() {
    return getFirestore(getFirebaseApp());
}

// This function returns the singleton Storage instance.
export function getFirebaseStorage() {
    return getStorage(getFirebaseApp());
}
