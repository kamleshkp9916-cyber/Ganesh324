
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
export const allOrderData: { [key: string]: Order } = {
    '#STREAM619732': {
        orderId: '#STREAM619732',
        userId: 'mockUser1',
        products: [{ id: 1, key: 'prod_1', name: 'Vintage Camera', imageUrl: 'https://placehold.co/100x100.png', price: '₹12,500.00', quantity: 1, hint: "vintage camera" }],
        address: { name: 'Ganesh P', city: 'Pune', pincode: '411001' },
        total: 12500.00,
        orderDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        isReturnable: true,
        timeline: [
            { status: 'Pending', date: 'Nov 01, 2025', time: '10:30 PM', completed: true },
            { status: 'Order Confirmed', date: 'Nov 01, 2025', time: '10:31 PM', completed: true },
            { status: 'Packed', date: 'Nov 02, 2025', time: '09:00 AM', completed: true },
            { status: 'Shipped', date: 'Nov 02, 2025', time: '05:00 PM', completed: true },
            { status: 'In Transit', date: 'Nov 03, 2025', time: '08:00 AM', completed: true },
            { status: 'Out for Delivery', date: 'Nov 04, 2025', time: '09:00 AM', completed: true },
            { status: 'Delivered', date: 'Nov 04, 2025', time: '01:00 PM', completed: true },
        ]
    },
    '#MOCK5678': {
        orderId: '#MOCK5678',
        userId: 'mockUser2',
        products: [{ id: 2, key: 'prod_2', name: 'Wireless Headphones', imageUrl: 'https://placehold.co/100x100.png', price: '₹4,999.00', quantity: 1, hint: "wireless headphones" }],
        address: { name: 'Jane D', city: 'Mumbai', pincode: '400050' },
        total: 4999.00,
        orderDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        isReturnable: true,
        timeline: [
             { status: 'Pending', date: 'Oct 26, 2025', time: '08:15 AM', completed: true },
             { status: 'Order Confirmed', date: 'Oct 26, 2025', time: '08:16 AM', completed: true },
             { status: 'Cancelled by seller', date: 'Oct 26, 2025', time: '09:00 AM', completed: true },
        ]
    }
};
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
        const storedOrdersJSON = localStorage.getItem(ORDERS_KEY);
        let allOrders: Order[] = [];
    
        if (storedOrdersJSON) {
            try {
                const localOrders = JSON.parse(storedOrdersJSON);
                if (Array.isArray(localOrders)) {
                    allOrders = localOrders;
                }
            } catch (e) {
                console.error("Could not parse orders from localStorage, using file data.", e);
            }
        }
    
        // If local storage is empty or invalid, initialize it with mock data
        if (allOrders.length === 0) {
            allOrders = Object.values(allOrderData);
            localStorage.setItem(ORDERS_KEY, JSON.stringify(allOrders));
        }

        const order = allOrders.find((o: Order) => o.orderId === orderId);
        return order || null;
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
