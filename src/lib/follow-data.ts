
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

const initializeGlobalUserData = (): Record<string, UserData> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem('globalUserData');
    if (data) return JSON.parse(data);

    // If no data exists, initialize with the admin user.
    const initialAdmin: UserData = {
        uid: 'admin_uid_placeholder', // This will be updated on first admin login
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

    const initialData = { [initialAdmin.email]: initialAdmin }; // Use email as temporary key before UID is available
    localStorage.setItem('globalUserData', JSON.stringify(initialData));
    return initialData;
};


const getGlobalUserData = (): Record<string, UserData> => {
    if (typeof window === 'undefined') return {};
    return initializeGlobalUserData();
};

const setGlobalUserData = (data: Record<string, UserData>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('globalUserData', JSON.stringify(data));
};

export const getUserData = (uid: string): UserData => {
    const allUsers = getGlobalUserData();
    
    // Find user by UID
    const existingUser = allUsers[uid];
    if(existingUser) return existingUser;
    
    // Fallback for admin user whose UID might not be set yet
    if (uid === 'admin_uid_placeholder') {
        const adminUser = Object.values(allUsers).find(u => u.role === 'admin');
        if (adminUser) return adminUser;
    }
    
    // If no user is found, it means they are new or data is missing.
    // The creation/update should be handled by `updateUserData`.
    // Returning a default customer profile to avoid errors.
    return {
        uid,
        displayName: 'New User',
        email: '',
        photoURL: `https://placehold.co/128x128.png?text=U`,
        role: 'customer',
        followers: 0,
        following: 0,
        bio: "",
        location: "",
        phone: "",
        addresses: []
    };
};

export const updateUserData = (uid: string, updates: Partial<UserData>) => {
    const allUsers = getGlobalUserData();
    
    // The primary key for our mock db is the UID.
    const keyToUpdate = uid;
    
    const existingData = allUsers[keyToUpdate] || {};

    const finalData = { ...existingData, ...updates, uid: uid };

    // Don't downgrade a seller to a customer on google sign-in
    if(existingData.role === 'seller' && updates.role === 'customer') {
        finalData.role = 'seller';
    }
    
    allUsers[keyToUpdate] = finalData
    
    setGlobalUserData(allUsers);
};


export const toggleFollow = (currentUserId: string, targetUserId: string) => {
    if (typeof window === 'undefined') return;

    // --- Manage Current User's Following List ---
    const followingKey = `following_${currentUserId}`;
    let followingList: string[] = JSON.parse(localStorage.getItem(followingKey) || '[]');
    const isCurrentlyFollowing = followingList.includes(targetUserId);

    let currentUser = getUserData(currentUserId);
    let targetUser = getUserData(targetUserId);

    if (isCurrentlyFollowing) {
        // Unfollow
        followingList = followingList.filter(id => id !== targetUserId);
        currentUser.following = Math.max(0, (currentUser.following || 0) - 1);
        targetUser.followers = Math.max(0, (targetUser.followers || 0) - 1);
    } else {
        // Follow
        followingList.push(targetUserId);
        currentUser.following = (currentUser.following || 0) + 1;
        targetUser.followers = (targetUser.followers || 0) + 1;
    }

    localStorage.setItem(followingKey, JSON.stringify(followingList));
    updateUserData(currentUserId, { following: currentUser.following });
    updateUserData(targetUserId, { followers: targetUser.followers });
    
    // Dispatch a storage event to notify other components/tabs
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
