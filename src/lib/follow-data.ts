
"use client";

// This is a mock database for user data, including roles and follower/following counts.
// In a real application, this would be a proper database (e.g., Firestore).

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
}


const getGlobalUserData = (): Record<string, UserData> => {
    if (typeof window === 'undefined') {
        return {};
    }
    const data = localStorage.getItem('globalUserData');
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Failed to parse globalUserData from localStorage", e);
            return {};
        }
    }
    return {};
};

const setGlobalUserData = (data: Record<string, UserData>) => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        localStorage.setItem('globalUserData', JSON.stringify(data));
    } catch (e) {
        console.error("Failed to set globalUserData in localStorage", e);
    }
};

const initializeAdminUserIfNeeded = () => {
    const allUsers = getGlobalUserData();
    const adminExists = Object.values(allUsers).some(u => u.role === 'admin');

    if (!adminExists) {
        const initialAdmin: UserData = {
            uid: 'admin_uid_placeholder',
            displayName: 'Samael Prajapati',
            email: 'samael.prajapati@example.com',
            photoURL: `https://placehold.co/128x128.png?text=A`,
            role: 'admin',
            followers: 1500,
            following: 25,
            bio: "Overseeing the StreamCart platform.",
            location: "Pune, India",
            phone: "+91 9999988888",
            addresses: []
        };
        allUsers[initialAdmin.email] = initialAdmin; // Use email as a temporary key
        setGlobalUserData(allUsers);
    }
}


export const getUserData = (uid: string, defaults?: Partial<UserData>): UserData => {
    if (typeof window === 'undefined') {
        return {
            uid: uid,
            displayName: defaults?.displayName || 'New User',
            email: defaults?.email || '',
            photoURL: defaults?.photoURL || '',
            role: 'customer',
            followers: 0,
            following: 0,
            bio: "",
            location: "",
            phone: "",
            addresses: []
        };
    }
    initializeAdminUserIfNeeded();
    const allUsers = getGlobalUserData();
    
    // Find user by UID
    const existingUser = allUsers[uid];
    if(existingUser) return existingUser;
    
    // Fallback for admin user whose UID might not be set yet
    if (uid === 'admin_uid_placeholder') {
        const adminUser = Object.values(allUsers).find(u => u.role === 'admin');
        if (adminUser) return adminUser;
    }
    
    return {
        uid,
        displayName: defaults?.displayName || 'New User',
        email: defaults?.email || '',
        photoURL: defaults?.photoURL || `https://placehold.co/128x128.png?text=U`,
        role: defaults?.role || 'customer',
        followers: 0,
        following: 0,
        bio: "",
        location: "",
        phone: "",
        addresses: []
    };
};

export const updateUserData = (uid: string, updates: Partial<UserData>) => {
    if (typeof window === 'undefined') return;
    
    const allUsers = getGlobalUserData();
    const keyToUpdate = uid;
    
    const existingData = allUsers[keyToUpdate] || {};
    const finalData = { ...existingData, ...updates, uid: uid };

    if(existingData.role === 'seller' && updates.role === 'customer') {
        finalData.role = 'seller';
    }
    
    allUsers[keyToUpdate] = finalData
    setGlobalUserData(allUsers);
};


export const toggleFollow = (currentUserId: string, targetUserId: string) => {
    if (typeof window === 'undefined') return;

    const followingKey = `following_${currentUserId}`;
    let followingList: string[] = JSON.parse(localStorage.getItem(followingKey) || '[]');
    const isCurrentlyFollowing = followingList.includes(targetUserId);

    let currentUser = getUserData(currentUserId);
    let targetUser = getUserData(targetUserId);

    if (isCurrentlyFollowing) {
        followingList = followingList.filter(id => id !== targetUserId);
        currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
        targetUser.followers = Math.max(0, (targetUser.followers || 0) - 1);
    } else {
        followingList.push(targetUserId);
        currentUser.following = (currentUser.following || 0) + 1;
        targetUser.followers = (targetUser.followers || 0) + 1;
    }

    localStorage.setItem(followingKey, JSON.stringify(followingList));
    updateUserData(currentUserId, { following: currentUser.following });
    updateUserData(targetUserId, { followers: targetUser.followers });
    
    window.dispatchEvent(new StorageEvent('storage', { key: 'globalUserData' }));
};

export const getFollowers = (targetUserId: string): UserData[] => {
    if (typeof window === 'undefined') return [];
    
    const allUsers = getGlobalUserData();
    const followerList: UserData[] = [];

    for (const userId in allUsers) {
        const user = allUsers[userId];
        if (user && user.uid) {
             const followingKey = `following_${user.uid}`;
             const followingList: string[] = JSON.parse(localStorage.getItem(followingKey) || '[]');
             if (followingList.includes(targetUserId)) {
                followerList.push(user);
            }
        }
    }
    
    return followerList;
};
