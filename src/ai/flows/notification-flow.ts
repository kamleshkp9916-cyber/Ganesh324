
'use server';
/**
 * @fileOverview A flow for handling admin notifications.
 *
 * - sendAnnouncement: Sends a notification to all users.
 * - sendWarning: Sends a direct warning to a specific user.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-server';

// Schema for sending a broadcast announcement
const SendAnnouncementSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
});

// Schema for sending a direct warning
const SendWarningSchema = z.object({
  userId: z.string().min(1), // Can be UID or email, we'll need to resolve it
  message: z.string().min(1),
});

const sendAnnouncementFlow = ai.defineFlow(
  {
    name: 'sendAnnouncementFlow',
    inputSchema: SendAnnouncementSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ title, message }) => {
    getFirebaseAdminApp();
    const db = getFirestore();

    await db.collection('notifications').add({
      type: 'announcement',
      title,
      message,
      createdAt: FieldValue.serverTimestamp(),
      sentTo: 'all',
    });
    
    console.log(`Announcement sent: "${title}"`);
    return { success: true };
  }
);

const sendWarningFlow = ai.defineFlow(
  {
    name: 'sendWarningFlow',
    inputSchema: SendWarningSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ userId, message }) => {
    getFirebaseAdminApp();
    const db = getFirestore();
    
    // In a real app, you might want to resolve email to UID here
    // For now, we'll just store the provided userId (which could be email or UID)
    await db.collection('notifications').add({
      type: 'warning',
      message,
      userId: userId,
      createdAt: FieldValue.serverTimestamp(),
      read: false, // Warnings should be dismissible
    });
    
    console.log(`Warning sent to user: ${userId}`);
    return { success: true };
  }
);

export async function sendAnnouncement(title: string, message: string): Promise<{ success: boolean }> {
  return sendAnnouncementFlow({ title, message });
}

export async function sendWarning(userId: string, message: string): Promise<{ success: boolean }> {
  return sendWarningFlow({ userId, message });
}
