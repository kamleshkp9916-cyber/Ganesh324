
'use server';
/**
 * @fileOverview A flow for handling contact form submissions.
 *
 * - submitInquiry - A function to save a user's inquiry to Firestore.
 * - InquirySchema - The Zod schema for an inquiry.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
// getFirebaseAdminApp();
// const db = getFirestore();

export const InquirySchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  createdAt: z.string().datetime().optional(),
  isRead: z.boolean().optional(),
});

export type Inquiry = z.infer<typeof InquirySchema>;

const submitInquiryFlow = ai.defineFlow(
  {
    name: 'submitInquiryFlow',
    inputSchema: InquirySchema,
    outputSchema: z.object({ id: z.string() }),
  },
  async (inquiry) => {
    const inquiryWithTimestamp = {
      ...inquiry,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // const docRef = await db.collection('inquiries').add(inquiryWithTimestamp);
    
    return { id: 'mock_inquiry_id' };
  }
);

export async function submitInquiry(inquiry: Omit<Inquiry, 'createdAt' | 'isRead'>): Promise<{ id: string }> {
  return await submitInquiryFlow(inquiry);
}

// Flow to retrieve all inquiries for the admin panel
const getInquiriesFlow = ai.defineFlow(
  {
    name: 'getInquiriesFlow',
    inputSchema: z.void(),
    outputSchema: z.array(z.custom<Inquiry & { id: string }>()),
  },
  async () => {
    // const snapshot = await db.collection('inquiries').orderBy('createdAt', 'desc').get();
    // if (snapshot.empty) {
    //   return [];
    // }
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry & { id: string }));
    return [];
  }
);

export async function getInquiries(): Promise<(Inquiry & { id: string })[]> {
  return getInquiriesFlow();
}

// Flow to mark an inquiry as read
const markInquiryReadFlow = ai.defineFlow(
    {
        name: 'markInquiryReadFlow',
        inputSchema: z.object({ id: z.string() }),
        outputSchema: z.void(),
    },
    async ({ id }) => {
        // await db.collection('inquiries').doc(id).update({ isRead: true });
    }
);

export async function markInquiryRead(id: string): Promise<void> {
    return markInquiryReadFlow({ id });
}
