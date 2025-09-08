
"use client";

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, increment, limit } from "firebase/firestore";
import { getFirestoreDb } from "./firebase";
import type { User } from "firebase/auth";

export interface UserData {
    uid: string;
    userId?: string; // The @handle
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
    rejectionReason?: string;
    resubmissionReason?: string;
    // KYC fields
    kycStatus?: 'verified' | 'pending' | 'rejected';
    kycType?: string;
    verifiedAt?: string;
    maskedData?: {
        aadhaar: string;
        pan: string;
    };
    // seller specific fields
    businessName?: string;
    aadhar?: string;
    pan?: string;
    accountNumber?: string;
    ifsc?: string;
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

export const getUserData = async (uid: string): Promise<UserData | null> => {
    if (!uid) return null;
    try {
        const db = getFirestoreDb();
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data() as UserData;
        } else {
            console.warn(`No user document found for UID: ${uid}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
};

export const getUserByDisplayName = async (displayName: string): Promise<UserData | null> => {
    if (!displayName) return null;
    try {
        const db = getFirestoreDb();
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", displayName), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as UserData;
        } else {
            console.warn(`No user found with displayName: ${displayName}`);
            return null;
        }
    } catch (error) {
        console.error("Error getting user by display name:", error);
        return null;
    }
};


export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
    if (!uid) return;
    const db = getFirestoreDb();
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, updates);
};

export const createUserData = async (user: User, role: 'customer' | 'seller' | 'admin', additionalData: Partial<UserData> = {}): Promise<void> => {
    const db = getFirestoreDb();
    const userDocRef = doc(db, "users", user.uid);
    const userData: UserData = {
        ...defaultUserData(user.uid, user),
        role, // Use the role passed to the function
        ...additionalData,
    } as UserData;
    
    // Explicitly remove sensitive fields before saving to Firestore
    delete (userData as any).password;
    delete (userData as any).confirmPassword;
    delete (userData as any).aadharOtp;
    delete (userData as any).passportPhoto;
    delete (userData as any).signature;
    delete (userData as any).aadhar;
    delete (userData as any).pan;

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
        if (userId === targetUserId) continue; // A user can't follow themselves in this logic
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
    if (currentUserId === targetUserId) return false;
    const db = getFirestoreDb();
    const followDocRef = doc(db, `users/${currentUserId}/following`, targetUserId);
    const followDoc = await getDoc(followDocRef);
    return followDoc.exists();
};
