
"use client";

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, writeBatch, increment, limit, serverTimestamp } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase-db";
import { User } from "firebase/auth";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


export interface UserData {
    uid: string;
    userId?: string; // The @handle
    publicId?: string; // The C-0001 ID
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
    color: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected' | 'needs-resubmission';
    rejectionReason?: string;
    resubmissionReason?: string;
    stepsToFix?: string[];
    lastLogin?: any; // Can be a server timestamp
    // Social links
    instagram?: string;
    twitter?: string;
    youtube?: string;
    facebook?: string;
    twitch?: string;
    // KYC fields
    bank?: {
      ifsc: string;
      acct: string;
      name: string;
    };
    upi?: {
      id: string;
    };
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
    createdAt?: any;
    blockedPaths?: string[];
}

const defaultUserData = (uid: string, defaults?: Partial<User>): Partial<UserData> => ({
    uid,
    displayName: defaults?.displayName || 'New User',
    email: defaults?.email || '',
    photoURL: defaults?.photoURL || `https://placehold.co/128x128.png?text=${(defaults?.displayName || 'U').charAt(0)}`,
    role: 'customer',
    kycStatus: 'verified', // Customers are verified by default
    followers: 0,
    following: 0,
    bio: "",
    location: "",
    phone: "",
    addresses: [],
    color: '#ffffff',
});

