
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
import { allOrderData, OrderId } from '@/lib/order-data';
import { format } from 'date-fns';

const MessageSchema = z.object({
  id: z.number(),
  text: z.string().optional(),
  sender: z.enum(['me', 'them']),
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
});

const SendMessageOutputSchema = z.array(MessageSchema);
export type SendMessageOutput = z.infer<typeof SendMessageOutputSchema>;

const UpdateOrderStatusInputSchema = z.object({
    orderId: z.string(),
    status: z.string(),
});

// Mock database
const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'them', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'me', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'them', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", sender: 'them', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", sender: 'me', timestamp: 'Yesterday' },
  ],
  "HomeHaven": [
       { id: 1, text: "Do you have the ceramic vases in blue?", sender: 'them', timestamp: 'Yesterday' },
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
  async ({ userId, message }) => {
    if (!mockChatDatabase[userId]) {
        mockChatDatabase[userId] = [];
    }
    
    const currentMessages = mockChatDatabase[userId];
    const newMessage: Message = {
      id: currentMessages.length + 1,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message,
    };
    
    currentMessages.push(newMessage);
    
    // Also add a mock response for demonstration
    const botResponse: Message = {
      id: currentMessages.length + 1,
      sender: 'them',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Thanks for your message! I'll get back to you shortly.",
    };
    currentMessages.push(botResponse);

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
        const order = allOrderData[orderId as OrderId];
        if (order) {
            // If the order is being returned, add the full return sequence.
            if (status === 'Return Initiated') {
                 // Remove any non-completed steps from the timeline before adding the return sequence
                order.timeline = order.timeline.filter(step => step.completed);
                order.timeline.push({
                    status: "Return Initiated: The recipient has initiated a return of the package.",
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'hh:mm a'),
                    completed: true
                });
                 order.timeline.push({
                    status: "Return package picked up",
                    date: null,
                    time: null,
                    completed: false
                });
                order.timeline.push({
                    status: "Returned",
                    date: null,
                    time: null,
                    completed: false
                });
            } else {
                 // For other status updates like cancellation, just add a single step.
                order.timeline.push({
                    status: status,
                    date: format(new Date(), 'MMM dd, yyyy'),
                    time: format(new Date(), 'hh:mm a'),
                    completed: true
                });
            }
            console.log(`Updated status for order ${orderId} to ${status}`);
        } else {
            console.error(`Order with ID ${orderId} not found.`);
            throw new Error(`Order not found`);
        }
    }
);


export async function getMessages(userId: string): Promise<GetMessagesOutput> {
    return getMessagesFlow({ userId });
}

export async function sendMessage(userId: string, message: { text?: string; image?: string }): Promise<SendMessageOutput> {
    return sendMessageFlow({ userId, message });
}

export async function getConversations(): Promise<Conversation[]> {
    return getConversationsFlow();
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    return updateOrderStatusFlow({ orderId, status });
}
