
'use server';
/**
 * @fileOverview Manages customer inquiries from contact forms.
 */

import { z } from 'zod';
import { getFirebaseAdminApp } from '@/lib/firebase-server';
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore';

const InquirySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
  createdAt: z.string().optional(),
  category: z.enum(["Business", "Seller Onboarding", "Collaboration", "Legal", "Feedback", "Other"]).default("Other"),
  priority: z.enum(["Low", "Medium", "High"]).default("Low"),
  status: z.enum(["New", "Open", "Pending", "Closed"]).default("New"),
  assigneeId: z.string().optional(),
  isArchived: z.boolean().default(false),
});

export type Inquiry = z.infer<typeof InquirySchema>;

export async function submitInquiry(inquiryData: Omit<Inquiry, 'createdAt'>): Promise<{ id: string }> {
  const db = getFirestore(getFirebaseAdminApp());
  const validatedData = InquirySchema.omit({ createdAt: true }).parse(inquiryData);

  const docRef = await db.collection('inquiries').add({
    ...validatedData,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id };
}

export async function getInquiries(): Promise<(Inquiry & { id: string })[]> {
  const db = getFirestore(getFirebaseAdminApp());
  const inquiriesRef = db.collection('inquiries');
  const q = inquiriesRef.orderBy('createdAt', 'desc');
  
  const snapshot = await q.get();
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
    } as Inquiry & { id: string };
  });
}

export async function updateInquiry(inquiryId: string, updates: Partial<Inquiry>): Promise<void> {
    const db = getFirestore(getFirebaseAdminApp());
    const inquiryRef = db.collection('inquiries').doc(inquiryId);
    await inquiryRef.update(updates);
}

export async function convertInquiryToTicket(inquiryId: string): Promise<string> {
    const db = getFirestore(getFirebaseAdminApp());
    const inquiryRef = db.collection('inquiries').doc(inquiryId);
    
    // In a real app, you'd create a new ticket in a 'tickets' collection.
    // For this demo, we'll just update the inquiry status.
    await inquiryRef.update({ status: "Open", isArchived: true });

    // This would be the new ticket ID
    return `TCK-${Date.now()}`;
}
