
"use client";

// This is a mock database for user data, including follower/following counts.
// In a real application, this would be a proper database (e.g., Firestore).

export interface UserData {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    role: 'customer' | 'seller';
    followers: number;
    following: number;
    bio: string;
    location: string;
    phone: string;
    addresses: any[];
}

const generateRandomUser = (uid: string, initialDetails: Partial<UserData>): UserData => {
  return {
    uid: uid,
    displayName: initialDetails.displayName || "Anonymous User",
    email: initialDetails.email || "anonymous@example.com",
    photoURL: initialDetails.photoURL || `https://placehold.co/128x128.png?text=${(initialDetails.displayName || 'A').charAt(0)}`,
    role: initialDetails.role || 'customer',
    followers: Math.floor(Math.random() * 20000),
    following: Math.floor(Math.random() * 500),
    bio: "Live selling enthusiast. Love finding great deals!",
    location: "New York, USA",
    phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    addresses: [
      {
        id: 1,
        name: initialDetails.displayName,
        village: "Koregaon Park",
        district: "Pune",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        pincode: "411001",
        phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`
      }
    ]
  };
};

const getGlobalUserData = (): Record<string, UserData> => {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem('globalUserData');
    return data ? JSON.parse(data) : {};
};

const setGlobalUserData = (data: Record<string, UserData>) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('globalUserData', JSON.stringify(data));
};

export const getUserData = (uid: string, initialDetails: Partial<UserData> = {}): UserData => {
    const allUsers = getGlobalUserData();
    if (allUsers[uid]) {
        return allUsers[uid];
    }
    const newUser = generateRandomUser(uid, initialDetails);
    allUsers[uid] = newUser;
    setGlobalUserData(allUsers);
    return newUser;
};

export const updateUserData = (uid: string, updates: Partial<UserData>) => {
    const allUsers = getGlobalUserData();
    if (allUsers[uid]) {
        allUsers[uid] = { ...allUsers[uid], ...updates };
        setGlobalUserData(allUsers);
    }
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
        currentUser.following -= 1;
        targetUser.followers -= 1;
    } else {
        // Follow
        followingList.push(targetUserId);
        currentUser.following += 1;
        targetUser.followers += 1;
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
        const followingKey = `following_${userId}`;
        const followingList: string[] = JSON.parse(localStorage.getItem(followingKey) || '[]');
        if (followingList.includes(targetUserId)) {
            followerList.push(allUsers[userId]);
        }
    }
    
    return followerList;
};
