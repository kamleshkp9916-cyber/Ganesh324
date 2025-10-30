
"use client";

export interface Product {
    id: number;
    key: string; // e.g., 'prod_1'
    name: string;
    price: string;
    imageUrl: string;
    hint: string;
    brand?: string;
    category?: string;
}

export interface CartProduct extends Product {
    quantity: number;
    size?: string;
    color?: string;
}

interface ViewedProduct extends Product {
    viewedAt: number; // Timestamp
}

const WISHLIST_KEY = 'streamcart_wishlist';
const RECENTLY_VIEWED_KEY = 'streamcart_recently_viewed';
export const CART_KEY = 'streamcart_cart';
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
    } else {
        removeFromWishlist(product.id);
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
    items = items.filter(p => p.key !== product.key);

    const newItem: ViewedProduct = { ...product, viewedAt: Date.now() };
    const newItems = [newItem, ...items];
    
    // Optional: limit the number of recently viewed items
    // const limitedItems = newItems.slice(0, 20);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newItems));
};


// --- Cart Functions ---

export const getCart = (): CartProduct[] => {
    if (typeof window === 'undefined') return [];
    const items = localStorage.getItem(CART_KEY);
    return items ? JSON.parse(items) : [];
};

export const saveCart = (cartItems: CartProduct[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    window.dispatchEvent(new Event('storage'));
}

export const isProductInCart = (productId: number, size?: string, color?: string): boolean => {
    const items = getCart();
    return items.some(p => 
        p.id === productId &&
        p.size === size &&
        p.color === color
    );
};

export const addToCart = (product: CartProduct) => {
    const items = getCart();
    const existingProductIndex = items.findIndex(p => 
        p.id === product.id && 
        p.size === product.size && 
        p.color === product.color
    );
    
    if (existingProductIndex > -1) {
        // Product with the same variant exists, update quantity
        items[existingProductIndex].quantity += product.quantity;
    } else {
        // Product is new or a new variant, add it to cart
        items.push({ ...product, quantity: product.quantity || 1 });
    }
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
};


export const removeFromCart = (productId: number, size?: string, color?: string) => {
    const items = getCart();
    const newItems = items.filter(p => 
        p.id !== productId || p.size !== size || p.color !== color
    );
    localStorage.setItem(CART_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new Event('storage'));
};

export const updateCartQuantity = (productId: number, quantity: number, size?: string, color?: string) => {
    const items = getCart();
    const productIndex = items.findIndex(p => 
        p.id === productId && 
        p.size === size && 
        p.color === color
    );
    
    if (productIndex > -1) {
        if (quantity > 0) {
            items[productIndex].quantity = quantity;
        } else {
            // Remove if quantity is 0 or less
            items.splice(productIndex, 1);
        }
    }
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('storage'));
};

    
