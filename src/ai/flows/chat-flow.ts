
'use server';
/**
 * @fileOverview A mock chat backend using Genkit flows.
 *
 * - getMessages - A function to retrieve the chat history for a user.
 * - sendMessage - A function to send a message and get the updated history.
 * - Message - The type for a chat message.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { allOrderData, Order, OrderId } from '@/lib/order-data';
import { format } from 'date-fns';
import { getFirestore, query, collection, where, getDocs, writeBatch } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import type { CartProduct } from '@/lib/product-history';

getFirebaseAdminApp();
const db = getFirestore();

// TEMPORARY: Grant admin access to a specific user
(async () => {
    try {
        console.log("Attempting to grant admin access...");
        const emailToMakeAdmin = 'kamleshkp9916@gmail.com';
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', emailToMakeAdmin));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`Admin promotion failed: User with email ${emailToMakeAdmin} not found.`);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        // Check if already admin to avoid unnecessary writes
        if (userDoc.data().role === 'admin') {
            console.log(`User ${emailToMakeAdmin} is already an admin.`);
            return;
        }

        const batch = writeBatch(db);
        batch.update(userDoc.ref, { role: 'admin' });
        await batch.commit();
        console.log(`Successfully granted admin access to ${emailToMakeAdmin}.`);
    } catch (error) {
        console.error("Error granting admin access:", error);
    }
})();


const MessageSchema = z.object({
  id: z.number(),
  text: z.string().optional(),
  sender: z.string(), // 'customer' or 'seller'
  timestamp: z.string(),
  image: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export type Conversation = {
    userId: string;
    userName: string;
    avatarUrl: string;
    lastMessage: string;
    lastMessageTimestamp: string;
    unreadCount: number;
    isExecutive?: boolean;
}

const GetMessagesInputSchema = z.object({
  userId: z.string(),
});

const GetMessagesOutputSchema = z.array(MessageSchema);
export type GetMessagesOutput = z.infer<typeof GetMessagesOutputSchema>;

const SendMessageInputSchema = z.object({
  userId: z.string(),
  message: z.object({
    text: z.string().optional(),
    image: z.string().optional(),
  }),
  from: z.enum(['customer', 'seller']),
});

const SendMessageOutputSchema = z.array(MessageSchema);
export type SendMessageOutput = z.infer<typeof SendMessageOutputSchema>;

const UpdateOrderStatusInputSchema = z.object({
    orderId: z.string(),
    status: z.string(),
});

const CreateOrderInputSchema = z.object({
    userId: z.string(),
    cartItems: z.array(z.any()),
    address: z.any(),
    total: z.number(),
});

// Mock database
const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'customer', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", sender: 'customer', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", sender: 'seller', timestamp: 'Yesterday' },
  ],
  "HomeHaven": [
       { id: 1, text: "Do you have the ceramic vases in blue?", sender: 'customer', timestamp: 'Yesterday' },
  ]
};

const mockConversations: Conversation[] = [
    {
        userId: "FashionFinds",
        userName: "FashionFinds",
        avatarUrl: "https://placehold.co/40x40.png",
        lastMessage: "Awesome! Could you tell me a bit more about the lens?",
        lastMessageTimestamp: "10:01 AM",
        unreadCount: 1,
    },
    {
        userId: "GadgetGuru",
        userName: "GadgetGuru",
        avatarUrl: "https://placehold.co/40x40.png",
        lastMessage: "Sure, what would you like to know?",
        lastMessageTimestamp: "Yesterday",
        unreadCount: 0,
    },
    {
        userId: "HomeHaven",
        userName: "HomeHaven",
        avatarUrl: "https://placehold.co/40x40.png",
        lastMessage: "Do you have the ceramic vases in blue?",
        lastMessageTimestamp: "Yesterday",
        unreadCount: 2,
    },
     {
        userId: "ArtisanAlley",
        userName: "ArtisanAlley",
        avatarUrl: "https://placehold.co/40x40.png",
        lastMessage: "Perfect, I'll take it!",
        lastMessageTimestamp: "2 days ago",
        unreadCount: 0,
    },
     {
        userId: "GamerGuild",
        userName: "GamerGuild",
        avatarUrl: "https://placehold.co/40x40.png",
        lastMessage: "Is the tournament open for registration?",
        lastMessageTimestamp: "3 days ago",
        unreadCount: 0,
    }
]

const getMessagesFlow = ai.defineFlow(
  {
    name: 'getMessagesFlow',
    inputSchema: GetMessagesInputSchema,
    outputSchema: GetMessagesOutputSchema,
  },
  async ({ userId }) => {
    console.log(`Getting messages for userId: ${userId}`);
    return mockChatDatabase[userId] || [];
  }
);

const sendMessageFlow = ai.defineFlow(
  {
    name: 'sendMessageFlow',
    inputSchema: SendMessageInputSchema,
    outputSchema: SendMessageOutputSchema,
  },
  async ({ userId, message, from }) => {
    if (!mockChatDatabase[userId]) {
        mockChatDatabase[userId] = [];
    }
    
    const currentMessages = mockChatDatabase[userId];

    const newMessage: Message = {
      id: currentMessages.length + 1,
      sender: from,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message,
    };
    
    currentMessages.push(newMessage);
    
    mockChatDatabase[userId] = currentMessages;

    // Update conversation list
    const convo = mockConversations.find(c => c.userId === userId);
    if (convo) {
        convo.lastMessage = newMessage.text || "Image sent";
        convo.lastMessageTimestamp = newMessage.timestamp;
    }

    return currentMessages;
  }
);

const getConversationsFlow = ai.defineFlow(
    {
        name: 'getConversationsFlow',
        inputSchema: z.void(),
        outputSchema: z.array(z.custom<Conversation>()),
    },
    async () => {
        return mockConversations;
    }
);


const updateOrderStatusFlow = ai.defineFlow(
    {
        name: 'updateOrderStatusFlow',
        inputSchema: UpdateOrderStatusInputSchema,
        outputSchema: z.void(),
    },
    async ({ orderId, status }) => {
        // This flow now needs to update Firestore
        const orderRef = db.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (orderDoc.exists) {
            const orderData = orderDoc.data() as Order;
            let newTimeline = orderData.timeline;

            if (status === 'Return Initiated') {
                newTimeline = newTimeline.filter(step => step.completed);
                newTimeline.push({
                    status: "Return Initiated: The recipient has initiated a return of the package.",
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'hh:mm a'),
                    completed: true
                });
                newTimeline.push({ status: "Return package picked up", date: null, time: null, completed: false });
                newTimeline.push({ status: "Returned", date: null, time: null, completed: false });
            } else {
                newTimeline.push({
                    status: status,
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'hh:mm a'),
                    completed: true
                });
            }

            await orderRef.update({ timeline: newTimeline });
            console.log(`Updated status for order ${orderId} to ${status}`);
        } else {
            console.error(`Order with ID ${orderId} not found.`);
            throw new Error(`Order not found`);
        }
    }
);

const createOrderFlow = ai.defineFlow(
  {
    name: 'createOrderFlow',
    inputSchema: CreateOrderInputSchema,
    outputSchema: z.object({ orderId: z.string() }),
  },
  async ({ userId, cartItems, address, total }) => {
    const orderId = `#STREAM${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    
    const orderData = {
        orderId,
        userId,
        products: cartItems,
        address,
        total,
        orderDate: format(now, 'MMM dd, yyyy'),
        isReturnable: true,
        timeline: [
            { status: "Order Confirmed", date: format(now, 'MMM dd, yyyy'), time: format(now, 'hh:mm a'), completed: true },
            { status: "Packed", date: null, time: null, completed: false },
            { status: "Shipped", date: null, time: null, completed: false },
            { status: "Out for Delivery", date: null, time: null, completed: false },
            { status: "Delivered", date: null, time: null, completed: false },
        ]
    };

    await db.collection('orders').doc(orderId).set(orderData);
    
    return { orderId };
  }
);

export async function getMessages(userId: string): Promise<GetMessagesOutput> {
    return getMessagesFlow({ userId });
}

export async function sendMessage(
  userId: string,
  message: { text?: string; image?: string },
  from: 'customer' | 'seller'
): Promise<SendMessageOutput> {
  return sendMessageFlow({ userId, message, from });
}

export async function getConversations(): Promise<Conversation[]> {
    return getConversationsFlow();
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    return updateOrderStatusFlow({ orderId, status });
}

export async function createOrder(
    userId: string, 
    cartItems: CartProduct[], 
    address: any, 
    total: number
): Promise<{orderId: string}> {
  return createOrderFlow({ userId, cartItems, address, total });
}
