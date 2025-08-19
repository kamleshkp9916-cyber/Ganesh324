
"use client";

export interface Product {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    hint: string;
}

interface ViewedProduct extends Product {
    viewedAt: number; // Timestamp
}

const WISHLIST_KEY = 'streamcart_wishlist';
const RECENTLY_VIEWED_KEY = 'streamcart_recently_viewed';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

// --- Wishlist Functions ---

export const getWishlist = (): Product[] => {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem(WISHLIST_KEY);
    return items ? JSON.parse(items) : [];
};

export const addToWishlist = (product: Product) => {
    const items = getWishlist();
    if (!items.find(p => p.id === product.id)) {
        const newItems = [...items, product];
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems));
    }
};

export const removeFromWishlist = (productId: number) => {
    const items = getWishlist();
    const newItems = items.filter(p => p.id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(newItems));
};

export const isWishlisted = (productId: number): boolean => {
    const items = getWishlist();
    return items.some(p => p.id === productId);
};


// --- Recently Viewed Functions ---

export const getRecentlyViewed = (): Product[] => {
    if (typeof window === 'undefined') return [];
    const itemsJSON = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!itemsJSON) return [];
    
    const items: ViewedProduct[] = JSON.parse(itemsJSON);
    const now = Date.now();

    const validItems = items.filter(item => (now - item.viewedAt) < TWENTY_FOUR_HOURS_IN_MS);

    // If there was a change (expired items were removed), update localStorage
    if (validItems.length !== items.length) {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(validItems));
    }
    
    return validItems;
};

export const addRecentlyViewed = (product: Product) => {
    let items = getRecentlyViewed() as ViewedProduct[];
    
    // Remove existing entry if it's already there to move it to the top
    items = items.filter(p => p.id !== product.id);

    const newItem: ViewedProduct = { ...product, viewedAt: Date.now() };
    const newItems = [newItem, ...items];
    
    // Optional: limit the number of recently viewed items
    // const limitedItems = newItems.slice(0, 20);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
};
