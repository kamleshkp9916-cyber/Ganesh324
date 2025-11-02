
"use client";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

export const ORDERS_KEY = 'streamcart_orders';

export type Order = {
    orderId: string;
    userId: string;
    products: any[];
    address: any;
    total: number;
    orderDate: string;
    isReturnable: boolean;
    timeline: {
        status: string;
        date: string | null;
        time: string | null;
        completed: boolean;
    }[];
    returnRequest?: any;
};

// --- Mock Data ---
// This object is now empty to clear the default orders.
export const allOrderData: { [key: string]: Order } = {};
// --- End Mock Data ---


export function getStatusFromTimeline(timeline: Order['timeline']): string {
    if (!timeline || timeline.length === 0) {
        return "Pending";
    }

    // Find the last step in the timeline that is marked as completed.
    const lastCompletedStep = [...timeline].reverse().find(step => step && step.completed && typeof step.status === 'string');

    if (lastCompletedStep) {
        // Return the status, stripping any extra info after a colon.
        return lastCompletedStep.status.split(':')[0].trim();
    }

    // If no step is completed, it's still pending.
    return "Pending";
}


export async function getOrderById(orderId: string): Promise<Order | null> {
    if (typeof window === 'undefined') {
        const order = allOrderData[orderId];
        return order || null;
    };

    try {
        const storedOrders = localStorage.getItem(ORDERS_KEY);
        if (storedOrders) {
            const allOrders = JSON.parse(storedOrders);
            const order = allOrders.find((o: Order) => o.orderId === orderId);
            if (order) return order;
        }
        // Fallback to mock data if not found in local storage
        const mockOrder = allOrderData[orderId];
        return mockOrder || null;
    } catch (error) {
        console.error("Error fetching order from local storage:", error);
        return null;
    }
}

export const saveOrder = (order: Order) => {
    if (typeof window === 'undefined') return;
    try {
        const storedOrders = localStorage.getItem(ORDERS_KEY);
        const allOrders = storedOrders ? JSON.parse(storedOrders) : Object.values(allOrderData);
        const newOrders = [order, ...allOrders];
        localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Error saving order to local storage:", error);
    }
};

export const saveAllOrders = (orders: Order[]) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Error saving all orders to local storage:", error);
    }
};

export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<void> => {
     if (typeof window === 'undefined') return;
     try {
        const storedOrders = localStorage.getItem(ORDERS_KEY);
        let allOrders: Order[] = storedOrders ? JSON.parse(storedOrders) : Object.values(allOrderData);
        const orderIndex = allOrders.findIndex(o => o.orderId === orderId);

        if (orderIndex > -1) {
            allOrders[orderIndex].timeline.push({
                status: newStatus,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
                completed: true,
            });
            localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
            window.dispatchEvent(new Event('storage'));
        }
     } catch (error) {
         console.error("Error updating order status in local storage:", error);
     }
}
