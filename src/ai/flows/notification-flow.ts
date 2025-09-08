
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
import * as admin from 'firebase-admin';

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
    outputSchema: z.object({ success: z.boolean(), message: z.string() }),
  },
  async ({ userId, message }) => {
    getFirebaseAdminApp();
    const db = getFirestore();
    let userEmail: string | undefined;

    // 1. Determine if userId is an email or UID and get the email address
    if (userId.includes('@')) {
        userEmail = userId;
    } else {
        try {
            const userRecord = await admin.auth().getUser(userId);
            userEmail = userRecord.email;
        } catch (error) {
            console.error(`Could not find user with UID: ${userId}`, error);
            return { success: false, message: "User not found. Please provide a valid UID or email." };
        }
    }
    
    if (!userEmail) {
        return { success: false, message: "Could not determine user's email address." };
    }

    // 2. Add notification to the database (for in-app display)
    await db.collection('notifications').add({
      type: 'warning',
      message,
      userId: userId, // Store the original identifier
      createdAt: FieldValue.serverTimestamp(),
      read: false,
    });

    // 3. Call the sendNotificationEmail HTTP function to send an email
    const functionUrl = "https://us-central1-streamcart-login.cloudfunctions.net/sendNotificationEmail";
     try {
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subject: "Warning from StreamCart",
                html: `<p>You have received a warning from a StreamCart administrator:</p><br><p><strong>${message}</strong></p><br><p>Please review our community guidelines. Further violations may result in account suspension.</p>`,
                recipients: [userEmail]
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Failed to send warning email via HTTP function:", response.status, errorBody);
            throw new Error(`HTTP function failed with status ${response.status}: ${errorBody.error || 'Unknown error'}`);
        }
        
        console.log(`Warning email sent to ${userEmail}`);
        return { success: true, message: `Warning successfully sent to ${userEmail}.` };

    } catch (error: any) {
        console.error("Error calling sendNotificationEmail function for warning:", error);
        return { success: false, message: error.message || "An unknown error occurred while sending the email." };
    }
  }
);

export async function sendAnnouncement(title: string, message: string): Promise<{ success: boolean; message: string }> {
  return sendAnnouncementFlow({ title, message });
}

export async function sendWarning(userId: string, message: string): Promise<{ success: boolean; message: string; }> {
  return sendWarningFlow({ userId, message });
}
