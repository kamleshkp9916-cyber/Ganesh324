
'use server';
/**
 * @fileOverview Manages customer inquiries from contact forms.
 */

import { z } from 'zod';
import { getFirestore, serverTimestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

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
  const db = getAdminFirestore();
  const validatedData = InquirySchema.omit({ createdAt: true }).parse(inquiryData);

  const docRef = await db.collection('inquiries').add({
    ...validatedData,
    createdAt: serverTimestamp(),
  });

  return { id: docRef.id };
}

export async function getInquiries(): Promise<(Inquiry & { id: string })[]> {
  const db = getAdminFirestore();
  const inquiriesRef = db.collection('inquiries');
  const q = inquiriesRef.orderBy('createdAt', 'desc');
  
  const snapshot = await q.get();
  
  if (snapshot.empty) {
    const mockInquiries: (Inquiry & { id: string })[] = [
      {
        id: 'inq_1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Business Collaboration Proposal',
        message: 'We would like to discuss a potential collaboration with your platform.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Business',
        priority: 'Medium',
        status: 'New',
        isArchived: false,
      },
      {
        id: 'inq_2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        subject: 'Issue with Seller Onboarding',
        message: 'I am stuck on the KYC verification step. Can someone help me?',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Seller Onboarding',
        priority: 'High',
        status: 'Open',
        assigneeId: 'Admin A',
        isArchived: false,
      },
      {
        id: 'inq_3',
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        subject: 'Feedback on the mobile app',
        message: 'The new feed design is great, but it feels a bit slow on my device.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'Feedback',
        priority: 'Low',
        status: 'Closed',
        isArchived: false,
      },
    ];
    return mockInquiries;
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
    const db = getAdminFirestore();
    const inquiryRef = db.collection('inquiries').doc(inquiryId);
    await inquiryRef.update(updates);
}

export async function convertInquiryToTicket(inquiryId: string): Promise<string> {
    const db = getAdminFirestore();
    const inquiryRef = db.collection('inquiries').doc(inquiryId);
    
    // In a real app, you'd create a new ticket in a 'tickets' collection.
    // For this demo, we'll just update the inquiry status.
    await inquiryRef.update({ status: "Open", isArchived: true });

    // This would be the new ticket ID
    return `TCK-${Date.now()}`;
}
