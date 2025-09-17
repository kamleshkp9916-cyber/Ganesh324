

"use client";

// --- Saved Posts Functions ---

const SAVED_POSTS_KEY = 'streamcart_saved_posts';

export const getSavedPosts = (): any[] => {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem(SAVED_POSTS_KEY);
    // Ensure we always return an array, even if localStorage is empty
    return items ? JSON.parse(items) : [];
};

export const isPostSaved = (postId: string): boolean => {
    const items = getSavedPosts();
    return items.some(p => p.id === postId);
};

export const toggleSavePost = (post: any) => {
    const items = getSavedPosts();
    const existingIndex = items.findIndex(p => p.id === post.id);

    if (existingIndex > -1) {
        // Post is already saved, so remove it
        items.splice(existingIndex, 1);
    } else {
        // Post is not saved, so add it to the beginning
        items.unshift(post);
    }

    localStorage.setItem(SAVED_POSTS_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('storage')); // Notify other components of the change
};
