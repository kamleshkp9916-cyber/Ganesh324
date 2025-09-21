
'use server';
/**
 * @fileOverview Chat and conversation management flows for StreamCart.
 *
 * - getConversations: Fetches a list of conversations for the current user.
 * - getMessages: Fetches messages for a specific conversation.
 * - sendMessage: Sends a new message in a conversation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { UserData } from '@/lib/follow-data';

// Mock data to stand in for real database interactions
const mockChatDatabase: Record<string, any[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'customer', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", sender: 'customer', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", sender: 'seller', timestamp: 'Yesterday' },
  ],
  "StreamCart": [
      { id: 1, text: "Welcome to StreamCart support!", sender: 'StreamCart', timestamp: 'Yesterday' },
  ]
};

const mockConversations: any[] = [
    { userId: "FashionFinds", userName: "FashionFinds", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Awesome! Could you tell me a bit more about the lens?", lastMessageTimestamp: "10:01 AM", unreadCount: 1 },
    { userId: "GadgetGuru", userName: "GadgetGuru", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Sure, what would you like to know?", lastMessageTimestamp: "Yesterday", unreadCount: 0 },
];


export async function getConversations(): Promise<any[]> {
    // In a real implementation, you would use the current user's ID to fetch
    // conversations where they are a participant from Firestore.
    return Promise.resolve(mockConversations);
}

export async function getMessages(otherUserId: string): Promise<any[]> {
    // In a real implementation, this would query the 'messages' subcollection
    // of a conversation document shared between the current user and otherUserId.
    return Promise.resolve(mockChatDatabase[otherUserId] || []);
}


export async function sendMessage(
  otherUserId: string,
  message: { text?: string; imageUrl?: string },
  fromRole: 'customer' | 'seller' | 'StreamCart'
): Promise<any[]> {
    const newMessage = {
        id: Date.now(),
        ...message,
        sender: fromRole,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!mockChatDatabase[otherUserId]) {
        mockChatDatabase[otherUserId] = [];
    }
    mockChatDatabase[otherUserId].push(newMessage);

    // Also update the last message in the mock conversation
    const convoIndex = mockConversations.findIndex(c => c.userId === otherUserId);
    if (convoIndex > -1) {
        mockConversations[convoIndex].lastMessage = message.text || 'Image Sent';
        mockConversations[convoIndex].lastMessageTimestamp = newMessage.timestamp;
    }

    return Promise.resolve(mockChatDatabase[otherUserId]);
}
