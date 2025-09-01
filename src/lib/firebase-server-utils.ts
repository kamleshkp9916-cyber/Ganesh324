
'use server';

import { getFirebaseAdminApp } from "./firebase-server";
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import type { UserData } from "./follow-data";

export const updateUserDataOnServer = async (uid: string, updates: Partial<UserData>): Promise<void> => {
    if (!uid) return;
    getFirebaseAdminApp();
    const db = getAdminFirestore();
    const userDocRef = db.collection("users").doc(uid);
    await userDocRef.update(updates);
};
