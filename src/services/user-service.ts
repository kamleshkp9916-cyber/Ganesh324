
export interface UserProfile {
    name: string;
    username: string;
    avatarUrl: string;
    bannerUrl: string;
    following: number;
    followers: number;
    bio: string;
}

// Mock user profile data
const mockUserProfile: UserProfile = {
    name: 'Samael Prajapati',
    username: '@SamaelPr9916',
    avatarUrl: 'https://placehold.co/100x100.png',
    bannerUrl: 'https://placehold.co/600x200.png',
    following: 541,
    followers: 34,
    bio: 'Sanatan Dharma.',
};

const mockUserPosts = [
    { id: 1, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 1', hint: 'fashion clothing' },
    { id: 2, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 2', hint: 'street style' },
    { id: 3, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 3', hint: 'summer outfit' },
    { id: 4, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 4', hint: 'travel photo' },
    { id: 5, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 5', hint: 'food photography' },
    { id: 6, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 6', hint: 'architectural design' },
];

// Mock API call to get user profile
export async function getUserProfile(userId: string): Promise<UserProfile> {
    console.log(`Fetching profile for user: ${userId}`);
    // In a real app, you would fetch this from a database.
    return new Promise(resolve => setTimeout(() => resolve(mockUserProfile), 500));
}

// Mock API call to get user posts
export function getUserPosts() {
    // In a real app, you would fetch this from a database.
    return mockUserPosts;
}

// Mock API call to update user profile
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    console.log(`Updating profile for user: ${userId}`, profileData);
    // In a real app, you would update this in a database.
    Object.assign(mockUserProfile, profileData);
    return new Promise(resolve => setTimeout(() => resolve(mockUserProfile), 500));
}

    