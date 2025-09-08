
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
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ title, message }) => {
    getFirebaseAdminApp();
    const db = getFirestore();

    // 1. Fetch all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    if (usersSnapshot.empty) {
        console.warn("No users found to send announcement to.");
        return { success: false, message: "No users found." };
    }

    const recipients = usersSnapshot.docs
        .map(doc => doc.data().email)
        .filter(email => !!email); // Filter out any users without an email

    if (recipients.length === 0) {
        console.warn("No users with valid emails found.");
        return { success: false, message: "No users with valid emails found." };
    }

    // 2. Call the sendNotificationEmail HTTP function
    // IMPORTANT: Replace with your actual deployed function URL
    const functionUrl = "https://us-central1-streamcart-login.cloudfunctions.net/sendNotificationEmail";
    
    try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: title,
                text: message, // Or use `html` field for HTML content
                recipients: recipients
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Failed to send announcement via HTTP function:", response.status, errorBody);
            throw new Error(`HTTP function failed with status ${response.status}: ${errorBody.error || 'Unknown error'}`);
        }
        
        const responseData = await response.json();
        console.log(`Announcement sent to ${responseData.sent} users.`);
        return { success: true, message: `Announcement sent to ${responseData.sent} users.` };

    } catch (error: any) {
        console.error("Error calling sendNotificationEmail function:", error);
        return { success: false, message: error.message || "An unknown error occurred." };
    }
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

export async function sendAnnouncement(title: string, message: string): Promise<{ success: boolean; message: string }> {
  return sendAnnouncementFlow({ title, message });
}

export async function sendWarning(userId: string, message: string): Promise<{ success: boolean }> {
  return sendWarningFlow({ userId, message });
}
