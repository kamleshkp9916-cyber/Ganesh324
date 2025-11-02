
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
  "#STREAM704587": {
      orderId: "#STREAM704587",
      userId: "aDPVI1F2NAaKhvVi0Nq2BO5shqz1",
      products: [{ id: 13, key: "prod_13", name: "Classic White Shirt", imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&h=800&fit=crop", price: "₹1,999.00", quantity: 2, size: 'XXL' }],
      address: { city: "RAMGARH", village: "saunda basti manda tand patratu", country: "India", state: "Jharkhand", district: "ssssss", name: "Ganesh Prajapati", id: 1761033198028, phone: "+91 9174798550", pincode: "829133" },
      total: 4247.9,
      orderDate: "2025-11-01T04:47:40.741Z",
      isReturnable: true,
      timeline: [
        { status: "Order Confirmed", date: "Nov 01, 2025", time: "10:17 AM", completed: true },
        { status: "Packed", date: "Nov 02, 2025", time: "11:00 AM", completed: true },
        { status: "Shipped", date: "Nov 02, 2025", time: "06:30 PM", completed: true },
        { status: "In Transit: Arrived at local hub", date: "Nov 03, 2025", time: "08:00 AM", completed: true },
        { status: "Out for Delivery", date: "Nov 04, 2025", time: "09:00 AM", completed: false },
        { status: "Delivered", date: null, time: null, completed: false },
      ],
  },
  "#MOCK1234": {
      orderId: "#MOCK1234",
      userId: "aDPVI1F2NAaKhvVi0Nq2BO5shqz1",
      products: [{ id: 2, key: "prod_2", name: "Wireless Headphones", imageUrl: "https://picsum.photos/seed/headphones/800/800", price: "₹4,999.00", quantity: 1 }],
      address: { city: "Pune", village: "Koregaon Park", country: "India", state: "Maharashtra", district: "Pune", name: "Ganesh Prajapati", id: 1, phone: "+91 9876543210", pincode: "411001" },
      total: 5200.00,
      orderDate: "2025-10-28T14:30:00.000Z",
      isReturnable: true,
      timeline: [
        { status: "Order Confirmed", date: "Oct 28, 2025", time: "02:30 PM", completed: true },
        { status: "Packed", date: "Oct 29, 2025", time: "10:00 AM", completed: true },
        { status: "Shipped", date: "Oct 29, 2025", time: "05:00 PM", completed: true },
        { status: "Delivered", date: "Oct 31, 2025", time: "01:00 PM", completed: true },
      ],
  },
   "#MOCK5678": {
      orderId: "#MOCK5678",
      userId: "aDPVI1F2NAaKhvVi0Nq2BO5shqz1",
      products: [{ id: 5, key: "prod_5", name: "Leather Backpack", imageUrl: "https://picsum.photos/seed/leather-backpack/800/800", price: "₹6,200.00", quantity: 1 }],
      address: { city: "Mumbai", village: "Bandra", country: "India", state: "Maharashtra", district: "Mumbai", name: "Ganesh Prajapati", id: 2, phone: "+91 9876543211", pincode: "400050" },
      total: 6500.00,
      orderDate: "2025-10-25T11:00:00.000Z",
      isReturnable: true,
      timeline: [
        { status: "Order Confirmed", date: "Oct 25, 2025", time: "11:00 AM", completed: true },
        { status: "Cancelled by user", date: "Oct 25, 2025", time: "11:30 AM", completed: true },
      ],
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
