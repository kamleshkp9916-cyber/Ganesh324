
'use server';
/**
 * @fileOverview A chat backend for user-to-executive communication.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
getFirebaseAdminApp();
const db = getFirestore();

// Mock database for executive chats
const mockExecutiveDatabase: Record<string, Message[]> = {};

const MessageSchema = z.object({
  id: z.number(),
  text: z.string().optional(),
  sender: z.string(), // 'customer' or the name of the executive/StreamCart
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
  from: z.string(), // Name of sender
});
const SendMessageOutputSchema = z.array(MessageSchema);
export type SendMessageOutput = z.infer<typeof SendMessageOutputSchema>;


const getExecutiveMessagesFlow = ai.defineFlow(
  {
    name: 'getExecutiveMessagesFlow',
    inputSchema: GetMessagesInputSchema,
    outputSchema: GetMessagesOutputSchema,
  },
  async ({ userId }) => {
    const docRef = db.collection('executiveChats').doc(userId);
    const doc = await docRef.get();
    if (!doc.exists) {
        return [];
    }
    const data = doc.data();
    return (data?.messages || []) as Message[];
  }
);


const sendExecutiveMessageFlow = ai.defineFlow(
  {
    name: 'sendExecutiveMessageFlow',
    inputSchema: SendMessageInputSchema,
    outputSchema: SendMessageOutputSchema,
  },
  async ({ userId, message, from }) => {
    const docRef = db.collection('executiveChats').doc(userId);

    const newMessage: Message = {
      id: Date.now(),
      sender: from,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...message,
    };

    const doc = await docRef.get();
    if (!doc.exists) {
        await docRef.set({ messages: [newMessage] });
    } else {
        await docRef.update({
            messages: FieldValue.arrayUnion(newMessage)
        });
    }

    const updatedDoc = await docRef.get();
    return (updatedDoc.data()?.messages || []) as Message[];
  }
);


export async function getExecutiveMessages(userId: string): Promise<GetMessagesOutput> {
    return getExecutiveMessagesFlow({ userId });
}

export async function sendExecutiveMessage(
  userId: string,
  message: { text?: string; image?: string },
  from: string
): Promise<SendMessageOutput> {
  return sendExecutiveMessageFlow({ userId, message, from });
}
