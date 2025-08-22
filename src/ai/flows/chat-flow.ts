
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
  "default": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'them', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'me', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'them', timestamp: '10:01 AM' },
  ],
};

const getMessagesFlow = ai.defineFlow(
  {
    name: 'getMessagesFlow',
    inputSchema: GetMessagesInputSchema,
    outputSchema: GetMessagesOutputSchema,
  },
  async ({ userId }) => {
    console.log(`Getting messages for userId: ${userId}`);
    // In a real app, you would fetch this from a database like Firestore.
    return mockChatDatabase[userId] || mockChatDatabase['default'];
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
        mockChatDatabase[userId] = [...mockChatDatabase['default']];
    }
    
    const currentMessages = mockChatDatabase[userId];
    const newMessage: Message = {
      id: currentMessages.length + 1,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message,
    };
    
    currentMessages.push(newMessage);
    console.log(`Sending message for userId: ${userId}`, newMessage);

    // In a real app, you would save this to a database.
    mockChatDatabase[userId] = currentMessages;

    return currentMessages;
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

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
    return updateOrderStatusFlow({ orderId, status });
}
