

import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreDb } from './firebase';

// This file now primarily serves as a definition for the Order type and for fallback mock data.
// The real data will be fetched from Firestore.

export const allOrderData: Record<string, Omit<Order, 'orderId'>> = {
    "#STREAM5896": {
        userId: "mockUser",
        products: [{ productId: "prod_1", name: "Vintage Camera", imageUrl: "https://placehold.co/150x150.png", hint: "vintage camera", price: "₹12,500.00" }],
        address: {}, // Add mock address
        total: 12500,
        orderDate: "Jul 27, 2024",
        isReturnable: true,
        timeline: [
            { status: "Order Confirmed", date: "Jul 27, 2024", time: "10:31 PM", completed: true },
            { status: "Packed", date: "Jul 28, 2024", time: "09:00 AM", completed: true },
            { status: "Shipped: The package has left the sender's location.", date: "Jul 28, 2024", time: "05:00 PM", completed: true },
            { status: "In Transit: The package is on its way to the recipient.", date: "Jul 29, 2024", time: "Current status", completed: true },
            { status: "Out for Delivery", date: null, time: null, completed: false },
            { status: "Delivered", date: null, time: null, completed: false },
        ]
    },
    // Other mock orders can be kept for fallback or testing, but are no longer the source of truth
};

export type OrderData = typeof allOrderData;
export type OrderId = keyof OrderData;

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
};

export function getStatusFromTimeline(timeline: Order['timeline']): string {
    const lastCompletedStep = [...timeline].reverse().find(step => step.completed);
    if (!lastCompletedStep) return "Unknown";
    return lastCompletedStep.status.split(':')[0].trim();
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    const db = getFirestoreDb();
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (orderDoc.exists()) {
        return { ...orderDoc.data(), orderId: orderDoc.id } as Order;
    } else {
        // Fallback to mock data for demo purposes if not in Firestore
        const mockOrder = allOrderData[orderId as OrderId];
        if (mockOrder) {
            // Add the mock order to Firestore for future consistency
            try {
                await addDoc(collection(db, 'orders'), {
                    ...mockOrder,
                    orderDate: serverTimestamp() // Use a server timestamp for sorting
                });
            } catch (e) {
                console.error("Error saving mock order to Firestore", e);
            }
            return { ...mockOrder, orderId };
        }
        return null;
    }
}
