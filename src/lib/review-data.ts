
"use client";

import { formatDistanceToNow } from 'date-fns';

export interface Review {
    id: number;
    author: string;
    avatar: string;
    rating: number;
    text: string;
    date: string; // ISO string
    productName: string;
    imageUrl: string | null;
    hint?: string;
    productInfo?: string;
    paymentMethod?: { type: string, provider?: string };
}

const REVIEWS_KEY = 'streamcart_reviews';

const getAllReviews = (): { [productId: string]: Review[] } => {
    if (typeof window === 'undefined') return {};
    const items = localStorage.getItem(REVIEWS_KEY);
    return items ? JSON.parse(items) : {};
};

export const getReviews = (productId: string): Review[] => {
    const allReviews = getAllReviews();
    return allReviews[productId] || [];
};

export const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    const allReviews = getAllReviews();
    const productReviews = allReviews[productId] || [];
    
    const newReview: Review = {
        ...review,
        id: Date.now(),
        date: new Date().toISOString(),
    };

    const updatedProductReviews = [newReview, ...productReviews];
    allReviews[productId] = updatedProductReviews;

    localStorage.setItem(REVIEWS_KEY, JSON.stringify(allReviews));
    
    // Dispatch a storage event to notify other tabs/pages (like the product detail page)
    window.dispatchEvent(new StorageEvent('storage', { key: REVIEWS_KEY }));
};