const mockSellers: Record<string, UserData> = {
    'fashionfinds-uid': { uid: 'fashionfinds-uid', publicId: 'S-0001', displayName: 'FashionFinds', email: 'fashion@finds.com', photoURL: 'https://placehold.co/128x128.png?text=F', role: 'seller', followers: 1200, following: 150, bio: 'Curator of vintage and modern fashion.', location: 'Paris, France', phone: '', addresses: [], color: '#ffffff', instagram: 'https://instagram.com/fashionfinds', verificationStatus: 'verified' },
    'gadgetguru-uid': { uid: 'gadgetguru-uid', publicId: 'S-0002', displayName: 'GadgetGuru', email: 'guru@gadgets.com', photoURL: 'https://placehold.co/128x128.png?text=G', role: 'seller', followers: 2500, following: 50, bio: 'Latest and greatest in tech reviewed.', location: 'San Francisco, USA', phone: '', addresses: [], color: '#ffffff', twitter: 'https://twitter.com/gadgetguru', verificationStatus: 'pending' },
    'homehaven-uid': { uid: 'homehaven-uid', publicId: 'S-0003', displayName: 'HomeHaven', email: 'contact@homehaven.com', photoURL: 'https://placehold.co/128x128.png?text=H', role: 'seller', followers: 850, following: 200, bio: 'Making your house a home, one decor piece at a time.', location: 'Stockholm, Sweden', phone: '', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
    'beautybox-uid': { uid: 'beautybox-uid', publicId: 'S-0004', displayName: 'BeautyBox', email: 'info@beautybox.com', photoURL: 'https://placehold.co/128x128.png?text=B', role: 'seller', followers: 3100, following: 80, bio: 'Your one-stop shop for cosmetics and skincare.', location: 'Seoul, South Korea', phone: '', addresses: [], color: '#ffffff', youtube: 'https://youtube.com/beautybox', verificationStatus: 'needs-resubmission', resubmissionReason: 'Your bank account could not be verified. Please double-check the details.', stepsToFix: ['bank'] },
    'kitchenwiz-uid': { uid: 'kitchenwiz-uid', publicId: 'S-0005', displayName: 'KitchenWiz', email: 'support@kitchenwiz.com', photoURL: 'https://placehold.co/128x128.png?text=K', role: 'seller', followers: 975, following: 120, bio: 'Innovative tools for the modern chef.', location: 'Milan, Italy', phone: '', addresses: [], color: '#ffffff', verificationStatus: 'rejected', rejectionReason: 'Violation of community guidelines.' },
    'fitflow-uid': { uid: 'fitflow-uid', publicId: 'S-0006', displayName: 'FitFlow', email: 'getfit@fitflow.com', photoURL: 'https://placehold.co/128x128.png?text=F', role: 'seller', followers: 1500, following: 300, bio: 'Activewear and equipment for your fitness journey.', location: 'Los Angeles, USA', phone: '', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
    'artisanalley-uid': { uid: 'artisanalley-uid', publicId: 'S-0007', displayName: 'ArtisanAlley', email: 'hello@artisanalley.com', photoURL: 'https://placehold.co/128x128.png?text=A', role: 'seller', followers: 450, following: 450, bio: 'Handcrafted goods with a story.', location: 'Kyoto, Japan', phone: '', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
    'petpalace-uid': { uid: 'petpalace-uid', publicId: 'S-0008', displayName: 'PetPalace', email: 'woof@petpalace.com', photoURL: 'https://placehold.co/128x128.png?text=P', role: 'seller', followers: 1800, following: 220, bio: 'Everything your furry friends could ever want.', location: 'London, UK', phone: '', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
    'booknook-uid': { uid: 'booknook-uid', publicId: 'S-0009', displayName: 'BookNook', email: 'read@booknook.com', photoURL: 'https://placehold.co/128x128.png?text=B', role: 'seller', followers: 620, following: 500, bio: 'A cozy corner for book lovers.', location: 'Edinburgh, Scotland', phone: '', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
    'gamerguild-uid': { uid: 'gamerguild-uid', publicId: 'S-0010', displayName: 'GamerGuild', email: 'gg@gamerguild.com', photoURL: 'https://placehold.co/128x128.png?text=G', role: 'seller', followers: 4200, following: 10, bio: 'Top-tier gaming gear and accessories.', location: 'Taipei, Taiwan', phone: '', addresses: [], color: '#ffffff', twitch: 'https://twitch.tv/gamerguild', verificationStatus: 'pending' },
    'mockUser1': { uid: 'mockUser1', displayName: 'Ganesh Prajapati', email: 'ganeshpr829133@gmail.com', photoURL: 'https://placehold.co/128x128.png?text=G', role: 'customer', kycStatus: 'verified', followers: 10, following: 25, bio: 'Love finding unique items!', location: 'Pune, India', phone: '9876543210', addresses: [{ id: 1, name: 'Ganesh Prajapati', village: '123 Sunshine Apts', city: 'Pune', state: 'MH', pincode: '411001', phone: '9876543210' }], color: '#ffffff', verificationStatus: 'verified' },
    'mockUser2': { uid: 'mockUser2', displayName: 'Peter Jones', email: 'peter.j@example.com', photoURL: 'https://placehold.co/128x128.png?text=P', role: 'customer', kycStatus: 'verified', followers: 5, following: 12, bio: '', location: 'Jaipur, India', phone: '9876543213', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
    'mockUser3': { uid: 'mockUser3', displayName: 'Jessica Rodriguez', email: 'jessica.r@example.com', photoURL: 'https://placehold.co/128x128.png?text=J', role: 'customer', kycStatus: 'verified', followers: 22, following: 40, bio: 'Tech and home decor enthusiast.', location: 'Chennai, India', phone: '9876543214', addresses: [], color: '#ffffff', verificationStatus: 'pending' },
};

// Function to get a list of all mock users (sellers and customers)
export const getMockSellers = (): UserData[] => {
    return Object.values(mockSellers);
};

export const getUserData = async (uid: string): Promise<UserData | null> => {
    if (!uid) return null;
    try {
        const db = getFirestoreDb();
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return { ...userDoc.data(), uid: userDoc.id } as UserData;
        } else {
            // Fallback to mock data if not found in Firestore
            if (mockSellers[uid]) {
                return mockSellers[uid];
            }
            console.warn(`No user document or mock data found for UID: ${uid}.`);
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        // Fallback to mock data on error as well
        if (mockSellers[uid]) {
            return mockSellers[uid];
        }
        return null;
    }
};

export const updateUserData = async (uid: string, updates: Partial<UserData>): Promise<void> => {
    if (!uid) return;
    const db = getFirestoreDb();
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, updates, { merge: true });
};

export const createUserData = async (user: User, role: 'customer' | 'seller' | 'admin', additionalData: Partial<UserData> = {}): Promise<void> => {
    const db = getFirestoreDb();
    const userDocRef = doc(db, "users", user.uid);
    
    const ADMIN_EMAILS = ["kamleshkp9916@gmail.com"];

    let userRole = role;
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
        userRole = 'admin';
    }

    const userData: UserData = {
        ...defaultUserData(user.uid, user),
        uid: user.uid, // Ensure uid is explicitly set on the top level
        role: userRole,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        kycStatus: userRole === 'customer' ? 'verified' : additionalData.kycStatus || 'pending',
        ...additionalData,
    } as UserData;
    
    delete (userData as any).password;
    delete (userData as any).confirmPassword;

    try {
        // Use a standard `await` to ensure the operation completes and to catch errors.
        await setDoc(userDocRef, userData, { merge: true });
    } catch (error) {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'create',
            requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Error creating user data:", permissionError);
        throw permissionError; // Re-throw the rich error
    }
};


export const toggleFollow = async (currentUserId: string, targetUserId: string) => {
    const db = getFirestoreDb();
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    const followDocRef = doc(db, `users/${currentUserId}/following`, targetUserId);
    
    const followDoc = await getDoc(followDocRef);
    const batch = writeBatch(db);

    if (followDoc.exists()) {
        batch.delete(followDocRef);
        batch.update(currentUserRef, { following: increment(-1) });
        batch.update(targetUserRef, { followers: increment(-1) });
    } else {
        batch.set(followDocRef, { followedAt: new Date() });
        batch.update(currentUserRef, { following: increment(1) });
        batch.update(targetUserRef, { followers: increment(1) });
    }
    
    await batch.commit();
};

export const getFollowers = async (targetUserId: string): Promise<UserData[]> => {
    const db = getFirestoreDb();
    const usersCollection = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersCollection);
    const followers: UserData[] = [];

    for (const userDoc of allUsersSnapshot.docs) {
        const userId = userDoc.id;
        if (userId === targetUserId) continue;
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

export const getUserByDisplayName = async (displayName: string): Promise<UserData | null> => {
    const db = getFirestoreDb();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("displayName", "==", displayName), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        const mockUser = Object.values(mockSellers).find(u => u.displayName === displayName);
        return mockUser || null;
    }
    return querySnapshot.docs[0].data() as UserData;
};

export { getOrCreateConversation } from '@/ai/flows/chat-flow';
