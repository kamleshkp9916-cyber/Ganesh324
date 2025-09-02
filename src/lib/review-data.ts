

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
    productId: string; // Add productId to link back
    imageUrl: string | null;
    hint?: string;
    productInfo?: string;
    paymentMethod?: { type: string, provider?: string };
    userId?: string; // Add userId to link review to a user
}

const REVIEWS_KEY = 'streamcart_reviews';

const getAllReviews = (): { [productId: string]: Review[] } => {
    if (typeof window === 'undefined') return {};
    const items = localStorage.getItem(REVIEWS_KEY);
    return items ? JSON.parse(items) : {};
};

const saveAllReviews = (reviews: { [productId: string]: Review[] }) => {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new StorageEvent('storage', { key: REVIEWS_KEY }));
};

export const getReviews = (productId: string): Review[] => {
    const allReviews = getAllReviews();
    return allReviews[productId] || [];
};

export const getUserReviews = (userId: string): Review[] => {
    const allReviews = getAllReviews();
    const userReviews: Review[] = [];

    for (const productId in allReviews) {
        const productReviews = allReviews[productId];
        const reviewsByUser = productReviews.filter(r => r.userId === userId);
        userReviews.push(...reviewsByUser);
    }
    // Sort by most recent first
    return userReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};


export const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    const allReviews = getAllReviews();
    const productReviews = allReviews[productId] || [];
    
    const newReview: Review = {
        ...review,
        id: Date.now(),
        date: new Date().toISOString(),
        productId: productId,
    };

    const updatedProductReviews = [newReview, ...productReviews];
    allReviews[productId] = updatedProductReviews;

    saveAllReviews(allReviews);
};

export const updateReview = (productId: string, updatedReview: Review) => {
    const allReviews = getAllReviews();
    const productReviews = allReviews[productId] || [];
    const reviewIndex = productReviews.findIndex(r => r.id === updatedReview.id);

    if (reviewIndex !== -1) {
        productReviews[reviewIndex] = { ...updatedReview, productId };
        allReviews[productId] = productReviews;
        saveAllReviews(allReviews);
    } else {
        // If for some reason it doesn't exist, add it.
        addReview(productId, updatedReview);
    }
};

export const deleteReview = (productId: string, reviewId: number) => {
    const allReviews = getAllReviews();
    let productReviews = allReviews[productId] || [];
    
    productReviews = productReviews.filter(r => r.id !== reviewId);

    if (productReviews.length > 0) {
        allReviews[productId] = productReviews;
    } else {
        delete allReviews[productId];
    }
    
    saveAllReviews(allReviews);
};
