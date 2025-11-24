
'use server';

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import type { UserData } from "./follow-data";

function getFirebaseAdminApp(): App {
    if (getApps().length > 0) {
        return getApps()[0];
    }
    
    // Check if essential environment variables are set.
    if (
        !process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY
    ) {
        // In a production environment, this should throw an error.
        // For local development, we might have a fallback but it's better to enforce it.
        console.error("Firebase server environment variables are not set.");
        // We can't initialize without credentials, so we throw.
        throw new Error("Firebase server environment variables are not fully configured.");
    }

    // The private key needs to have its newlines restored.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    return initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: privateKey,
        }),
    });
}

export { getFirebaseAdminApp };


export const updateUserDataOnServer = async (uid: string, updates: Partial<UserData>): Promise<void> => {
    if (!uid) return;
    getFirebaseAdminApp();
    const db = getAdminFirestore();
    const userDocRef = db.collection("users").doc(uid);
    await userDocRef.update(updates);
};
