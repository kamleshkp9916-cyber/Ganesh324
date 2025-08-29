
"use client";

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, increment } from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import type { User } from "firebase/auth";

export interface UserData {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: 'customer' | 'seller' | 'admin';
    followers: number;
    following: number;
    bio: string;
    location: string;
    phone: string;
    addresses: any[];
    verificationStatus?: 'pending' | 'verified' | 'rejected' | 'needs-resubmission';
}

const defaultUserData = (uid: string, defaults?: Partial<User>): Partial<UserData> => ({
    uid,
    displayName: defaults?.displayName || 'New User',
    email: defaults?.email || '',
    photoURL: defaults?.photoURL || `https://placehold.co/128x128.png?text=${(defaults?.displayName || 'U').charAt(0)}`,
    role: 'customer',
    followers: 0,
    following: 0,
    bio: "",
    location: "",
    phone: "",
    addresses: []
});

export const getUserData = async (uid: string, defaults?: Partial<User>): Promise<UserData | null> => {
    if (!uid) return null;
    try {
        const db = getFirestoreDb();
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data() as UserData;
        } else {
            if (defaults) {
                // If user doesn't exist, create them with defaults (e.g., on first sign-in)
                const newUser = defaultUserData(uid, defaults);
                await setDoc(userDocRef, newUser);
                return newUser as UserData;
            }
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
};

export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
    if (!uid) return;
    const db = getFirestoreDb();
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, updates);
};

export const createUserData = async (user: User, role: 'customer' | 'seller', additionalData: Partial<UserData> = {}): Promise<void> => {
    const db = getFirestoreDb();
    const userDocRef = doc(db, "users", user.uid);
    const userData: UserData = {
        ...defaultUserData(user.uid, user),
        role,
        ...additionalData,
    } as UserData;
    await setDoc(userDocRef, userData);
};


export const toggleFollow = async (currentUserId: string, targetUserId: string) => {
    const db = getFirestoreDb();
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    const followDocRef = doc(db, `users/${currentUserId}/following`, targetUserId);
    
    const followDoc = await getDoc(followDocRef);
    const batch = writeBatch(db);

    if (followDoc.exists()) {
        // Unfollow
        batch.delete(followDocRef);
        batch.update(currentUserRef, { following: increment(-1) });
        batch.update(targetUserRef, { followers: increment(-1) });
    } else {
        // Follow
        batch.set(followDocRef, { followedAt: new Date() });
        batch.update(currentUserRef, { following: increment(1) });
        batch.update(targetUserRef, { followers: increment(1) });
    }
    
    await batch.commit();
};

export const getFollowers = async (targetUserId: string): Promise<UserData[]> => {
    const db = getFirestoreDb();
    // This is not efficient for large scale, but works for a demo.
    // A real app would use a subcollection on the target user listing their followers.
    const usersCollection = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersCollection);
    const followers: UserData[] = [];

    for (const userDoc of allUsersSnapshot.docs) {
        const userId = userDoc.id;
        const followingRef = doc(db, `users/${userId}/following`, targetUserId);
        const followingDoc = await getDoc(followingRef);
        if (followingDoc.exists()) {
            followers.push(userDoc.data() as UserData);
        }
    }
    
    return followers;
};

export const getFollowing = async (userId: string): Promise<UserData[]> => {
    const db = getFirestoreDb();
    const followingCollectionRef = collection(db, `users/${userId}/following`);
    const followingSnapshot = await getDocs(followingCollectionRef);
    const followingIds = followingSnapshot.docs.map(doc => doc.id);
    
    if (followingIds.length === 0) return [];
    
    const usersQuery = query(collection(db, 'users'), where('uid', 'in', followingIds));
    const usersSnapshot = await getDocs(usersQuery);
    
    return usersSnapshot.docs.map(doc => doc.data() as UserData);
}

export const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
    const db = getFirestoreDb();
    const followDocRef = doc(db, `users/${currentUserId}/following`, targetUserId);
    const followDoc = await getDoc(followDocRef);
    return followDoc.exists();
};
