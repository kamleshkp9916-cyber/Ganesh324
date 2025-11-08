
'use server';
/**
 * @fileOverview Chat and conversation management flows for StreamCart.
 *
 * - getConversations: Fetches a list of conversations for the current user.
 * - getMessages: Fetches messages for a specific conversation.
 * - sendMessage: Sends a new message in a conversation.
 * - getOrCreateConversation: Gets an existing conversation or creates a new one.
 */

import { z } from 'genkit';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore, Timestamp, FieldValue, Filter, doc, collection, query, where, getDocs, orderBy, addDoc, updateDoc, increment } from 'firebase-admin/firestore';
import { UserData } from '@/lib/follow-data';
import { Message, Conversation } from '@/components/messaging/common';
import { format } from 'date-fns';


function getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
}

export async function getOrCreateConversation(currentUserId: string, otherUserId: string, currentUserData: UserData, otherUserData: UserData): Promise<string> {
    const db = getFirestore(getFirebaseAdminApp());
    const conversationId = getConversationId(currentUserId, otherUserId);
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();

    if (!conversationDoc.exists) {
        await conversationRef.set({
            participants: [currentUserId, otherUserId],
            participantData: {
                [currentUserId]: {
                    displayName: currentUserData.displayName,
                    photoURL: currentUserData.photoURL
                },
                [otherUserId]: {
                    displayName: otherUserData.displayName,
                    photoURL: otherUserData.photoURL
                }
            },
            lastMessage: "Conversation started.",
            lastMessageTimestamp: FieldValue.serverTimestamp(),
            unreadCount: { [currentUserId]: 0, [otherUserId]: 0 }
        });
    }

    return conversationId;
}


export async function getConversations(currentUserId: string): Promise<Conversation[]> {
    const db = getFirestore(getFirebaseAdminApp());
    const conversationsRef = db.collection('conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', currentUserId));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    
    const conversations: Conversation[] = snapshot.docs.map(doc => {
        const data = doc.data();
        const otherParticipantId = data.participants.find((p: string) => p !== currentUserId);
        const otherParticipantData = data.participantData[otherParticipantId] || {};
        
        return {
            conversationId: doc.id,
            userId: otherParticipantId,
            userName: otherParticipantData.displayName || 'Unknown User',
            avatarUrl: otherParticipantData.photoURL || 'https://placehold.co/40x40.png',
            lastMessage: data.lastMessage || '',
            lastMessageTimestamp: data.lastMessageTimestamp ? format(data.lastMessageTimestamp.toDate(), 'p') : '',
            unreadCount: data.unreadCount ? data.unreadCount[currentUserId] || 0 : 0,
        };
    });

    return conversations.sort((a, b) => b.lastMessageTimestamp.localeCompare(a.lastMessageTimestamp));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
    const db = getFirestore(getFirebaseAdminApp());
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp ? format(data.timestamp.toDate(), 'p') : 'sending...'
        } as Message;
    });
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  message: { text?: string; imageUrl?: string },
): Promise<void> {
    const db = getFirestore(getFirebaseAdminApp());
    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(conversationRef, 'messages');

    const newMessage = {
        ...message,
        senderId: senderId,
        timestamp: FieldValue.serverTimestamp(),
    };

    await addDoc(messagesRef, newMessage);

    const conversationDoc = await conversationRef.get();
    const conversationData = conversationDoc.data();
    if (conversationData) {
        const otherParticipantId = conversationData.participants.find((p: string) => p !== senderId);
        
        await updateDoc(conversationRef, {
            lastMessage: message.text || 'Image Sent',
            lastMessageTimestamp: FieldValue.serverTimestamp(),
            [`unreadCount.${otherParticipantId}`]: increment(1)
        });
    }
}

export async function updateOrderStatus(orderId: string, newStatus: string): Promise<void> {
  console.log(`Updating order ${orderId} to status: ${newStatus}`);
  // In a real app, you would update the order in Firestore here.
  // For example:
  // const db = getFirestore(getFirebaseAdminApp());
  // const orderRef = doc(db, 'orders', orderId);
  // await updateDoc(orderRef, {
  //     timeline: FieldValue.arrayUnion({
  //         status: newStatus,
  //         date: format(new Date(), 'MMM dd, yyyy'),
  //         time: format(new Date(), 'p'),
  //         completed: true,
  //     })
  // });
  return Promise.resolve();
}

export async function getOrderStatus(orderId: string): Promise<string> {
    console.log(`Getting status for order ${orderId}`);
    return "Not Implemented";
}

